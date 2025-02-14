const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'defaultSecretKey';

// Signup route (user registration)
router.post('/signup', async (req, res) => {
  const { email, password, role, name, mobileNumber } = req.body;

  if (!email || !password || !role || !name || !mobileNumber) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = new User({ email, password, role, name, mobileNumber });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Error in Register:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route (user authentication)
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password directly with the stored password
    if (user.password !== password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token with an expiration time of 1 hour (e.g. '1h')
    const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });

    res.status(200).json({ message: 'Login successful', token, role: user.role });
  } catch (err) {
    console.error('Error in Login:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
