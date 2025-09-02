// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const { validationResult } = require('express-validator');

// // Generate JWT Token
// const generateToken = (userId) => {
//   return jwt.sign(
//     { id: userId },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
//   );
// };

// // @desc    Register new user
// // @route   POST /api/auth/register
// // @access  Public
// const registerUser = async (req, res) => {
//   try {
//     // Check for validation errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         error: 'Validation failed',
//         details: errors.array()
//       });
//     }

//     const {
//       name,
//       email,
//       password,
//       role,
//       // Student fields
//       university,
//       major,
//       graduationYear,
//       skills,
//       // Company fields
//       companyName,
//       industry,
//       website,
//       companySize
//     } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findByEmail(email);
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         error: 'User with this email already exists'
//       });
//     }

//     // Create user object based on role
//     let userData = {
//       name,
//       email,
//       password,
//       role
//     };

//     // Add role-specific fields
//     if (role === 'student') {
//       userData = {
//         ...userData,
//         university,
//         major,
//         graduationYear: parseInt(graduationYear),
//         skills: skills || []
//       };
//     } else if (role === 'company') {
//       userData = {
//         ...userData,
//         companyName,
//         industry,
//         website: website || null,
//         companySize: companySize || null
//       };
//     }

//     // Create user
//     const user = await User.create(userData);

//     // Generate token
//     const token = generateToken(user._id);

//     // Update last login
//     await user.updateLastLogin();

//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       token,
//       user: user.getPublicProfile()
//     });

//   } catch (error) {
//     console.error('Registration error:', error);
    
//     // Handle duplicate key error
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         error: 'Email already exists'
//       });
//     }
    
//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const errorMessages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         error: 'Validation failed',
//         details: errorMessages
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: 'Server error during registration'
//     });
//   }
// };

// // @desc    Login user
// // @route   POST /api/auth/login
// // @access  Public
// const loginUser = async (req, res) => {
//   try {
//     // Check for validation errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         error: 'Validation failed',
//         details: errors.array()
//       });
//     }

//     const { email, password, role } = req.body;

//     // Find user and include password for comparison
//     const user = await User.findByEmail(email).select('+password');
//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid credentials'
//       });
//     }

//     // Check if account is active
//     if (!user.isActive) {
//       return res.status(400).json({
//         success: false,
//         error: 'Account is deactivated. Please contact support.'
//       });
//     }

//     // Verify role matches
//     if (user.role !== role) {
//       return res.status(400).json({
//         success: false,
//         error: `This email is registered as a ${user.role}, not a ${role}`
//       });
//     }

//     // Check password
//     const isPasswordValid = await user.comparePassword(password);
//     if (!isPasswordValid) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid credentials'
//       });
//     }

//     // Generate token
//     const token = generateToken(user._id);

//     // Update last login
//     await user.updateLastLogin();

//     res.json({
//       success: true,
//       message: 'Login successful',
//       token,
//       user: user.getPublicProfile()
//     });

//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error during login'
//     });
//   }
// };

// // @desc    Get current user
// // @route   GET /api/auth/me
// // @access  Private
// const getCurrentUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: 'User not found'
//       });
//     }

//     res.json({
//       success: true,
//       user: user.getPublicProfile()
//     });

//   } catch (error) {
//     console.error('Get current user error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// // @desc    Update user profile
// // @route   PUT /api/auth/profile
// // @access  Private
// const updateProfile = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         error: 'Validation failed',
//         details: errors.array()
//       });
//     }

//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: 'User not found'
//       });
//     }

//     // Extract updateable fields based on role
//     const {
//       name,
//       bio,
//       // Student fields
//       university,
//       major,
//       graduationYear,
//       skills,
//       // Company fields
//       companyName,
//       industry,
//       website,
//       companySize
//     } = req.body;

//     // Update common fields
//     if (name) user.name = name;
//     if (bio !== undefined) user.bio = bio;

//     // Update role-specific fields
//     if (user.role === 'student') {
//       if (university) user.university = university;
//       if (major) user.major = major;
//       if (graduationYear) user.graduationYear = graduationYear;
//       if (skills) user.skills = skills;
//     } else if (user.role === 'company') {
//       if (companyName) user.companyName = companyName;
//       if (industry) user.industry = industry;
//       if (website !== undefined) user.website = website;
//       if (companySize) user.companySize = companySize;
//     }

//     await user.save();

//     res.json({
//       success: true,
//       message: 'Profile updated successfully',
//       user: user.getPublicProfile()
//     });

//   } catch (error) {
//     console.error('Update profile error:', error);
    
//     if (error.name === 'ValidationError') {
//       const errorMessages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         error: 'Validation failed',
//         details: errorMessages
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: 'Server error during profile update'
//     });
//   }
// };

// // @desc    Change password
// // @route   PUT /api/auth/change-password
// // @access  Private
// const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;

//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         error: 'Current password and new password are required'
//       });
//     }

//     if (newPassword.length < 6) {
//       return res.status(400).json({
//         success: false,
//         error: 'New password must be at least 6 characters long'
//       });
//     }

