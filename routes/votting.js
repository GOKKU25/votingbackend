

const express = require('express');
const mongoose = require('mongoose');
const Voting = require('../models/Voting');
const Vote = require('../models/Vote');
const User = require('../models/user');
const router = express.Router();

// Create a new voting category
router.post('/create', async (req, res) => {
  try {
    const { category, options } = req.body;

    // Basic validation for category and options
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ message: "Valid category is required." });
    }
    if (!options || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ message: "Options must be a non-empty array." });
    }

    // Check for duplicate options
    const uniqueOptions = [...new Set(options)];
    if (uniqueOptions.length !== options.length) {
      return res.status(400).json({ message: "Options must be unique." });
    }

    // Prepare options with initial votes as 0
    const optionsWithVotes = options.map(option => ({ text: option, votes: 0 }));

    // Create a new Voting document and save it
    const newVoting = new Voting({ category, options: optionsWithVotes });
    await newVoting.save();

    // Send the created voting (which now includes createdAt)
    res.status(201).json(newVoting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating voting', error: error.message });
  }
});

// Get all voting categories
router.get('/all', async (req, res) => {
  try {
    const votings = await Voting.find().sort({ createdAt: -1 });
    res.json(votings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching voting categories', error: error.message });
  }
});

// Submit a vote
router.post('/submit', async (req, res) => {
  try {
    const { votingId, selectedOption, userEmail } = req.body;

    // Validate the votingId
    if (!mongoose.Types.ObjectId.isValid(votingId)) {
      return res.status(400).json({ message: 'Invalid voting ID format' });
    }

    // Validate the selected option
    if (!selectedOption || typeof selectedOption !== 'string') {
      return res.status(400).json({ message: 'Valid option is required' });
    }

    // Find the voting document
    const voting = await Voting.findById(votingId);
    if (!voting || voting.options.length === 0) {
      return res.status(400).json({ message: 'No available options for this voting category' });
    }

    // Check if the selected option is valid
    const selectedOptionExists = voting.options.some(option => option.text === selectedOption);
    if (!selectedOptionExists) {
      return res.status(400).json({ message: 'Invalid voting option selected' });
    }

    // Find the user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has already voted in this category
    if (user.votedCategories.includes(votingId)) {
      return res.status(400).json({ message: 'You have already voted in this category' });
    }

    // Update the voting options and add the user to the voters list
    const result = await Voting.updateOne(
      { _id: votingId, "options.text": selectedOption },
      { 
        $inc: { "options.$.votes": 1 }, 
        $push: { voters: user._id }
      }
    );

    // Check if the vote was successfully updated
    if (result.nModified === 0) {
      return res.status(400).json({ message: 'Failed to update vote count' });
    }

    // Add the voting category to the user's votedCategories to prevent re-voting
    user.votedCategories.push(votingId);
    await user.save();

    // Save the vote in the Vote model for historical tracking
    const newVote = new Vote({ votingId, selectedOption, userId: user._id });
    await newVote.save();

    // Return the updated voting data
    res.status(201).json({
      message: 'Vote submitted successfully',
      voting: await Voting.findById(votingId) // Send updated voting data with vote counts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting vote', error: error.message });
  }
});




router.get('/result/:id', async (req, res) => {
  try {
    const votingId = req.params.id;
    console.log('Received votingId:', votingId);  // Debugging log

    // Check if the votingId is valid and convert to ObjectId
    if (!mongoose.Types.ObjectId.isValid(votingId)) {
      return res.status(400).json({ message: 'Invalid voting ID.' });
    }

    // Convert string ID to MongoDB ObjectId
    const votingObjectId = mongoose.Types.ObjectId(votingId);

    // Find the voting document using the ObjectId
    const voting = await Voting.findById(votingObjectId);
    if (!voting) {
      return res.status(404).json({ message: 'Voting category not found' });
    }

    // Respond with the voting details
    res.json(voting);
  } catch (error) {
    console.error('Error fetching voting result:', error);
    res.status(500).json({ message: 'Error fetching voting result', error: error.message });
  }
});


// POST route for publishing results
router.post('/publish-result', async (req, res) => {
  try {
    const { votingId } = req.body;

    // Find the voting by ID
    const voting = await Voting.findById(votingId);
    if (!voting) {
      return res.status(404).json({ message: 'Voting category not found' });
    }

    // Logic for publishing the result (e.g., marking the voting as published)
    voting.published = true; // Mark the voting as published
    await voting.save();

    res.status(200).json({ message: 'Voting results published successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error publishing voting results', error: error.message });
  }
});




// DELETE route to delete a voting category by ID
router.delete('/:id', async (req, res) => {
  try {
    const votingId = req.params.id;

    // Try to find and delete the voting category by its ID
    const deletedVoting = await Voting.findByIdAndDelete(votingId);

    if (!deletedVoting) {
      return res.status(404).json({ message: 'Voting category not found' });
    }

    res.status(200).json({ message: 'Voting category deleted successfully' });
  } catch (error) {
    console.error('Error deleting voting:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

