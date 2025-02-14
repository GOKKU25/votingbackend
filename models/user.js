

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store password as plain text
  role: { type: String, enum: ['voter'], required: true },
  votedCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Voting' }] // Track voted categories
});

const User = mongoose.models.voter || mongoose.model('voter', userSchema);

module.exports = User;
