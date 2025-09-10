const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./server');
const User = require('./models/User');
const Student = require('./models/Student');

describe('Students API', () => {
  let adminToken, studentToken, adminUser, studentUser;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://localhost:27017/mern-role-dashboard-test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    // Clean up any existing data
    await User.deleteMany({});
    await Student.deleteMany({});

    // Create admin user
    adminUser = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });
    await adminUser.save();
    adminToken = adminUser.generateAuthToken();

    // Create student user
    studentUser = new User({
      name: 'Student User',
      email: 'student@test.com',
      password: 'student123',
      role: 'student',
      isVerified: true
    });
    await studentUser.save();
    studentToken = studentUser.generateAuthToken();

    // Create student profile
    const studentProfile = new Student({
      name: 'Student User',
      email: 'student@test.com',
      course: 'MERN Bootcamp',
      user: studentUser._id
    });
    await studentProfile.save();
  });

  afterAll(async () => {
    // Clean up database and close connection
    await User.deleteMany({});
    await Student.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/students', () => {
    it('should get all students for admin', async () => {
      const res = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.students).toBeInstanceOf(Array);
      expect(res.body).toHaveProperty('currentPage');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('totalStudents');
    });

    it('should not allow student to get all students', async () => {
      const res = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(res.body.message).toBe('Access denied');
    });
  });

  describe('GET /api/students/me', () => {
    it('should get student profile for student', async () => {
      const res = await request(app)
        .get('/api/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.name).toBe('Student User');
      expect(res.body.email).toBe('student@test.com');
    });

    it('should not allow admin to get student profile', async () => {
      const res = await request(app)
        .get('/api/students/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);

      expect(res.body.message).toBe('Access denied');
    });
  });

  describe('PUT /api/students/me', () => {
    it('should update student profile for student', async () => {
      const res = await request(app)
        .put('/api/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Updated Student',
          email: 'updated@student.com',
          course: 'Advanced MERN'
        })
        .expect(200);

      expect(res.body.name).toBe('Updated Student');
      expect(res.body.email).toBe('updated@student.com');
      expect(res.body.course).toBe('Advanced MERN');
    });

    it('should not allow admin to update student profile', async () => {
      const res = await request(app)
        .put('/api/students/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Student',
          email: 'updated@student.com',
          course: 'Advanced MERN'
        })
        .expect(403);

      expect(res.body.message).toBe('Access denied');
    });
  });

  describe('POST /api/students', () => {
    it('should add student for admin', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Student',
          email: 'new-unique@student.com', // Use unique email
          course: 'React Bootcamp',
          user: studentUser._id
        })
        .expect(201);

      expect(res.body.name).toBe('New Student');
      expect(res.body.email).toBe('new-unique@student.com');
      expect(res.body.course).toBe('React Bootcamp');
    });

    it('should not allow student to add student', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Another Student',
          email: 'another-unique@student.com', // Use unique email
          course: 'Vue Bootcamp',
          user: studentUser._id
        })
        .expect(403);

      expect(res.body.message).toBe('Access denied');
    });
  });

  describe('PUT /api/students/:id', () => {
    let studentId;

    beforeAll(async () => {
      const student = await Student.findOne({ email: 'new-unique@student.com' });
      studentId = student._id;
    });

    it('should update student for admin', async () => {
      const res = await request(app)
        .put(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Student',
          email: 'updated-unique@student.com', // Use unique email
          course: 'Advanced React'
        })
        .expect(200);

      expect(res.body.name).toBe('Updated Student');
      expect(res.body.email).toBe('updated-unique@student.com');
      expect(res.body.course).toBe('Advanced React');
    });

    it('should not allow student to update student', async () => {
      const res = await request(app)
        .put(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Hacked Student',
          email: 'hacked@student.com',
          course: 'Hacked Course'
        })
        .expect(403);

      expect(res.body.message).toBe('Access denied');
    });
  });

  describe('DELETE /api/students/:id', () => {
    let studentId;

    beforeAll(async () => {
      // Create another student for this test
      const student = new Student({
        name: 'Delete Student',
        email: 'delete@student.com',
        course: 'Delete Course',
        user: studentUser._id
      });
      await student.save();
      studentId = student._id;
    });

    it('should delete student for admin', async () => {
      const res = await request(app)
        .delete(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.message).toBe('Student removed');
    });

    it('should not allow student to delete student', async () => {
      // Create another student for this test
      const student = new Student({
        name: 'Another Delete Student',
        email: 'another-delete@student.com',
        course: 'Another Delete Course',
        user: studentUser._id
      });
      await student.save();

      const res = await request(app)
        .delete(`/api/students/${student._id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(res.body.message).toBe('Access denied');
    });
  });
});