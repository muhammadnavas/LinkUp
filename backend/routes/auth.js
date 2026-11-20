// routes/auth.js (Updated with new routes)
const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  getUserSubmissions,
  getLeaderboard,
  getUserProfileById,
  changePassword,
  logoutUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Registration validation
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  // Username is optional in the registration form; the controller generates
  // one from the email address when it is omitted.
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['student', 'company'])
    .withMessage('Role must be either student or company'),
];

// Login validation
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('role')
    .isIn(['student', 'company'])
    .withMessage('Role must be either student or company')
];

// Profile update validation
const profileUpdateValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('website')
    .optional()
    .customSanitizer((value) => {
      // Convert empty strings to null
      return value && value.trim() ? value.trim() : null;
    })
    .custom((value) => {
      // Only validate if there's actually a value
      if (value && !value.match(/^https?:\\/\\/.+/)) {
        throw new Error('Please provide a valid URL starting with http:// or https://');
      }
      return true;
    }),
  body('githubProfile')
    .optional()
    .customSanitizer((value) => {
      // Convert empty strings to null
      return value && value.trim() ? value.trim() : null;
    })
    .custom((value) => {
      // Only validate if there's actually a value
      if (value && !value.match(/^https?:\\/\\/(www\\.)?github\\.com\\/.+/)) {
        throw new Error('Please provide a valid GitHub URL');
      }
      return true;
    }),
  body('linkedinProfile')
    .optional()
    .customSanitizer((value) => {
      // Convert empty strings to null
      return value && value.trim() ? value.trim() : null;
    })
    .custom((value) => {
      // Only validate if there's actually a value
      if (value && !value.match(/^https?:\\/\\/(www\\.)?(linkedin\\.com|linkedin\\.in)\\/.+/)) {
        throw new Error('Please provide a valid LinkedIn URL');
      }
      return true;
    })
];

// Routes
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.get('/me', protect, getCurrentUser);
router.get('/submissions', protect, getUserSubmissions);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/profile/:userId', protect, getUserProfileById); // Must come before PUT /profile
router.put('/profile', protect, profileUpdateValidation, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logoutUser);

module.exports = router;
