const User = require('../models/User');
const Resume = require('../models/Resume');
const Interview = require('../models/Interview');
const JobApplication = require('../models/JobApplication');
const LearningRoadmap = require('../models/LearningRoadmap');
const generateToken = require('../utils/generateToken');

// @desc    Register new user (Students / Candidates only)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide full name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Explicit security check: Prevent any public registration attempt to claim admin privileges
    if (role && role.toLowerCase() === 'admin') {
      return res.status(403).json({
        message: 'Security Alert: Administrator accounts cannot be created via public registration.',
        code: 'ADMIN_REGISTRATION_FORBIDDEN',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists. Please sign in instead.' });
    }

    // Public registration always assigns 'student' role
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'student',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      message: 'Account created successfully in database!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register administrator (Restricted - Requires ADMIN_SECRET_KEY)
// @route   POST /api/auth/admin-register
// @access  Restricted
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, adminSecretKey } = req.body;

    const configuredSecret = process.env.ADMIN_SECRET_KEY;
    if (!configuredSecret || !adminSecretKey || adminSecretKey.trim() !== configuredSecret.trim()) {
      return res.status(403).json({
        message: 'Access Denied: Invalid or missing administrator authorization key.',
        code: 'INVALID_ADMIN_SECRET',
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      // If user exists, elevate to admin
      user.role = 'admin';
      await user.save();
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        message: 'Existing user elevated to Administrator successfully.',
      });
    }

    user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'admin',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      message: 'Administrator account registered successfully!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({
        message: 'Please enter both username/email and password.',
      });
    }

    // Escape regex special chars if searching by name
    const escapedIdentifier = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 1. Search database by email or name/username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { name: new RegExp(`^${escapedIdentifier}$`, 'i') },
      ],
    });

    // 2. If credentials/user not in the database:
    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email. Please sign up first.',
        code: 'USER_NOT_FOUND',
        notFound: true,
      });
    }

    // 3. User exists in database, verify password:
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: 'Incorrect credentials. Please enter the correct username or password.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // 4. Credentials match - successfully logged in
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      skills: user.skills,
      careerGoal: user.careerGoal,
      token: generateToken(user._id),
      message: 'Login successful!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.bio = req.body.bio || user.bio;
    user.skills = req.body.skills || user.skills;
    user.careerGoal = req.body.careerGoal || user.careerGoal;
    user.education = req.body.education || user.education;
    user.experience = req.body.experience || user.experience;
    if (req.body.avatar) user.avatar = req.body.avatar;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      avatar: updated.avatar,
      phone: updated.phone,
      bio: updated.bio,
      skills: updated.skills,
      careerGoal: updated.careerGoal,
      token: generateToken(updated._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin - Get all registered users with search and role filtering
// @route   GET /api/auth/admin/users
// @access  Private/Admin
const adminGetUsers = async (req, res) => {
  try {
    const { search = '', role = 'all' } = req.query;

    const query = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    if (search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: new RegExp(escaped, 'i') },
        { email: new RegExp(escaped, 'i') },
        { careerGoal: new RegExp(escaped, 'i') },
        { skills: new RegExp(escaped, 'i') },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    // Aggregate counts for quick stats
    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    res.json({
      users,
      stats: {
        total: totalUsers,
        students: studentCount,
        admins: adminCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin - Inspect full user portfolio dossier
// @route   GET /api/auth/admin/users/:id
// @access  Private/Admin
const adminGetUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found in system' });
    }

    // Fetch user's related data
    const [resume, interviews, applications, roadmap] = await Promise.all([
      Resume.findOne({ user: user._id }),
      Interview.find({ user: user._id }).sort({ createdAt: -1 }),
      JobApplication.find({ user: user._id }).sort({ appliedDate: -1 }),
      LearningRoadmap.findOne({ user: user._id }),
    ]);

    res.json({
      user,
      portfolio: {
        resume,
        interviews,
        applications,
        roadmap,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin - Update user role
// @route   PUT /api/auth/admin/users/:id/role
// @access  Private/Admin
const adminUpdateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either "student" or "admin"' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Security check: Admin cannot demote themselves to avoid losing admin lock
    if (targetUser._id.equals(req.user._id) && role !== 'admin') {
      return res.status(400).json({
        message: 'Security Guard: You cannot demote your own administrator account.',
      });
    }

    targetUser.role = role;
    await targetUser.save();

    res.json({
      message: `User role updated to ${role} successfully.`,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin - Delete user and cascading data
// @route   DELETE /api/auth/admin/users/:id
// @access  Private/Admin
const adminDeleteUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Security check: Admin cannot delete themselves
    if (targetUser._id.equals(req.user._id)) {
      return res.status(400).json({
        message: 'Security Guard: You cannot delete your own active administrator account.',
      });
    }

    // Cascading cleanup
    await Promise.all([
      Resume.deleteMany({ user: targetUser._id }),
      Interview.deleteMany({ user: targetUser._id }),
      JobApplication.deleteMany({ user: targetUser._id }),
      LearningRoadmap.deleteMany({ user: targetUser._id }),
      User.findByIdAndDelete(targetUser._id),
    ]);

    res.json({ message: `User "${targetUser.name}" and associated records removed successfully.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  registerAdmin,
  loginUser,
  getMe,
  updateProfile,
  adminGetUsers,
  adminGetUserById,
  adminUpdateUserRole,
  adminDeleteUser,
};
