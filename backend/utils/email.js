// Mock email service for development
const sendEmail = async (options) => {
  // In production, you would use a service like Nodemailer with SMTP
  console.log('Email sent:', options);
  return Promise.resolve();
};

module.exports = sendEmail;