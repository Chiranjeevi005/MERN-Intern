// Mock email service for development with better logging
const sendEmail = async (options) => {
  // In development, log the verification link to console
  console.log('=== EMAIL SIMULATION ===');
  console.log('To: ', options.to);
  console.log('Subject: ', options.subject);
  console.log('Message: ', options.text);
  console.log('========================');
  
  // For development, we can also save verification tokens to a file or log them
  // so users can manually verify their accounts
  if (options.text.includes('verify')) {
    console.log('VERIFICATION EMAIL DETECTED');
    console.log('Look for a URL in the message text that looks like:');
    console.log('- http://localhost:3000/verify-email/{token}');
    console.log('- https://your-frontend-domain.vercel.app/verify-email/{token}');
    console.log('========================');
    
    // Extract and display the verification URL more clearly
    const urlMatch = options.text.match(/(https?:\/\/[^\s]+)/g);
    if (urlMatch) {
      console.log('DIRECT VERIFICATION URL:');
      urlMatch.forEach(url => {
        if (url.includes('verify')) {
          console.log(url);
        }
      });
      console.log('========================');
    }
  }
  
  // In production, you would use a service like Nodemailer with SMTP
  return Promise.resolve();
};

module.exports = sendEmail;