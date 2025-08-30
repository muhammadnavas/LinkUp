const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  logoutUser
} = require('../controllers/authController');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
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

  // Conditional validations for student
  body('university')
    .if(body('role').equals('student'))
    .trim()
    .notEmpty()
    .withMessage('University is required for students'),
  
  body('major')
    .if(body('role').equals('student'))
    .trim()
    .notEmpty()
    .withMessage('Major is required for students'),
  
  body('graduationYear')
    .if(body('role').equals('student'))
    .isInt({ min: 2024, max: 2030 })
    .withMessage('Graduation year must be between 2024 and 2030'),

  // Conditional validations for company
  body('companyName')
    .if(body('role').equals('company'))
    .trim()
    .notEmpty()
    .withMessage('Company name is required for companies'),
  
  body('industry')
    .if(body('role').equals('company'))
    .trim()
    .notEmpty()
    .withMessage('Industry is required for companies'),
  
  body('website')
    .if(body('role').equals('company'))
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please provide a valid website URL')
];

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

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('university')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('University cannot be empty'),
  
  body('major')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Major cannot be empty'),
  
  body('graduationYear')
    .optional()
    .isInt({ min: 2024, max: 2030 })
    .withMessage('Graduation year must be between 2024 and 2030'),
  
  body('companyName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company name cannot be empty'),
  
  body('industry')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Industry cannot be empty'),
  
  body('website')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array')
];

// @route   POST /api/auth/register
router.post('/register', registerValidation, registerUser);

// @route   POST /api/auth/login
router.post('/login', loginValidation, loginUser);

// @route   GET /api/auth/verify
router.get('/verify', authMiddleware, getCurrentUser);
// @route   PUT /api/auth/profile
router.put('/profile', authMiddleware, updateProfileValidation, updateProfile);

// @route   PUT /api/auth/change-password
router.put('/change-password', authMiddleware, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], changePassword);

// @route   POST /api/auth/logout
router.post('/logout', authMiddleware, logoutUser);

module.exports = router;