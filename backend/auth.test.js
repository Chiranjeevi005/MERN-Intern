const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('./server');
const User = require('./models/User');
const Student = require('./models/Student');

describe('Authentication API', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://localhost:27017/mern-role-dashboard-test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  });

  afterAll(async () => {
    // Clean up database and close connection
    await User.deleteMany({});
    await Student.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'unique-test@example.com', // Use unique email
          password: 'password123',
          role: 'student'
        })
        .expect(201);

      expect(res.body.message).toBe('User registered successfully. Please check your email to verify your account.');
    });

    it('should not register a user with existing email', async () => {
      // First, create a user
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'unique-test2@example.com', // Use unique email
          password: 'password123',
          role: 'student'
        });

      // Try to create another user with the same email
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User 2',
          email: 'unique-test2@example.com', // Same email as above
          password: 'password123',
          role: 'student'
        })
        .expect(400);

      expect(res.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a verified user successfully', async () => {
      // Create a user
      const user = new User({
        name: 'Test User',
        email: 'test3@example.com',
        password: 'password123',
        role: 'student',
        isVerified: true
      });
      await user.save();

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test3@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user.name).toBe('Test User');
      expect(res.body.user.email).toBe('test3@example.com');
    });

    it('should not login an unverified user', async () => {
      // Create an unverified user
      const user = new User({
        name: 'Test User',
        email: 'test4@example.com',
        password: 'password123',
        role: 'student',
        isVerified: false
      });
      await user.save();

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test4@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(res.body.message).toBe('Please verify your email');
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(400);

      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset link for existing user', async () => {
      // Create a user
      const user = new User({
        name: 'Test User',
        email: 'test5@example.com',
        password: 'password123',
        role: 'student',
        isVerified: true
      });
      await user.save();

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test5@example.com'
        })
        .expect(200);

      expect(res.body.message).toBe('Password reset link sent to your email');
    });

    it('should not send password reset link for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        })
        .expect(400);

      expect(res.body.message).toBe('User with this email does not exist');
    });
  });

  describe('PUT /api/auth/reset-password/:token', () => {
    it('should reset password with valid token', async () => {
      // Create a user
      const user = new User({
        name: 'Test User',
        email: 'test6@example.com',
        password: 'password123',
        role: 'student',
        isVerified: true
      });
      await user.save();

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      const res = await request(app)
        .put(`/api/auth/reset-password/${resetToken}`)
        .send({
          password: 'newpassword123'
        })
        .expect(200);

      expect(res.body.message).toBe('Password reset successfully');

      // Verify password was changed by reloading the user from database
      // Add a small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 100));
      const updatedUser = await User.findById(user._id);
      expect(updatedUser).not.toBeNull();
      const isMatch = await bcrypt.compare('newpassword123', updatedUser.password);
      expect(isMatch).toBe(true);
    });

    it('should not reset password with invalid token', async () => {
      const res = await request(app)
        .put('/api/auth/reset-password/invalidtoken')
        .send({
          password: 'newpassword123'
        })
        .expect(400);

      expect(res.body.message).toBe('Invalid or expired token');
    });
  });

  describe('PUT /api/auth/change-password', () => {
    let user, token;

    beforeEach(async () => {
      // Create a user with unique email
      user = new User({
        name: 'Test User',
        email: `unique-test7-${Date.now()}@example.com`, // Use timestamp for unique email
        password: 'password123',
        role: 'student',
        isVerified: true
      });
      await user.save();

      // Generate token
      token = user.generateAuthToken();
    });

    it('should change password with correct current password', async () => {
      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        })
        .expect(200);

      expect(res.body.message).toBe('Password changed successfully');

      // Verify password was changed
      const updatedUser = await User.findById(user._id);
      const isMatch = await bcrypt.compare('newpassword123', updatedUser.password);
      expect(isMatch).toBe(true);
    });

    it('should not change password with incorrect current password', async () => {
      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        })
        .expect(400);

      expect(res.body.message).toBe('Current password is incorrect');
    });
  });
});