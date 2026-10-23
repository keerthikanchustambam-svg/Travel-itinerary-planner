// ============================================================
// routes/authRoutes.js – Authentication Routes
// ============================================================
// Routes define the URL structure of our API.
// Each route maps to a controller function.
//
// Public routes (no login needed): register, login
// Protected route (login required): /me
// ============================================================

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register → Validate inputs → Register user
router.post('/register', validateRegister, register);

// POST /api/auth/login → Validate inputs → Login user
router.post('/login', validateLogin, login);

// GET /api/auth/me → Check JWT → Return logged-in user's profile
router.get('/me', protect, getMe);

module.exports = router;
