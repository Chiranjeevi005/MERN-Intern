import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const { email, password } = formData;
  
  // Check for query parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const verified = searchParams.get('verified');
    const message = searchParams.get('message');
    const errorMessage = searchParams.get('error');
    
    if (verified === 'true' && message) {
      setSuccess(message);
    }
    
    if (errorMessage) {
      setError(errorMessage);
    }
  }, [location.search]);
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setVerificationSent(false);
    
    try {
      const res = await axiosInstance.post('/auth/login', {
        email,
        password
      });
      
      // Save token and user data to localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Redirect based on role
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
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
    setSuccess('');
    
    try {
      await axiosInstance.post('/auth/resend-verification', { email });
      setVerificationSent(true);
      setSuccess('Verification email resent successfully. Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="form-container">
      <h2>Login</h2>
      {error && !verificationSent && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {verificationSent && (
        <div className="alert alert-info">
          A verification email has been sent to your email address. Please check your inbox.
        </div>
      )}
      <form onSubmit={onSubmit}>
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
          />
        </div>
        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
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
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
      <p>
        <Link to="/forgot-password">Forgot Password?</Link>
      </p>
    </div>
  );
};

export default Login;