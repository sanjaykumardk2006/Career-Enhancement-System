const mongoose = require('mongoose');

const learningRoadmapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    careerGoal: { type: String, required: true },
    skillGaps: [{ type: String }],
    roadmap: [
      {
        phase: { type: Number },
        title: { type: String },
        duration: { type: String },
        topics: [
          {
            name: String,
            resources: [{ title: String, url: String, type: { type: String, enum: ['Video', 'Article', 'Course', 'Book', 'Practice'] } }],
            completed: { type: Boolean, default: false },
            completedAt: Date,
          },
        ],
      },
    ],
    overallProgress: { type: Number, default: 0 }, // percentage
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningRoadmap', learningRoadmapSchema);
