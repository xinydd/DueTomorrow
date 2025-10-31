const express = require('express');
const User = require('../models/User');
const userService = require('../services/userService');
const { generateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateSignup, validateLogin } = require('../middleware/validation');
const loggingService = require('../services/loggingService');

const router = express.Router();

// POST /signup
router.post('/signup', authLimiter, validateSignup, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Enforce signup policy: only students can self-register
    if (role === 'staff' || role === 'security') {
      return res.status(403).json({
        success: false,
        message: 'Only students can sign up. Staff and Security accounts are created by administrators. Please use Login with your assigned credentials.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      // Force role to student for self-registrations
      role: 'student'
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Log the signup
    await loggingService.log(
      user._id,
      'signup',
      user._id,
      'user',
      { role, email },
      req
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during signup'
    });
  }
});

// POST /login
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await userService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await userService.updateById(user._id, { lastLogin: user.lastLogin });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Log the login
    await loggingService.log(
      user._id,
      'login',
      user._id,
      'user',
      { email, role: user.role },
      req
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// POST /profile - Get user profile (requires authentication)
router.post('/profile', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token required'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await userService.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: { user: userWithoutPassword }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;
