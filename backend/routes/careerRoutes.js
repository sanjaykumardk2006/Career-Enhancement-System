const express = require('express');
const router = express.Router();
const {
  getCareerRecommendations,
  careerChat,
  getSkillGapAnalysis,
  generateRoadmap,
  getRoadmap,
  updateTopicProgress,
} = require('../controllers/careerController');
const { protect } = require('../middleware/authMiddleware');

router.post('/recommendations', protect, getCareerRecommendations);
router.post('/chat', protect, careerChat);
router.post('/skill-gap', protect, getSkillGapAnalysis);
router.post('/roadmap', protect, generateRoadmap);
router.get('/roadmap', protect, getRoadmap);
router.put('/roadmap/topic', protect, updateTopicProgress);

module.exports = router;
