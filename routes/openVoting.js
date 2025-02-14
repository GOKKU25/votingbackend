const express = require('express');
const router = express.Router();
const OpenVoting = require('../models/OpenVoting');

// POST route to create open voting
router.post('/create', async (req, res) => {
  try {
    const { category, options } = req.body;

    if (!category || !options || options.length < 2) {
      return res.status(400).json({ message: 'Category and at least two options are required.' });
    }

    const newOpenVoting = new OpenVoting({
      category,
      options,
    });

    const savedVoting = await newOpenVoting.save();
    res.status(201).json(savedVoting);
  } catch (err) {
    console.error('POST Error:', err);
    res.status(500).json({ message: 'Server error occurred while creating voting', error: err.message });
  }
});

// GET route to fetch open voting data
router.get('/', async (req, res) => {
  try {
    const openVotings = await OpenVoting.find();
    res.status(200).json(openVotings);
  } catch (err) {
    console.error('GET Error:', err);
    res.status(500).json({ message: 'Server error occurred while fetching voting data', error: err.message });
  }
});

module.exports = router;
