const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
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
    const { name, email, course, user } = req.body;
    
    // Check if student already exists
    let student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }
    
    student = new Student({
      name,
      email,
      course,
      user, // Include the user field
      enrollmentDate: Date.now()
    });
    
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    console.error(error);
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