// ============================================================
// routes/itineraryRoutes.js – Itinerary Routes
// ============================================================
// All itinerary routes require authentication (protect middleware).
// The user must be logged in to generate or view itineraries.
// ============================================================

const express = require('express');
const router = express.Router();
const {
  generate, save, getMyTrips, getItinerary, deleteItinerary
} = require('../controllers/itineraryController');
const { protect } = require('../middleware/authMiddleware');
const { validateTripInput } = require('../middleware/validate');

// All routes below require a valid JWT token
router.use(protect);

// POST /api/itinerary/generate → Validate → Generate with AI
router.post('/generate', validateTripInput, generate);

// POST /api/itinerary/save → Save generated itinerary to DB
router.post('/save', save);

// GET /api/itinerary/my-trips → Get all itineraries for logged-in user
router.get('/my-trips', getMyTrips);

// GET /api/itinerary/:id → Get a single itinerary by ID
router.get('/:id', getItinerary);

// DELETE /api/itinerary/:id → Delete an itinerary
router.delete('/:id', deleteItinerary);

module.exports = router;
