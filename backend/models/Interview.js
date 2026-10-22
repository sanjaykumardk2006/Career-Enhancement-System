const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobRole: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String }],
        correctOption: { type: String, default: '' },
        explanation: { type: String, default: '' },
        selectedOption: { type: String, default: '' },
        answer: { type: String, default: '' },
        isCorrect: { type: Boolean, default: false },
        score: { type: Number, default: 0 },
        feedback: { type: String, default: '' },
      },
    ],
    overallFeedback: { type: String, default: '' },
    overallScore: { type: Number, default: 0 },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
