import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    console.log('ProtectedRoute check:', { token, user }); // Debug log
    
    if (token && user && user.role) {
      setIsAuthenticated(true);
      setUserRole(user.role);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
    // Still checking authentication
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Not authenticated, redirect to login
    console.log('Not authenticated, redirecting to login'); // Debug log
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Role doesn't match, redirect to appropriate dashboard
    console.log('Role mismatch, redirecting to:', `/${userRole}`); // Debug log
    return <Navigate to={`/${userRole}`} />;
  }

  // Authenticated and role matches, render children
  console.log('Access granted to protected route'); // Debug log
  return children;
};

export default ProtectedRoute;