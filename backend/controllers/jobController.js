const JobApplication = require('../models/JobApplication');
const User = require('../models/User');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');

// @desc    Get all job applications
// @route   GET /api/jobs
// @access  Private
const getJobApplications = async (req, res) => {
  try {
    const jobs = await JobApplication.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new job application
// @route   POST /api/jobs
// @access  Private
const createJobApplication = async (req, res) => {
  try {
    const job = await JobApplication.create({ ...req.body, user: req.user._id });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update job application
// @route   PUT /api/jobs/:id
// @access  Private
const updateJobApplication = async (req, res) => {
  try {
    const job = await JobApplication.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job application not found' });
    if (job.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // If status changed, add to timeline
    if (req.body.status && req.body.status !== job.status) {
      job.timeline.push({ status: req.body.status, date: new Date(), note: req.body.note || '' });
    }

    Object.assign(job, req.body);
    const updated = await job.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete job application
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJobApplication = async (req, res) => {
  try {
    const job = await JobApplication.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job application not found' });
    if (job.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await job.deleteOne();
    res.json({ message: 'Job application deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin - Get all applications + stats
// @route   GET /api/jobs/admin/all
// @access  Private/Admin
const adminGetAllApplications = async (req, res) => {
  try {
    const jobs = await JobApplication.find().populate('user', 'name email').sort({ createdAt: -1 });
    const stats = {
      total: jobs.length,
      applied: jobs.filter((j) => j.status === 'Applied').length,
      interview: jobs.filter((j) => j.status === 'Interview').length,
      offer: jobs.filter((j) => j.status === 'Offer').length,
      rejected: jobs.filter((j) => j.status === 'Rejected').length,
    };
    res.json({ jobs, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin - Get dashboard stats
// @route   GET /api/jobs/admin/stats
// @access  Private/Admin
const adminGetStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalJobs = await JobApplication.countDocuments();
    const totalInterviews = await Interview.countDocuments();
    const totalResumes = await Resume.countDocuments();
    const completedInterviews = await Interview.countDocuments({ status: 'completed' });

    const recentUsers = await User.find({ role: 'student' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt');
    const jobsByStatus = await JobApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({ totalUsers, totalJobs, totalInterviews, totalResumes, completedInterviews, recentUsers, jobsByStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getJobApplications, createJobApplication, updateJobApplication, deleteJobApplication, adminGetAllApplications, adminGetStats };
