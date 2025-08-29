// utils/validators.js
const { body, validationResult } = require("express-validator");

// User registration validation
const validateUserRegistration = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .optional()
    .isIn(["student", "company"])
    .withMessage("Role must be either 'student' or 'company'"),
  body("companyName")
    .if(body("role").equals("company"))
    .notEmpty()
    .withMessage("Company name is required for company registration"),
];

// Challenge validation
const validateChallenge = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("difficulty")
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be one of: easy, medium, hard"),
];

// Submission validation
const validateSubmission = [
  body("code").trim().notEmpty().withMessage("Code is required"),
];

// Middleware to handle validation errors
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = {
  validateUserRegistration,
  validateChallenge,
  validateSubmission,
  handleValidationErrors,
};
