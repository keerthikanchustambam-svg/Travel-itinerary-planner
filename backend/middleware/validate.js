// ============================================================
// middleware/validate.js – Input Validation Rules
// ============================================================
// Uses express-validator to define what valid input looks like.
// If validation fails, we return clear error messages to the
// frontend instead of letting bad data reach our database.
// ============================================================

const { body, validationResult } = require('express-validator');

// ── Helper: Run validation and return errors if any ─────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return the first error message for each field
    const formattedErrors = {};
    errors.array().forEach(err => {
      if (!formattedErrors[err.path]) {
        formattedErrors[err.path] = err.msg;
      }
    });
    return res.status(400).json({ error: 'Validation failed', fields: formattedErrors });
  }
  next();
};

// ── Registration Validation Rules ──────────────────────────
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  handleValidationErrors
];

// ── Login Validation Rules ──────────────────────────────────
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  handleValidationErrors
];

// ── Trip Generation Validation Rules ───────────────────────
const validateTripInput = [
  body('destination')
    .trim()
    .notEmpty().withMessage('Destination is required')
    .isLength({ min: 2, max: 100 }).withMessage('Destination must be between 2 and 100 characters'),

  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date'),

  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('End date must be a valid date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('budget')
    .notEmpty().withMessage('Budget is required')
    .isFloat({ min: 0 }).withMessage('Budget must be a positive number'),

  body('travelers')
    .notEmpty().withMessage('Number of travelers is required')
    .isInt({ min: 1, max: 50 }).withMessage('Travelers must be between 1 and 50'),

  body('interests')
    .optional()
    .isArray().withMessage('Interests must be an array'),

  handleValidationErrors
];

module.exports = { validateRegister, validateLogin, validateTripInput };
