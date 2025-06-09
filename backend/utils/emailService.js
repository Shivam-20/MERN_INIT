const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');
const { htmlToText } = require('html-to-text');
const config = require('../config/config');
const logger = require('./logger');
const { InternalServerError } = require('./errors');

class EmailService {
  constructor() {
    // Create transporter
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      auth: {
        user: config.email.username,
        pass: config.email.password,
      },
      // For development with self-signed certificates
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('SMTP connection verified');
    } catch (error) {
      logger.error('SMTP connection error:', error);
      throw new InternalServerError('Email service is not available');
    }
  }

  /**
   * Send an email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.template - Pug template name (without extension)
   * @param {Object} options.templateVars - Variables to pass to the template
   * @returns {Promise} Send email result
   */
  async sendEmail({ to, subject, template, templateVars = {} }) {
    try {
      // 1) Render HTML based on a pug template
      const html = pug.renderFile(
        path.join(__dirname, `../views/emails/${template}.pug`),
        {
          subject,
          ...templateVars,
        }
      );

      // 2) Define email options
      const mailOptions = {
        from: config.email.from,
        to,
        subject,
        html,
        text: htmlToText(html, {
          wordwrap: 120,
        }),
      };

      // 3) Send email
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw new InternalServerError('Error sending email');
    }
  }

  /**
   * Send welcome email
   * @param {string} to - Recipient email
   * @param {string} name - User's name
   * @param {string} token - Email verification token
   */
  async sendWelcomeEmail(to, name, token) {
    await this.sendEmail({
      to,
      subject: 'Welcome to Encriptofy!',
      template: 'welcome',
      templateVars: {
        name,
        token,
        url: `${config.frontendUrl}/verify-email?token=${token}`,
      },
    });
  }

  /**
   * Send password reset email
   * @param {string} to - Recipient email
   * @param {string} name - User's name
   * @param {string} token - Password reset token
   */
  async sendPasswordResetEmail(to, name, token) {
    await this.sendEmail({
      to,
      subject: 'Your password reset token (valid for 10 minutes)',
      template: 'passwordReset',
      templateVars: {
        name,
        token,
        url: `${config.frontendUrl}/reset-password?token=${token}`,
      },
    });
  }
}

// Create a singleton instance
const emailService = new EmailService();

module.exports = emailService;
