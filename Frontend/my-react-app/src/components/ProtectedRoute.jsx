import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredUserType = null }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('user'); // 'doctor' or 'patient'
  
  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/auth-required" state={{ from: location }} replace />;
  }
  
  // Check if specific user type is required
  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
