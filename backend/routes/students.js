const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roles');

// Get all students (Admin only) with pagination
router.get('/', auth, roleCheck('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const students = await Student.find()
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
      
    const total = await Student.countDocuments();
    
    res.json({
      students,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalStudents: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student profile (Student only)
router.get('/me', auth, roleCheck('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student profile (Student only)
router.put('/me', auth, roleCheck('student'), async (req, res) => {
  try {
    const { name, email, course } = req.body;
    
    const student = await Student.findOneAndUpdate(
      { user: req.user._id },
      { name, email, course },
      { new: true, runValidators: true }
    );
    
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add student (Admin only)
router.post('/', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { name, email, course } = req.body;
    
    // Check if student already exists
    let student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }
    
    // Also check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create a new user for the student
    const user = new User({
      name,
      email,
      password: 'student123', // Default password for students
      role: 'student',
      isVerified: true // Auto-verify students created by admin
    });
    
    await user.save();
    
    // Create the student profile
    student = new Student({
      name,
      email,
      course,
      user: user._id, // Link to the user we just created
      enrollmentDate: Date.now()
    });
    
    await student.save();
    
    // Return the student with the user info
    res.status(201).json({
      ...student.toObject(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error adding student:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid student data provided' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student (Admin only)
router.put('/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { name, email, course } = req.body;
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, course },
      { new: true, runValidators: true }
    );
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete student (Admin only)
router.delete('/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({ message: 'Student removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;