const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initialise the email transporter based on available env vars.
 * Called once at startup.
 */
function initEmailTransporter() {
  if (process.env.SENDGRID_API_KEY) {
    // SendGrid SMTP relay
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
    console.log('📧  Email configured via SendGrid');
  } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Gmail SMTP
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('📧  Email configured via Gmail SMTP');
  } else {
    console.log('📧  Email not configured — notifications will be logged to console');
  }
}

/**
 * Send a claim notification email.
 * Gracefully logs to console if email is not configured or the contact
 * doesn't look like an email address.
 */
async function sendClaimNotification(to, itemTitle, claimerName) {
  // Check if `to` looks like an email
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);

  if (!isEmail) {
    console.log(`📧  Skipping email — "${to}" does not look like an email address`);
    return;
  }

  const subject = `Your item "${itemTitle}" has been claimed on FoundIt!`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem;">
      <h2 style="color: #6366f1;">🎉 Great news!</h2>
      <p>Someone has successfully verified and claimed your listing:</p>
      <div style="background: #f4f7fb; border-radius: 12px; padding: 1.25rem; margin: 1rem 0;">
        <strong style="font-size: 1.1rem;">${itemTitle}</strong>
      </div>
      <p><strong>${claimerName}</strong> answered the verification question correctly.</p>
      <p>Please reach out to coordinate returning or picking up the item.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0;">
      <p style="color: #64748b; font-size: 0.85rem;">— The FoundIt Team</p>
    </div>
  `;

  if (!transporter) {
    console.log(`📧  [DRY RUN] Would send email to ${to}:`);
    console.log(`    Subject: ${subject}`);
    console.log(`    Claimer: ${claimerName}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@campusclaim.app',
      to,
      subject,
      html,
    });
    console.log(`📧  Claim notification sent to ${to}`);
  } catch (err) {
    console.error('📧  Failed to send email:', err.message);
    // Don't throw — email failure shouldn't break the claim flow
  }
}

module.exports = { initEmailTransporter, sendClaimNotification };
