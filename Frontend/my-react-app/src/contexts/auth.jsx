import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  loading: true
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Now this will work because AuthProvider is inside Router

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedUserName = localStorage.getItem('userName');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser({
          type: storedUser,
          name: storedUserName,
          username: storedUserName
        });
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials, userType = 'patient') => {
    try {
      const endpoint = userType === 'doctor' 
        ? 'http://127.0.0.1:5000/doctor/login' 
        : 'http://127.0.0.1:5000/patient/login';
      
      const response = await axios.post(endpoint, credentials);
      
      const { token: newToken, user: userData, userName } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', userType);
      localStorage.setItem('userName', userName || userData.name || userData.username);
      
      // Update state
      setToken(newToken);
      setUser({
        ...userData,
        type: userType,
        name: userName || userData.name || userData.username
      });

      // Redirect based on user type
      if (userType === 'doctor') {
        navigate('/doctor-home');
      } else {
        navigate('/patient-home');
      }

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    localStorage.removeItem('userLocation');
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Redirect to landing page
    navigate('/');
  };

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
