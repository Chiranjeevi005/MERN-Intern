import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  
  const navigate = useNavigate();
  
  const { name, email, password, role } = formData;
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setVerificationSent(false);
    
    try {
      const response = await axiosInstance.post('/auth/signup', {
        name,
        email,
        password,
        role
      });
      
      // If we get here, the user was created successfully
      setSuccess(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      
      // If the error indicates that a verification email was sent, update state
      if (errorMessage.includes('verification email has been sent')) {
        setVerificationSent(true);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    
    try {
      await axiosInstance.post('/auth/resend-verification', { email });
      setVerificationSent(true);
      setError('Verification email resent successfully. Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="form-container">
        <h2>Registration Successful</h2>
        <div className="alert alert-success">
          Please check your email to verify your account before logging in.
        </div>
        <Link to="/login" className="btn btn-block">
          Go to Login
        </Link>
      </div>
    );
  }
  
  return (
    <div className="form-container">
      <h2>Sign Up</h2>
      {error && !verificationSent && <div className="alert alert-error">{error}</div>}
      {verificationSent && (
        <div className="alert alert-info">
          A verification email has been sent to your email address. Please check your inbox.
        </div>
      )}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
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
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            minLength="6"
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={onChange}
            required
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      
      {verificationSent && (
        <div className="form-group">
          <button 
            onClick={handleResendVerification} 
            className="btn btn-secondary btn-block" 
            disabled={loading}
          >
            {loading ? 'Resending...' : 'Resend Verification Email'}
          </button>
        </div>
      )}
      
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Signup;