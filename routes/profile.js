// const express = require('express');
// const jwt = require('jsonwebtoken');
// const User = require('../models/user'); // Assuming you have a User model
// const router = express.Router();

// // Middleware to authenticate the user using the token
// const authenticate = (req, res, next) => {
//   const token = req.headers['authorization']?.split(' ')[1]; // Bearer token

//   if (!token) {
//     return res.status(401).json({ message: 'No token provided' });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ message: 'Invalid token' });
//     }
//     req.userId = decoded.userId; // Save user ID in request object
//     next();
//   });
// };

// // Route to get user profile data
// router.get('/profile', authenticate, async (req, res) => {
//   try {
//     // Find the user by userId stored in the token payload
//     const user = await User.findById(req.userId).select('name studentId mobileNo email');
    
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json(user); // Send the user data to the frontend
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;




























const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'defaultSecretKey';

// Middleware to authenticate the user using the token
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.userId = decoded.email; // Save user email in request object
    next();
  });
};

// Route to get user profile data
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.userId }).select('name mobileNumber email role');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
