// backend/utils/mail.js
const nodemailer = require('nodemailer');

const FROM = process.env.MAIL_FROM || `no-reply@${process.env.FRONTEND_DOMAIN || 'localhost'}`;

// Try to build a transporter if env config exists
function createTransporter() {
  const host = process.env.MAIL_HOST;
  const port = process.env.MAIL_PORT;
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!host || !port || !user || !pass) {
    // No mail config — we will not send mail but return null
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
}

const transporter = createTransporter();

async function sendMail(to, subject, html, text) {
  // if no transporter configured, just log and return resolved Promise
  if (!transporter) {
    console.log('mail disabled (no MAIL_HOST/MAIL_USER). would send to:', to, 'subject:', subject);
    return Promise.resolve({ warning: 'mail-not-configured' });
  }

  const msg = {
    from: FROM,
    to,
    subject,
    text: text || html?.replace(/<[^>]+>/g, '') || '',
    html: html || text || '',
  };

  return transporter.sendMail(msg);
}

module.exports = sendMail;
