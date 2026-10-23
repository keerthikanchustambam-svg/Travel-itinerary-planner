// ============================================================
// controllers/authController.js – Auth Business Logic
// ============================================================
// Controllers contain the actual logic for each API endpoint.
// They receive the request, do the work, and send a response.
//
// Routes define the URL pattern → Controllers do the work.
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper: Generate a JWT Token ────────────────────────────
// A JWT (JSON Web Token) is like a digital ID card.
// It contains the user's ID, is signed with our secret key,
// and expires after a set time. The frontend sends this token
// with every request to prove who they are.
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },                     // Payload: data stored in the token
    process.env.JWT_SECRET,             // Secret key for signing
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }  // Expiry time
  );
};

// ── REGISTER ────────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Create the new user (password will be hashed by the pre-save hook in User.js)
    const user = await User.create({ name, email, password });

    // Generate a token for the newly registered user (auto-login after register)
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully! Welcome aboard! 🎉',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// ── LOGIN ───────────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email (we need to explicitly select password since select:false in schema)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Use a generic message to avoid revealing which users exist (security best practice)
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare the entered password with the stored hash
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Credentials are correct – generate and return a token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful! Welcome back! 👋',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// ── GET PROFILE ─────────────────────────────────────────────
// GET /api/auth/me  (protected route)
const getMe = async (req, res) => {
  // req.user is set by the authMiddleware after verifying JWT
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt
    }
  });
};

module.exports = { register, login, getMe };
