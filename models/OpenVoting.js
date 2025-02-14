const mongoose = require('mongoose');

// Define schema for open voting
const openVotingSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
  },
  options: [
    {
      type: String,
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const OpenVoting = mongoose.model('OpenVoting', openVotingSchema);

module.exports = OpenVoting;
