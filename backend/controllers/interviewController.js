const Interview = require('../models/Interview');
const { generateJSON, generateContent } = require('../utils/geminiClient');

// Helper to normalize and match MCQ options
const extractOptionLetter = (str) => {
  if (!str) return '';
  const match = str.trim().match(/^([A-D])[\s.):-]/i);
  return match ? match[1].toUpperCase() : '';
};

const isOptionMatching = (chosen, correct) => {
  if (!chosen || !correct) return false;
  const chosenLetter = extractOptionLetter(chosen);
  const correctLetter = extractOptionLetter(correct);
  if (chosenLetter && correctLetter && chosenLetter === correctLetter) return true;
  return chosen.trim().toLowerCase() === correct.trim().toLowerCase();
};

// @desc    Start a new AI Mock Interview with Multiple Choice Questions
// @route   POST /api/interview/start
// @access  Private
const startInterview = async (req, res) => {
  try {
    const { jobRole, difficulty = 'Medium' } = req.body;
    const questionCount = difficulty === 'Hard' ? 6 : difficulty === 'Medium' ? 5 : 4;

    const prompt = `You are an expert technical and HR interviewer. Generate exactly ${questionCount} multiple-choice interview questions (MCQs) for the role of "${jobRole}" at ${difficulty} difficulty level.

Each question must test real-world scenarios, architectural decisions, technical knowledge, or best practices for the role.
Provide 4 distinct, unambiguous options labeled A), B), C), and D).
Clearly identify which option is correct, and provide a clear technical explanation.

Return a JSON object strictly matching this format:
{
  "questions": [
    {
      "question": "Clear scenario or technical question text",
      "options": [
        "A) First option description",
        "B) Second option description",
        "C) Third option description",
        "D) Fourth option description"
      ],
      "correctOption": "A) First option description",
      "explanation": "Clear explanation of why this option is correct and why other choices are flawed or sub-optimal."
    }
  ]
}`;

    const data = await generateJSON(prompt);

    const questions = (data.questions || []).map((q) => {
      // Ensure options exist
      const opts = Array.isArray(q.options) && q.options.length >= 2
        ? q.options
        : [
            `A) Standard industry pattern for ${jobRole}`,
            `B) Deprecated or anti-pattern approach`,
            `C) Naive unoptimized solution`,
            `D) None of the above`,
          ];
      return {
        question: q.question,
        options: opts,
        correctOption: q.correctOption || opts[0],
        explanation: q.explanation || 'This is the recommended standard practice for this technical scenario.',
        selectedOption: '',
        answer: '',
        isCorrect: false,
        score: 0,
        feedback: '',
      };
    });

    const interview = await Interview.create({
      user: req.user._id,
      jobRole,
      difficulty,
      questions,
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit interview answers and get accurate objective grading
// @route   PUT /api/interview/:id/submit
// @access  Private
const submitAnswers = async (req, res) => {
  try {
    const { answers } = req.body; // array of { questionIndex, selectedOption, answer }
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let correctCount = 0;
    let partialCount = 0;

    // Evaluate each question strictly based on correctness
    (answers || []).forEach(({ questionIndex, selectedOption, answer }) => {
      const q = interview.questions[questionIndex];
      if (!q) return;

      const chosen = (selectedOption || answer || '').trim();
      q.selectedOption = chosen;
      q.answer = chosen;

      if (!chosen) {
        q.isCorrect = false;
        q.score = 0;
        q.feedback = `No option selected. The correct answer was: ${q.correctOption}. ${q.explanation}`;
        return;
      }

      const isExactMatch = isOptionMatching(chosen, q.correctOption);

      if (isExactMatch) {
        q.isCorrect = true;
        q.score = 10;
        q.feedback = `✅ Correct! ${q.explanation}`;
        correctCount++;
      } else {
        // Check for partial credit (e.g. if the chosen option shows partial validity in explanation)
        const chosenLower = chosen.toLowerCase();
        const correctLower = (q.correctOption || '').toLowerCase();
        const isPartiallyRelevant =
          chosenLower.length > 15 &&
          correctLower.split(' ').some((word) => word.length > 5 && chosenLower.includes(word));

        if (isPartiallyRelevant) {
          q.isCorrect = false;
          q.score = 5;
          q.feedback = `⚠️ Partially Correct (+5 pts). Selected: "${chosen}". The optimal answer is: "${q.correctOption}". ${q.explanation}`;
          partialCount++;
        } else {
          q.isCorrect = false;
          q.score = 0;
          q.feedback = `❌ Incorrect (0 pts). Selected: "${chosen}". Correct answer: "${q.correctOption}". ${q.explanation}`;
        }
      }
    });

    // Calculate overall percentage based on earned scores
    const totalPossible = interview.questions.length * 10;
    const totalEarned = interview.questions.reduce((sum, q) => sum + (q.score || 0), 0);
    const overallPercentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

    interview.overallScore = overallPercentage;

    // Construct detailed summary
    let summary = `Candidate completed the ${interview.difficulty} level mock interview for ${interview.jobRole}. `;
    summary += `Achieved an overall score of ${overallPercentage}% (${correctCount} fully correct, ${partialCount} partially correct out of ${interview.questions.length} questions). `;
    if (overallPercentage >= 80) {
      summary += 'Demonstrates strong technical competence, good scenario discernment, and high interview readiness for this role.';
    } else if (overallPercentage >= 50) {
      summary += 'Shows a foundational grasp of core concepts, but needs deeper review on architecture choices and edge-case handling.';
    } else {
      summary += 'Identified significant knowledge gaps in standard best practices. Recommend reviewing learning roadmap topics before live interviews.';
    }

    interview.overallFeedback = summary;
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
