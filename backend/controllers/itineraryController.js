// ============================================================
// controllers/itineraryController.js – Itinerary Business Logic
// ============================================================
// Handles generating, saving, and retrieving travel itineraries.
// All AI calls go through this controller (never directly from frontend).
// ============================================================

const Itinerary = require('../models/Itinerary');
const { generateItinerary } = require('../services/aiService');

// ── GENERATE ITINERARY ──────────────────────────────────────
// POST /api/itinerary/generate  (protected)
// Takes trip inputs, calls Gemini AI, returns the generated plan.
// The plan is NOT saved automatically – user saves it separately.
const generate = async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, travelers, interests } = req.body;

    // Call our AI service to generate the itinerary
    console.log(`🤖 Generating itinerary for ${destination}...`);
    const aiResult = await generateItinerary({ destination, startDate, endDate, budget, travelers, interests });

    res.json({
      message: 'Itinerary generated successfully!',
      itinerary: {
        destination,
        startDate,
        endDate,
        budget,
        travelers,
        interests,
        generatedPlan: aiResult.days,
        summary: aiResult.summary
      }
    });
  } catch (error) {
    console.error('Generate error:', error.message);
    if (error.message.includes('API key')) {
      return res.status(503).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Failed to generate itinerary. Please try again.' });
  }
};

// ── SAVE ITINERARY ──────────────────────────────────────────
// POST /api/itinerary/save  (protected)
// Saves a previously generated itinerary to the database.
const save = async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, travelers, interests, generatedPlan, summary, title } = req.body;

    if (!generatedPlan || generatedPlan.length === 0) {
      return res.status(400).json({ error: 'No itinerary plan provided to save.' });
    }

    const itinerary = await Itinerary.create({
      userId: req.user._id,  // From the JWT middleware
      destination,
      startDate,
      endDate,
      budget,
      travelers,
      interests,
      generatedPlan,
      summary,
      title: title || `Trip to ${destination}`
    });

    res.status(201).json({
      message: 'Itinerary saved successfully! ✅',
      itinerary: {
        id: itinerary._id,
        title: itinerary.title,
        destination: itinerary.destination,
        startDate: itinerary.startDate,
        endDate: itinerary.endDate
      }
    });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to save itinerary. Please try again.' });
  }
};

// ── GET ALL MY ITINERARIES ──────────────────────────────────
// GET /api/itinerary/my-trips  (protected)
// Returns a list of all itineraries saved by the logged-in user.
const getMyTrips = async (req, res) => {
  try {
    // Find all itineraries belonging to this user
    // .sort({ createdAt: -1 }) = newest first
    // We select only summary fields, not the full plan (to keep the response small)
    const itineraries = await Itinerary.find({ userId: req.user._id })
      .select('title destination startDate endDate budget travelers summary.totalEstimatedCost createdAt')
      .sort({ createdAt: -1 });

    res.json({
      count: itineraries.length,
      trips: itineraries
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Failed to fetch your trips.' });
  }
};

// ── GET SINGLE ITINERARY ────────────────────────────────────
// GET /api/itinerary/:id  (protected)
// Returns the full details of one itinerary.
const getItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found.' });
    }

    // Make sure this itinerary belongs to the requesting user (authorization check)
    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. This itinerary belongs to another user.' });
    }

    res.json({ itinerary });
  } catch (error) {
    console.error('Get itinerary error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid itinerary ID format.' });
    }
    res.status(500).json({ error: 'Failed to fetch itinerary.' });
  }
};

// ── DELETE ITINERARY ────────────────────────────────────────
// DELETE /api/itinerary/:id  (protected)
const deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found.' });
    }

    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await Itinerary.findByIdAndDelete(req.params.id);
    res.json({ message: 'Itinerary deleted successfully.' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete itinerary.' });
  }
};

module.exports = { generate, save, getMyTrips, getItinerary, deleteItinerary };
