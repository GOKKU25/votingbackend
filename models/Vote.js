

const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  votingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voting',
    required: true,
  },
  selectedOption: {
    type: String,
    required: true,
  },
  userId: {  // Reference to the user who voted
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Vote', voteSchema);

