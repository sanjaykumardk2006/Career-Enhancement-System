const Resume = require('../models/Resume');
const User = require('../models/User');
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

    // Compute dynamic real ATS score
    const { score } = calculateRealAtsScore(resume, req.user);
    resume.atsScore = score;
    await resume.save();

    // Sync with User profile
    const userUpdates = {};
    if (resume.personalInfo?.name) userUpdates.name = resume.personalInfo.name;
    if (resume.personalInfo?.phone) userUpdates.phone = resume.personalInfo.phone;
    if (resume.summary) userUpdates.bio = resume.summary;
    if (Array.isArray(resume.skills) && resume.skills.length > 0) {
      const skillNames = resume.skills.map((s) => (typeof s === 'string' ? s : s.name)).filter(Boolean);
      if (skillNames.length > 0) userUpdates.skills = skillNames;
    }
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdates);
    }

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

// Objective Dynamic ATS Scoring Algorithm
const calculateRealAtsScore = (resume, user) => {
  const breakdown = {
    contact: 0,
    summary: 0,
    skills: 0,
    experienceAndProjects: 0,
    educationAndCerts: 0,
  };

  const p = resume.personalInfo || {};
  if (p.name || user?.name) breakdown.contact += 5;
  if (p.email || user?.email) breakdown.contact += 5;
  if (p.phone || user?.phone) breakdown.contact += 5;
  if (p.linkedin || p.github || p.portfolio) breakdown.contact += 5;

  const sumText = (resume.summary || user?.bio || '').trim();
  const wordCount = sumText ? sumText.split(/\s+/).length : 0;
  if (wordCount >= 25) breakdown.summary += 15;
  else if (wordCount >= 10) breakdown.summary += 8;
  else if (wordCount > 0) breakdown.summary += 4;

  const skillsCount = (resume.skills && resume.skills.length > 0) ? resume.skills.length : (user?.skills || []).length;
  if (skillsCount >= 8) breakdown.skills += 25;
  else if (skillsCount >= 5) breakdown.skills += 18;
  else if (skillsCount >= 3) breakdown.skills += 12;
  else if (skillsCount >= 1) breakdown.skills += 6;

  const expCount = (resume.experience || []).length;
  const projCount = (resume.projects || []).length;
  if (expCount >= 2 || (expCount >= 1 && projCount >= 1)) breakdown.experienceAndProjects += 25;
  else if (expCount >= 1 || projCount >= 2) breakdown.experienceAndProjects += 18;
  else if (projCount === 1) breakdown.experienceAndProjects += 10;

  const eduCount = (resume.education || []).length;
  const certCount = (resume.certifications || []).length;
  if (eduCount >= 1 && certCount >= 1) breakdown.educationAndCerts += 15;
  else if (eduCount >= 1) breakdown.educationAndCerts += 10;
  else if (certCount >= 1) breakdown.educationAndCerts += 6;

  const rawScore = breakdown.contact + breakdown.summary + breakdown.skills + breakdown.experienceAndProjects + breakdown.educationAndCerts;
  const score = Math.min(100, Math.max(10, rawScore));
  return { score, breakdown };
};

// @desc    Real AI ATS Resume Analysis & Scoring
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

    // Compute deterministic real ATS score from actual sections
    const { score: realAtsScore, breakdown } = calculateRealAtsScore(resume, req.user);

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
      evaluatedAtsScore: realAtsScore,
    });

    const prompt = `You are a certified corporate Applicant Tracking System (ATS) evaluator and executive resume auditor.
Evaluate this candidate's resume for the target role of "${careerGoal}".
The calculated ATS section score is ${realAtsScore}/100 based on completeness.

Resume Data: ${resumeText}

Return a JSON object strictly in this structure:
{
  "score": ${realAtsScore},
  "strengths": (array of 3-5 specific verified strengths from their actual resume content),
  "weaknesses": (array of 3-5 critical ATS formatting or content weaknesses),
  "suggestions": (array of 5-7 actionable, high-impact improvements to boost ATS ranking),
  "keywords": (array of 8-12 ATS keywords that should be present or emphasized for "${careerGoal}")
}`;

    const analysis = await generateJSON(prompt);
    // Guarantee score matches the real ATS evaluation
    const finalScore = analysis.score && typeof analysis.score === 'number'
      ? Math.round((analysis.score + realAtsScore) / 2)
      : realAtsScore;

    resume.aiAnalysis = {
      ...analysis,
      score: finalScore,
      breakdown,
      analyzedAt: new Date(),
    };
    await resume.save();
    res.json(resume.aiAnalysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getResume, updateResume, uploadResume, analyzeResume };
