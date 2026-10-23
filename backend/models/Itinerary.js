// ============================================================
// models/Itinerary.js – Itinerary Database Schema
// ============================================================
// Stores a complete travel itinerary, including user inputs
// (destination, dates, budget, etc.) and the AI-generated plan.
// ============================================================

const mongoose = require('mongoose');

// Sub-schema for each activity in a day
const activitySchema = new mongoose.Schema({
  time: { type: String },       // e.g. "Morning", "Afternoon", "Evening"
  activity: { type: String },   // What to do
  location: { type: String },   // Where exactly
  duration: { type: String },   // How long it takes
  cost: { type: Number, default: 0 } // Estimated cost in USD
}, { _id: false }); // _id: false means don't create an ID for sub-documents

// Sub-schema for one day's plan
const dayPlanSchema = new mongoose.Schema({
  day: { type: Number },                    // Day number (1, 2, 3...)
  date: { type: String },                   // Formatted date string
  theme: { type: String },                  // e.g. "Culture & History"
  activities: [activitySchema],             // Array of activities
  hotel: {
    name: { type: String },
    rating: { type: String },
    pricePerNight: { type: Number },
    description: { type: String }
  },
  restaurants: [{
    name: { type: String },
    cuisine: { type: String },
    meal: { type: String },                 // Breakfast / Lunch / Dinner
    estimatedCost: { type: Number },
    mustTry: { type: String }              // Signature dish
  }],
  dailyCostEstimate: { type: Number }       // Total estimated cost for the day
}, { _id: false });

// Main Itinerary schema
const itinerarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to a User document
      ref: 'User',
      required: true,
      index: true                           // Index for faster queries
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    budget: {
      type: Number,
      required: true,
      min: [0, 'Budget cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    travelers: {
      type: Number,
      required: true,
      min: [1, 'Must have at least 1 traveler']
    },
    interests: [{
      type: String,
      trim: true
    }],
    // The AI-generated plan stored as an array of day plans
    generatedPlan: [dayPlanSchema],
    // Summary info from the AI
    summary: {
      overview: { type: String },
      totalEstimatedCost: { type: Number },
      bestTimeToVisit: { type: String },
      travelTips: [{ type: String }],
      emergencyContacts: { type: String }
    },
    title: {
      type: String,
      default: function () {
        return `Trip to ${this.destination}`;
      }
    }
  },
  {
    timestamps: true
  }
);

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

module.exports = Itinerary;
