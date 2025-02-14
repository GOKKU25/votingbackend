const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/user'); // Assuming you have a user model to get user details
const router = express.Router();

// Route for handling password reset request
router.post('/', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a transporter object using Gmail service with the app password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL, // Your email (e.g., your-email@gmail.com)
        pass: process.env.APP_PASSWORD, // Gmail App Password (generated from Google Account)
      },
    });

    // Define email options (sending user password)
    const mailOptions = {
      from: process.env.EMAIL, // Sender's email address
      to: email, // Receiver's email address
      subject: 'Your Password Reset Request',
      text: `Hello ${user.name},\n\nYour password is: ${user.password}\n\nPlease keep it secure and do not share it with anyone.`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error); // Log detailed error
        return res.status(500).json({ message: 'Error sending email', error: error.message });
      }

      console.log('Email sent: ' + info.response); // Log success message
      return res.status(200).json({ message: 'Password sent to your email!' });
    });
  } catch (error) {
    console.error('Error:', error); // Log any errors that occur during the try block
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
