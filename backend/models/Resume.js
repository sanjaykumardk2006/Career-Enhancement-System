const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'My Resume' },
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      address: String,
      linkedin: String,
      github: String,
      portfolio: String,
    },
    summary: { type: String, default: '' },
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        startYear: Number,
        endYear: Number,
        gpa: String,
      },
    ],
    experience: [
      {
        company: String,
        role: String,
        startDate: String,
        endDate: String,
        current: { type: Boolean, default: false },
        description: String,
        achievements: [String],
      },
    ],
    skills: [{ name: String, level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] } }],
    projects: [
      {
        name: String,
        description: String,
        techStack: [String],
        link: String,
        github: String,
      },
    ],
    certifications: [{ name: String, issuer: String, date: String, url: String }],
    uploadedFile: { type: String, default: '' }, // path to uploaded resume
    aiAnalysis: {
      score: { type: Number, default: 0 },
      strengths: [String],
      weaknesses: [String],
      suggestions: [String],
      keywords: [String],
      analyzedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
