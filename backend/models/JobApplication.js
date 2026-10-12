const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true },
    position: { type: String, required: true },
    location: { type: String, default: '' },
    jobType: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'], default: 'Full-time' },
    salary: { type: String, default: '' },
    jobUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected', 'Withdrawn'],
      default: 'Applied',
    },
    appliedDate: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    contacts: [{ name: String, email: String, role: String }],
    timeline: [
      {
        status: String,
        date: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
