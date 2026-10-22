const express = require('express');
const router = express.Router();
const {
  registerUser,
  registerAdmin,
  loginUser,
  getMe,
  updateProfile,
  adminGetUsers,
  adminGetUserById,
  adminUpdateUserRole,
  adminDeleteUser,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/admin-register', registerAdmin);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Admin Authorized User Management
router.get('/admin/users', protect, admin, adminGetUsers);
router.get('/admin/users/:id', protect, admin, adminGetUserById);
router.put('/admin/users/:id/role', protect, admin, adminUpdateUserRole);
router.delete('/admin/users/:id', protect, admin, adminDeleteUser);

module.exports = router;
