const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      name,
      email,
      password,
      role,
      // Student fields
      university,
      major,
      graduationYear,
      skills,
      // Company fields
      companyName,
      industry,
      website,
      companySize
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create user object based on role
    let userData = {
      name,
      email,
      password,
      role
    };

    // Add role-specific fields
    if (role === 'student') {
      userData = {
        ...userData,
        university,
        major,
        graduationYear: parseInt(graduationYear),
        skills: skills || []
      };
    } else if (role === 'company') {
      userData = {
        ...userData,
        companyName,
        industry,
        website: website || null,
        companySize: companySize || null
      };
    }

    // Create user
    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, role } = req.body;

    // Find user and include password for comparison
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify role matches
    if (user.role !== role) {
      return res.status(400).json({
        success: false,
        error: `This email is registered as a ${user.role}, not a ${role}`
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Extract updateable fields based on role
    const {
      name,
      bio,
      // Student fields
      university,
      major,
      graduationYear,
      skills,
      // Company fields
      companyName,
      industry,
      website,
      companySize
    } = req.body;

    // Update common fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    // Update role-specific fields
    if (user.role === 'student') {
      if (university) user.university = university;
      if (major) user.major = major;
      if (graduationYear) user.graduationYear = graduationYear;
      if (skills) user.skills = skills;
    } else if (user.role === 'company') {
      if (companyName) user.companyName = companyName;
      if (industry) user.industry = industry;
      if (website !== undefined) user.website = website;
      if (companySize) user.companySize = companySize;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during profile update'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during password change'
    });
  }
};

// @desc    Logout user (client-side mainly, but can blacklist token if needed)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    // In a more sophisticated app, you might maintain a token blacklist
    // For now, we'll just send a success response
    // The client will handle removing the token from storage
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  logoutUser
};