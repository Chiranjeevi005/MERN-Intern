const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      // If user exists but is not verified, provide a way to resend verification
      if (!user.isVerified) {
        // Generate new verification token
        const verificationToken = user.generateAuthToken();
        const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/verify-email/${verificationToken}`;
        
        // Log for debugging
        console.log('Resend verification - Backend URL:', process.env.BACKEND_URL);
        console.log('Resend verification - Generated URL:', verificationUrl);
        
        // Send verification email
        await sendEmail({
          to: user.email,
          subject: 'Email Verification - Resend',
          text: `Please verify your email by clicking on this link: ${verificationUrl}`
        });
        
        return res.status(400).json({ 
          message: 'User already exists but is not verified. A new verification email has been sent.' 
        });
      }
      return res.status(400).json({ message: 'User already exists and is verified' });
    }
    
    // Create user
    user = new User({
      name,
      email,
      password,
      role: role || 'student'
      // Removed isVerified: true to enable proper email verification
    });
    
    await user.save();
    
    // If user is a student, create student profile
    if (user.role === 'student') {
      const student = new Student({
        name,
        email,
        course: 'Not Assigned', // Provide a default course
        user: user._id
      });
      await student.save();
    }
    
    // Generate email verification token
    const verificationToken = user.generateAuthToken();
    
    // Send verification email
    const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/verify-email/${verificationToken}`;
    
    // Log for debugging
    console.log('Signup verification - Backend URL:', process.env.BACKEND_URL);
    console.log('Signup verification - Generated URL:', verificationUrl);
    
    await sendEmail({
      to: user.email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking on this link: ${verificationUrl}`
    });
    
    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }
    
    if (user.isVerified) {
      // If already verified, redirect to frontend login page with success message
      const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?verified=true`;
      return res.redirect(redirectUrl);
    }
    
    user.isVerified = true;
    await user.save();
    
    // Redirect to frontend login page with success message
    const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?verified=true&message=Email verified successfully. You can now log in.`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error(error);
    if (error.name === 'TokenExpiredError') {
      // Redirect to frontend login page with error message
      const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=Verification token has expired. Please sign up again.`;
      return res.redirect(redirectUrl);
    }
    // Redirect to frontend login page with generic error message
    const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=Server error during verification`;
    res.redirect(redirectUrl);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check if email is verified
    if (!user.isVerified) {
      // Generate new verification token
      const verificationToken = user.generateAuthToken();
      const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/verify-email/${verificationToken}`;
      
      // Log for debugging
      console.log('Login verification - Backend URL:', process.env.BACKEND_URL);
      console.log('Login verification - Generated URL:', verificationUrl);
      
      // Send verification email
      await sendEmail({
        to: user.email,
        subject: 'Email Verification Required',
        text: `Please verify your email by clicking on this link: ${verificationUrl}`
      });
      
      return res.status(400).json({ 
        message: 'Please verify your email. A verification email has been sent to your email address.' 
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = user.generateAuthToken();
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User with this email does not exist' });
    }
    
    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    
    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      text: `You requested a password reset. Please click on this link to reset your password: ${resetUrl}\n\nIf you didn't request this, please ignore this email.`
    });
    
    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.put('/reset-password/:token', async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
      
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    // Add error handling for the save operation
    try {
      await user.save();
      res.json({ message: 'Password reset successfully' });
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      return res.status(500).json({ message: 'Failed to reset password. Please try again.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password (authenticated users)
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Set new password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    // In a real app, you would invalidate the token here
    // For JWT, we'll just send a success response
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }
    
    // Generate new verification token
    const verificationToken = user.generateAuthToken();
    const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/verify-email/${verificationToken}`;
    
    // Log for debugging
    console.log('Resend verification - Backend URL:', process.env.BACKEND_URL);
    console.log('Resend verification - Generated URL:', verificationUrl);
    
    // Send verification email
    await sendEmail({
      to: user.email,
      subject: 'Email Verification - Resend',
      text: `Please verify your email by clicking on this link: ${verificationUrl}`
    });
    
    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;