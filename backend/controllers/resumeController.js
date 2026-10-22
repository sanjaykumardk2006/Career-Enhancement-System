const Resume = require('../models/Resume');
const { generateJSON } = require('../utils/geminiClient');

// @desc    Get user's resume
// @route   GET /api/resume
// @access  Private
const getResume = async (req, res) => {
  try {
    let resume = await Resume.findOne({ user: req.user._id });
    if (!resume) {
      resume = await Resume.create({
        user: req.user._id,
        personalInfo: { name: req.user.name, email: req.user.email },
      });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update/save resume builder data
// @route   PUT /api/resume
// @access  Private
const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { user: req.user._id },
      { ...req.body },
      { returnDocument: 'after', upsert: true }
    );
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload resume file
// @route   POST /api/resume/upload
// @access  Private
const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const resume = await Resume.findOneAndUpdate(
      { user: req.user._id },
      { uploadedFile: req.file.filename },
      { returnDocument: 'after', upsert: true }
    );
    res.json({ message: 'Resume uploaded successfully', filename: req.file.filename, resume });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    AI Resume Analysis
// @route   POST /api/resume/analyze
// @access  Private
const analyzeResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found. Please build your resume first.' });

    const summary = resume.summary || req.user.bio || '';
    const skills = (resume.skills && resume.skills.length > 0)
      ? resume.skills
      : (req.user.skills || []).map((s) => ({ name: s, level: 'Intermediate' }));
    const careerGoal = req.user.careerGoal || 'Software Engineer';

    const resumeText = JSON.stringify({
      candidateName: resume.personalInfo?.name || req.user.name,
      careerGoal,
      summary,
      skills,
      experience: resume.experience || [],
      education: resume.education || [],
      projects: resume.projects || [],
      certifications: resume.certifications || [],
      uploadedDocument: resume.uploadedFile || null,
    });

    const prompt = `You are an expert resume reviewer. Analyze the following resume data and provide detailed feedback:

Resume Data: ${resumeText}

Return a JSON object with:
{
  "score": (number 0-100 representing overall resume quality),
  "strengths": (array of 3-5 strong points),
  "weaknesses": (array of 3-5 areas needing improvement),
  "suggestions": (array of 5-7 specific actionable suggestions),
  "keywords": (array of 10-15 important keywords present in the resume)
}`;

    const analysis = await generateJSON(prompt);
    resume.aiAnalysis = { ...analysis, analyzedAt: new Date() };
    await resume.save();
    res.json(resume.aiAnalysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getResume, updateResume, uploadResume, analyzeResume };
