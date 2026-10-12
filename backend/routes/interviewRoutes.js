const express = require('express');
const router = express.Router();
const { startInterview, submitAnswers, getInterviews, getInterview } = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getInterviews);
router.post('/start', protect, startInterview);
router.get('/:id', protect, getInterview);
router.put('/:id/submit', protect, submitAnswers);

module.exports = router;
