const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const verifyUser = async (email) => {
  try {
    // Connect to database
    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found with email:', email);
      process.exit(1);
    }
    
    if (user.isVerified) {
      console.log('User is already verified:', email);
      process.exit(0);
    }
    
    // Verify user
    user.isVerified = true;
    await user.save();
    
    console.log('User verified successfully:', email);
    console.log('User details:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error verifying user:', error);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Usage: node verifyUser.js <email>');
  console.log('Example: node verifyUser.js admin@example.com');
  process.exit(1);
}

verifyUser(email);