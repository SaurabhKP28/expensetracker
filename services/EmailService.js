const SibApiV3Sdk = require('sib-api-v3-sdk');

class EmailService {
  constructor() {
    this.client = SibApiV3Sdk.ApiClient.instance;
    this.client.authentications['api-key'].apiKey = process.env.SIB_API_KEY;
    this.emailApi = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}`;
    
    const sender = {
      email: process.env.SIB_SENDER_EMAIL,
      name: 'Expense Tracker'
    };

    const receivers = [{ email }];

    const emailData = {
      sender,
      to: receivers,
      subject: 'Reset Your Password',
      htmlContent: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    try {
      await this.emailApi.sendTransacEmail(emailData);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();