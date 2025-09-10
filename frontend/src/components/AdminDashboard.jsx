import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [currentPage]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/students?page=${currentPage}&limit=5`);
      setStudents(res.data.students);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/students', formData);
      setSuccess('Student added successfully');
      setShowAddForm(false);
      setFormData({ name: '', email: '', course: '' });
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student');
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/students/${editingStudent._id}`, formData);
      setSuccess('Student updated successfully');
      setEditingStudent(null);
      setFormData({ name: '', email: '', course: '' });
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axiosInstance.delete(`/students/${id}`);
        setSuccess('Student deleted successfully');
        fetchStudents();
      } catch (err) {
        setError('Failed to delete student');
      }
    }
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openEditForm = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      course: student.course
    });
  };

  const closeForms = () => {
    setShowAddForm(false);
    setEditingStudent(null);
    setFormData({ name: '', email: '', course: '' });
    setError('');
    setSuccess('');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <button className="btn" onClick={() => setShowAddForm(true)}>
          Add Student
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showAddForm && (
        <div className="form-container">
          <h3>Add Student</h3>
          <form onSubmit={handleAddStudent}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="course">Course</label>
              <input
                type="text"
                id="course"
                name="course"
                value={formData.course}
                onChange={onChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-block">
              Add Student
            </button>
            <button type="button" className="btn btn-block" onClick={closeForms}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {editingStudent && (
        <div className="form-container">
          <h3>Edit Student</h3>
          <form onSubmit={handleEditStudent}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="course">Course</label>
              <input
                type="text"
                id="course"
                name="course"
                value={formData.course}
                onChange={onChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-block">
              Update Student
            </button>
            <button type="button" className="btn btn-block" onClick={closeForms}>
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Enrollment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">Loading...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="5">No students found</td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.course}</td>
                  <td>{new Date(student.enrollmentDate).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn"
                      onClick={() => openEditForm(student)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn"
                      onClick={() => handleDeleteStudent(student._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {[...Array(totalPages).keys()].map((page) => (
            <button
              key={page + 1}
              className={currentPage === page + 1 ? 'active' : ''}
              onClick={() => handlePageChange(page + 1)}
            >
              {page + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;