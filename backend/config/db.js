// ============================================================
// config/db.js – MongoDB Connection Setup
// ============================================================
// This file handles connecting to our MongoDB database.
// We use Mongoose, which is an "ODM" (Object Data Modeling)
// library – it lets us define schemas and models for our data
// and interact with MongoDB using JavaScript objects.
// ============================================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
const conn = await mongoose.connect(process.env.MONGODB_URI, {      // These options are best practices for stable connections
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    console.error('💡 Tip: Check your MONGO_URI in the .env file');
    // Exit process with failure code so we know something went wrong
    process.exit(1);
  }
};

module.exports = connectDB;