//     // Get user with password
//     const user = await User.findById(req.user.id).select('+password');
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: 'User not found'
//       });
//     }

//     // Verify current password
//     const isCurrentPasswordValid = await user.comparePassword(currentPassword);
//     if (!isCurrentPasswordValid) {
//       return res.status(400).json({
//         success: false,
//         error: 'Current password is incorrect'
//       });
//     }

//     // Update password
//     user.password = newPassword;
//     await user.save();

//     res.json({
//       success: true,
//       message: 'Password changed successfully'
//     });

//   } catch (error) {
//     console.error('Change password error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error during password change'
//     });
//   }
// };

// // @desc    Logout user (client-side mainly, but can blacklist token if needed)
// // @route   POST /api/auth/logout
// // @access  Private
// const logoutUser = async (req, res) => {
//   try {
//     // In a more sophisticated app, you might maintain a token blacklist
//     // For now, we'll just send a success response
//     // The client will handle removing the token from storage
    
//     res.json({
//       success: true,
//       message: 'Logged out successfully'
//     });
//   } catch (error) {
//     console.error('Logout error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error during logout'
//     });
//   }
// };

// module.exports = {
//   registerUser,
//   loginUser,
//   getCurrentUser,
//   updateProfile,
//   changePassword,
//   logoutUser
// };

// controllers/authController.js (Updated with new methods)
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Submission = require('../models/Submission');
const { validationResult } = require('express-validator');
const { updateUserStats, checkAndAwardAchievements } = require('../utils/statsUpdater');

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
      username,
      email,
      password,
      role,
      university,
      major,
      graduationYear,
      skills,
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

    // Check if username already exists
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: 'Username already taken'
      });
    }

    let userData = {
      name,
      username,
      email,
      password,
      role
    };

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

    const user = await User.create(userData);
    const token = generateToken(user._id);
    await user.updateLastLogin();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`
      });
    }
    
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, role } = req.body;

    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }

    if (user.role !== role) {
      return res.status(400).json({
        success: false,
        error: `This email is registered as a ${user.role}, not a ${role}`
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);
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

// @desc    Get current user profile
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

    // Update user stats before returning profile
    await user.updateStats();

    res.json({
      success: true,
      data: user.getPublicProfile()
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
    console.log('Profile update request received:', req.body);
    console.log('Field values:', {
      website: typeof req.body.website, 
      githubProfile: typeof req.body.githubProfile,
      linkedinProfile: typeof req.body.linkedinProfile,
      websiteValue: req.body.website,
      githubValue: req.body.githubProfile,
      linkedinValue: req.body.linkedinProfile
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      console.log('Request body:', req.body);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
        message: errors.array().map(err => `${err.param}: ${err.msg}`).join(', ')
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('Current user data:', {
      username: user.username,
      email: user.email,
      role: user.role
    });

    const {
      username,
      email,
      bio,
      location,
      website,
      githubProfile,
      linkedinProfile,
      // Student fields
      university,
      major,
      graduationYear,
      skills,
      // Company fields
      companyName,
      industry,
      companySize
    } = req.body;

    // Check if username is being changed and is available
    if (username && username !== user.username) {
      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          error: 'Username already taken'
        });
      }
      user.username = username;
    }

    // Check if email is being changed and is available
    if (email && email !== user.email) {
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
      user.email = email;
    }

    // Update common fields
    if (bio !== undefined) user.bio = bio ? bio.trim() : '';
    if (location !== undefined) user.location = location ? location.trim() : '';
    if (website !== undefined) user.website = website ? website.trim() : '';
    if (githubProfile !== undefined) user.githubProfile = githubProfile ? githubProfile.trim() : '';
    if (linkedinProfile !== undefined) user.linkedinProfile = linkedinProfile ? linkedinProfile.trim() : '';

    // Update role-specific fields
    if (user.role === 'student') {
      if (university) user.university = university;
      if (major) user.major = major;
      if (graduationYear) user.graduationYear = graduationYear;
      if (skills) user.skills = skills;
    } else if (user.role === 'company') {
      if (companyName) user.companyName = companyName;
      if (industry) user.industry = industry;
      if (companySize) user.companySize = companySize;
    }

    await user.save();

    console.log('Profile updated successfully for user:', user.username);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user.getPublicProfile()
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

// @desc    Get user submissions
// @route   GET /api/auth/submissions
// @access  Private
const getUserSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let filter = { user: req.user.id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const submissions = await Submission.find(filter)
      .populate('challenge', 'title difficulty description')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Submission.countDocuments(filter);

    res.json({
      success: true,
      data: submissions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching submissions'
    });
  }
};

// @desc    Get leaderboard
// @route   GET /api/auth/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const { timeframe = 'all', limit = 100 } = req.query;
    
    const leaderboard = await User.getLeaderboard(timeframe, parseInt(limit));
    
    // Add rank to each user
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    res.json({
      success: true,
      data: rankedLeaderboard,
      timeframe,
      total: rankedLeaderboard.length
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching leaderboard'
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

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

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

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
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
  getUserSubmissions,
  getLeaderboard,
  changePassword,
  logoutUser
};
