const Interview = require('../models/Interview');
const { generateJSON, generateContent } = require('../utils/geminiClient');

// @desc    Start a new AI Mock Interview
// @route   POST /api/interview/start
// @access  Private
const startInterview = async (req, res) => {
  try {
    const { jobRole, difficulty } = req.body;

    const prompt = `You are an expert technical interviewer. Generate ${difficulty === 'Hard' ? 7 : difficulty === 'Medium' ? 5 : 3} interview questions for the role of "${jobRole}" at ${difficulty} difficulty level.

Return a JSON object with:
{
  "questions": [
    { "question": "Interview question here" }
  ]
}

Mix technical, behavioral, and situational questions appropriate for the role.`;

    const data = await generateJSON(prompt);

    const interview = await Interview.create({
      user: req.user._id,
      jobRole,
      difficulty,
      questions: data.questions,
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit interview answers and get feedback
// @route   PUT /api/interview/:id/submit
// @access  Private
const submitAnswers = async (req, res) => {
  try {
    const { answers } = req.body; // array of { questionIndex, answer }
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Add answers to questions
    answers.forEach(({ questionIndex, answer }) => {
      interview.questions[questionIndex].answer = answer;
    });

    // Generate feedback for each answer using Gemini
    for (let i = 0; i < interview.questions.length; i++) {
      const q = interview.questions[i];
      if (!q.answer) continue;

      const prompt = `You are an expert interviewer evaluating an answer for the role of "${interview.jobRole}".

Question: ${q.question}
Candidate's Answer: ${q.answer}

Return a JSON object:
{
  "feedback": "Detailed feedback on the answer (2-3 sentences)",
  "score": (number 1-10),
  "improvements": "One key improvement suggestion"
}`;

      const result = await generateJSON(prompt);
      interview.questions[i].feedback = `${result.feedback} Improvement: ${result.improvements}`;
      interview.questions[i].score = result.score;
    }

    // Generate overall feedback
    const scores = interview.questions.map((q) => q.score || 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    const overallPrompt = `Based on a mock interview for "${interview.jobRole}", the candidate scored ${avgScore.toFixed(1)}/10 overall. 
Questions and answers: ${JSON.stringify(interview.questions.map((q) => ({ q: q.question, a: q.answer })))}

Write a brief overall performance summary (3-4 sentences) highlighting strengths and main areas to improve.`;

    interview.overallFeedback = await generateContent(overallPrompt);
    interview.overallScore = Math.round(avgScore * 10);
    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.markModified('questions');
    await interview.save();

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all interviews for user
// @route   GET /api/interview
// @access  Private
const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single interview
// @route   GET /api/interview/:id
// @access  Private
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { startInterview, submitAnswers, getInterviews, getInterview };
