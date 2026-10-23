// ============================================================
// models/User.js – User Database Schema
// ============================================================
// A "schema" defines the structure of documents (records) in
// our MongoDB collection. Think of it like defining columns
// in a SQL table, but for NoSQL documents.
//
// This schema stores: name, email, hashed password, and the
// date the account was created.
// ============================================================

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// Define the shape of a User document in MongoDB
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,          // Remove leading/trailing whitespace
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,        // No two users can have the same email
      lowercase: true,     // Always store email in lowercase
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false        // Never include password in query results by default
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

// ── Pre-save Hook ───────────────────────────────────────────
// This runs automatically BEFORE a user document is saved.
// It hashes the password so we never store plain text passwords.
// "Salt rounds" (10) = how complex the hashing is. Higher = more secure but slower.
userSchema.pre('save', async function (next) {
  // Only hash if the password was actually changed (avoid re-hashing on other updates)
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance Method ─────────────────────────────────────────
// Adds a custom method to every User document.
// We call this during login to check if the entered password matches the hash.
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create the model from the schema
// mongoose.model('User', schema) → creates a 'users' collection in MongoDB
const User = mongoose.model('User', userSchema);

module.exports = User;
