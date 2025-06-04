const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const redis = require('../services/redis');

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(20).required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional()
});

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, username, password, firstName, lastName } = value;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      email,
      username,
      password,
      profile: {
        firstName,
        lastName
      },
      metadata: {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Log activity
    const ActivityLog = require('../models/ActivityLog');
    await ActivityLog.create({
      userId: user._id,
      action: 'register',
      sessionId: req.sessionID || 'unknown',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is suspended' });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    // Generate token
    const token = generateToken(user._id);
    const sessionId = `session_${user._id}_${Date.now()}`;

    // Track online status
    await redis.setUserOnline(user._id, sessionId);

    // Log activity
    const ActivityLog = require('../models/ActivityLog');
    await ActivityLog.create({
      userId: user._id,
      action: 'login',
      sessionId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Login successful',
      token,
      sessionId,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    // Set user offline
    await redis.setUserOffline(userId);

    // Log activity
    const ActivityLog = require('../models/ActivityLog');
    await ActivityLog.create({
      userId,
      action: 'logout',
      sessionId: sessionId || 'unknown',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
};