import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useProfileCompletion } from '../hooks/useProfileCompletion';

const ProtectedRoute = ({ children, requiredUserType = null,requireProfileCompletion = false }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('user'); // 'doctor' or 'patient'
  const { profileCompleted, loading } = useProfileCompletion();
  
  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/auth-required" state={{ from: location }} replace />;
  }
  
  // Check if specific user type is required
  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to="/unauthorized" replace />;
  }

    // Profile not completed - redirect to onboarding form
  if (requireProfileCompletion && profileCompleted === false) {
    const formPath = userType === 'doctor' ? '/doctor-form' : '/patient-form';
    
    // Prevent redirect loop - don't redirect if already on form page
    if (location.pathname !== formPath) {
      return <Navigate to={formPath} replace />;
    }
  }

  // Profile already completed - prevent access to form
  if (profileCompleted === true) {
    const formPaths = ['/doctor-form', '/patient-form'];
    if (formPaths.includes(location.pathname)) {
      const homePath = userType === 'doctor' ? '/doctor-home' : '/patient-home';
      return <Navigate to={homePath} replace />;
    }
  }
  
  // Loading profile completion status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return children;
};

export default ProtectedRoute;
