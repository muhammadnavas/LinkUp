// utils/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

  }

  async sendSubmissionConfirmation(user, challenge) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@challengeplatform.com',
      to: user.email,
      subject: `Submission Received: ${challenge.title}`,
      html: `
        <h2>Submission Confirmed!</h2>
        <p>Hi ${user.name},</p>
        <p>We've received your submission for <strong>"${challenge.title}"</strong> by ${challenge.company}.</p>
        <p>Your submission will be reviewed within 24-48 hours. We'll notify you once the review is complete.</p>
        <p>Best of luck!</p>
        <p>The Challenge Platform Team</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email sending error:', error);
    }
  }

  async sendReviewNotification(user, challenge, submission) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@challengeplatform.com',
      to: user.email,
      subject: `Review Complete: ${challenge.title}`,
      html: `
        <h2>Your Submission Has Been Reviewed!</h2>
        <p>Hi ${user.name},</p>
        <p>Your submission for <strong>"${challenge.title}"</strong> has been reviewed.</p>
        <p><strong>Score:</strong> ${submission.score}/100</p>
        ${submission.feedback ? `<p><strong>Feedback:</strong></p><p>${submission.feedback}</p>` : ''}
        <p>Keep up the great work!</p>
        <p>The Challenge Platform Team</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email sending error:', error);
    }
  }
}

module.exports = new EmailService();
