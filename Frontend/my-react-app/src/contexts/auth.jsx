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
  const navigate = useNavigate(); 

  // --- CHECK AUTH ON MOUNT ---
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user'); // 'doctor' or 'patient'
      const storedUserName = localStorage.getItem('userName');

      // If no token exists in storage, stop loading and return (Guest mode)
      if (!storedToken || !storedUser) {
        setLoading(false);
        return;
      }

      try {
        // 1. Call Backend to Verify Token
        const response = await axios.post('http://127.0.0.1:5000/verify-token', { 
          token: storedToken 
        });

        // 2. If Verified (Backend returns 200 and verified=true)
        if (response.data.verified) {
          setToken(storedToken);
          setUser({
            type: storedUser,
            name: storedUserName,
            username: storedUserName
          });
        } else {
          // Token technically valid format but backend said NO
          throw new Error("Token verification returned false");
        }

      } catch (error) {
        console.error("Token Expired or Invalid:", error);
        
        // 3. If Failed (401 or Network Error), Logout immediately
        localStorage.clear(); // Clear all storage
        setToken(null);
        setUser(null);
        navigate('/'); // Send to landing page
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [navigate]);

  const login = async (credentials, userType = 'patient') => {
    try {
      // Determine endpoint based on type
      const endpoint = userType === 'doctor' 
        ? 'http://127.0.0.1:5000/login-doctor'  // Make sure these match your server.py routes exactly
        : 'http://127.0.0.1:5000/login-patient';
      
      const response = await axios.post(endpoint, credentials);
      
      const { token: newToken, user: userData, userName } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', userType);
      localStorage.setItem('userName', userName || userData?.name || 'User');
      
      // Update state
      setToken(newToken);
      setUser({
        ...userData,
        type: userType,
        name: userName || userData?.name
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
    localStorage.clear(); // Easier to just clear everything
    
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