const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { ForgotPasswordRequest } = require('../models/ForgotPasswordRequest');
const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

const router = express.Router();

// Configure Sendinblue
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SIB_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Request password reset
router.post('/forgotpassword', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate unique UUID for reset token
    const resetToken = uuidv4();
    
    // Store reset request in the database
    await ForgotPasswordRequest.create({
      id: resetToken,
      UserId: user.id,
      isActive: true
    });

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}`;
    
    // Send email using Sendinblue
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = 'Reset Your Password';
    sendSmtpEmail.htmlContent = `
      <h1>Password Reset Request</h1>
      <p>Hello ${user.name},</p>
      <p>You requested to reset your password. Please click the link below to reset it:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;
    sendSmtpEmail.sender = { name: 'Expense Tracker', email: process.env.SIB_SENDER_EMAIL };
    sendSmtpEmail.to = [{ email }];
    
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Error sending reset email:', error);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
});

// Reset password with token
router.post('/resetpassword', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Find the reset request
    const resetRequest = await ForgotPasswordRequest.findOne({
      where: { id: token, isActive: true }
    });

    if (!resetRequest) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    // Find the user
    const user = await User.findByPk(resetRequest.UserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    user.password = hashedPassword;
    await user.save();
    
    // Deactivate the reset request
    resetRequest.isActive = false;
    await resetRequest.save();
    
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;