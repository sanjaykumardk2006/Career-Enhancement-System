const express = require('express');
const router = express.Router();
const {
  getJobApplications,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication,
  adminGetAllApplications,
  adminGetStats,
} = require('../controllers/jobController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getJobApplications);
router.post('/', protect, createJobApplication);
router.put('/:id', protect, updateJobApplication);
router.delete('/:id', protect, deleteJobApplication);

// Admin routes
router.get('/admin/all', protect, admin, adminGetAllApplications);
router.get('/admin/stats', protect, admin, adminGetStats);

module.exports = router;
