// ============================================================
// server.js – The main entry point of our Express application
// ============================================================
// Think of this as the "front door" of our backend.
// It sets up all the middleware (security, parsing, etc.)
// and connects all the route handlers together.
// ============================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dns = require('node:dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
require('dotenv').config(); // Load .env variables first!

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');

// Initialize the Express app
const app = express();

// ── Connect to MongoDB ──────────────────────────────────────
connectDB();

// ── Security Middleware ─────────────────────────────────────
// helmet() adds important HTTP security headers automatically
app.use(helmet());

// cors() allows our frontend (different origin) to talk to this backend
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting – prevents abuse (e.g., bots spamming our API)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per 15 min per IP
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', limiter);

// Stricter limit for AI generation (it's expensive!)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,                   // max 10 AI generations per hour per IP
  message: { error: 'AI generation limit reached. Please wait an hour before generating again.' }
});
app.use('/api/itinerary/generate', aiLimiter);

// ── Body Parsing Middleware ─────────────────────────────────
// Allows Express to read JSON bodies from incoming requests
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/itinerary', itineraryRoutes);

// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Travel Itinerary Planner API is running!', timestamp: new Date().toISOString() });
});

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ────────────────────────────────────
// If any route throws an error, it ends up here
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📋 API Health: http://localhost:${PORT}/api/health`);
});
