import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const res = await axiosInstance.get('/students/me');
      setStudent(res.data);
      setFormData({
        name: res.data.name,
        email: res.data.email,
        course: res.data.course
      });
    } catch (err) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put('/students/me', formData);
      setStudent(res.data);
      setEditing(false);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    try {
      await axiosInstance.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setChangingPassword(false);
      setSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onPasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const closeForms = () => {
    setEditing(false);
    setChangingPassword(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return <div className="dashboard-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Student Dashboard</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {editing ? (
        <div className="form-container">
          <h3>Edit Profile</h3>
          <form onSubmit={handleUpdateProfile}>
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
              Update Profile
            </button>
            <button type="button" className="btn btn-block" onClick={closeForms}>
              Cancel
            </button>
          </form>
        </div>
      ) : changingPassword ? (
        <div className="form-container">
          <h3>Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={onPasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={onPasswordChange}
                required
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={onPasswordChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-block">
              Change Password
            </button>
            <button type="button" className="btn btn-block" onClick={closeForms}>
              Cancel
            </button>
          </form>
        </div>
      ) : (
        <div>
          {student && (
            <div className="form-container">
              <h3>Profile Information</h3>
              <div className="form-group">
                <label>Name:</label>
                <p>{student.name}</p>
              </div>
              <div className="form-group">
                <label>Email:</label>
                <p>{student.email}</p>
              </div>
              <div className="form-group">
                <label>Course:</label>
                <p>{student.course}</p>
              </div>
              <div className="form-group">
                <label>Enrollment Date:</label>
                <p>{student.enrollmentDate && new Date(student.enrollmentDate).toLocaleDateString()}</p>
              </div>
              <button className="btn btn-block" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
              <button className="btn btn-block" onClick={() => setChangingPassword(true)}>
                Change Password
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;