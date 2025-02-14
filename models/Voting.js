

const mongoose = require('mongoose');

// Define the schema for voting
const votingSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    options: [
      {
        text: { type: String, required: true },
        votes: { type: Number, default: 0 },  // Default vote count
      },
    ],
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track users who voted for this category
  },
  { timestamps: true } // This adds createdAt and updatedAt automatically
);

// Add a method to check if a user has voted
votingSchema.methods.hasVoted = function (userId) {
  return this.voters.includes(userId);
};

// Export the Voting model based on the schema
module.exports = mongoose.model('Voting', votingSchema);
