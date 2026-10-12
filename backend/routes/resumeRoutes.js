const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getResume, updateResume, uploadResume, analyzeResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

// Multer storage config for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only PDF/DOC/DOCX files allowed'));
  },
});

router.get('/', protect, getResume);
router.put('/', protect, updateResume);
router.post('/upload', protect, upload.single('resume'), uploadResume);
router.post('/analyze', protect, analyzeResume);

module.exports = router;
