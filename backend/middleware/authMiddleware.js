// ============================================================
// middleware/authMiddleware.js – JWT Authentication Guard
// ============================================================
// "Middleware" in Express is a function that runs between
// receiving a request and sending a response.
//
// This middleware reads the JWT from the request header,
// verifies it's valid and not expired, and attaches the
// user's info to the request object so route handlers can use it.
//
// Think of it like a security guard checking ID badges!
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if the "Authorization" header exists and starts with "Bearer"
  // Format: "Authorization: Bearer <your_jwt_token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract just the token part (remove "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      // jwt.verify throws an error if the token is invalid or expired
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user in the database using the ID stored in the token
      // .select('-password') means "give me all fields EXCEPT password"
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ error: 'User not found. Token invalid.' });
      }

      // Token is valid! Proceed to the actual route handler
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ error: 'Not authorized. Token is invalid or expired.' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized. No token provided.' });
  }
};

module.exports = { protect };
