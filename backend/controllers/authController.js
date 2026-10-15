const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register new user
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

    const cleanEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists. Please sign in instead.' });
    }

    const assignedRole = role && ['student', 'admin'].includes(role) ? role : 'student';

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: assignedRole,
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

module.exports = { registerUser, loginUser, getMe, updateProfile };
