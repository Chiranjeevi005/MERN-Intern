import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axiosInstance.get(`/auth/verify-email/${token}`);
        setMessage(response.data.message);
        setVerified(true);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred during verification');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      verifyEmail();
    } else {
      setError('No verification token provided');
      setLoading(false);
    }
  }, [token]);
  
  const handleLoginRedirect = () => {
    navigate('/login');
  };
  
  if (loading) {
    return (
      <div className="form-container">
        <h2>Verifying Email</h2>
        <p>Please wait while we verify your email address...</p>
      </div>
    );
  }
  
  return (
    <div className="form-container">
      <h2>Email Verification</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      
      {verified ? (
        <div className="form-group">
          <button onClick={handleLoginRedirect} className="btn btn-block">
            Go to Login
          </button>
        </div>
      ) : (
        <div className="form-group">
          <Link to="/login" className="btn btn-block">
            Back to Login
          </Link>
        </div>
      )}
      
      <p>
        Having trouble? <Link to="/signup">Sign up again</Link> or <Link to="/login">try logging in</Link>
      </p>
    </div>
  );
};

export default VerifyEmail;