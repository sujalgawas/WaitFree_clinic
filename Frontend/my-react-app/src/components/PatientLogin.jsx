import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import axios from "axios";
import firebaseConfig from '../assets/firebaseConfig.json'; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function PatientLogin() {
  const [view, setView] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const BACKEND_URL = 'http://192.168.0.5:5000';

  useEffect(() => {
    const errors = {};
    if (touched.email && email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) errors.email = 'Please enter a valid email address';
    }
    if (touched.password && password) {
      if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    }
    if (view === 'signup' && touched.confirmPassword && confirmPassword) {
      if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }
    if (view === 'signup' && touched.phoneNumber && phoneNumber.length > 0) {
      const phoneRegex = /^\+?[\d\s\-()]+$/;
      if (!phoneRegex.test(phoneNumber)) errors.phoneNumber = 'Please enter a valid phone number';
    }
    setValidationErrors(errors);
  }, [email, password, confirmPassword, phoneNumber, touched, view]);

  const getFirebaseErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/invalid-email': 'Invalid email address format.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/email-already-in-use': 'An account with this email already exists.',
    };
    return errorMessages[errorCode] || 'An unexpected error occurred.';
  };

  // --- PATIENT LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    
    const localErrors = {};
    if (!email) localErrors.email = 'Email is required';
    if (!password) localErrors.password = 'Password is required';
    if (Object.keys(localErrors).length > 0) {
       setValidationErrors(prev => ({ ...prev, ...localErrors }));
       return;
    }
    if (validationErrors.email || validationErrors.password) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken(true);
      
      // CALL PATIENT ENDPOINT
      const response = await axios.post(`${BACKEND_URL}/login-patient`, { token });
      
      // Save to LocalStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", response.data.user);
      localStorage.setItem("userName", response.data.userName);
      
      setUserData(response.data.user_data);
      
    } catch (error) {
      console.error("Patient Login Error:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || getFirebaseErrorMessage(error.code);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- PATIENT SIGNUP ---
  const handleSignup = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true, confirmPassword: true, phoneNumber: true });
    
    const localErrors = {};
    if (!email) localErrors.email = 'Email is required';
    if (!password) localErrors.password = 'Password is required';
    if (!confirmPassword) localErrors.confirmPassword = 'Please confirm your password';
    if (password !== confirmPassword && password && confirmPassword) {
      localErrors.confirmPassword = 'Passwords do not match';
    }
    if (Object.keys(localErrors).length > 0) {
       setValidationErrors(prev => ({ ...prev, ...localErrors }));
       return;
    }
    if (Object.keys(validationErrors).length > 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Create User in Backend
      await axios.post(`${BACKEND_URL}/signup-patient`, {
        email,
        password,
        phone_number: phoneNumber
      });
      
      // 2. Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken(true);
      
      // 3. Log in to Backend to get details
      const response = await axios.post(`${BACKEND_URL}/login-patient`, { token });
      
      // Save to LocalStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", response.data.user);
      localStorage.setItem("userName", response.data.userName);

      setUserData(response.data.user_data);
      
    } catch (error) {
      console.error("Patient Signup Error:", error);
      const errorMessage = error.response?.data?.error || getFirebaseErrorMessage(error.code);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setTimeout(() => { setShowResetModal(false); setResetEmailSent(false); }, 3000);
    } catch (error) { setError(getFirebaseErrorMessage(error.code)); } finally { setLoading(false); }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      // Clear State
      setUserData(null);
      setEmail('');
      setPassword('');
      setView('login');
      // Clear Storage
      localStorage.clear();
    }).catch((error) => console.error(error));
  };

  const handleViewChange = (newView) => {
    setView(newView);
    setError(null);
    setTouched({});
    setValidationErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  if (userData) {
    return (
      <div className="min-h-screen font-inter bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-full max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome Back!</h2>
            <p className="text-gray-600">Patient Dashboard</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <p className="text-lg font-semibold text-blue-600 break-all">{userData.email}</p>
            {userData.phone_number && (
              <>
                <p className="text-sm text-gray-500 mt-3 mb-1">Phone</p>
                <p className="text-gray-700">{userData.phone_number}</p>
              </>
            )}
            <p className="text-sm text-gray-500 mt-3 mb-1">Role</p>
            <p className="text-gray-700 font-bold uppercase">{userData.user || 'Patient'}</p>
            
            {/* Displaying stored name */}
            <p className="text-sm text-gray-500 mt-3 mb-1">Username</p>
            <p className="text-gray-700">{localStorage.getItem("userName") || userData.userName}</p>
          </div>
          <button onClick={handleLogout} className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition duration-300 font-medium shadow-md">
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Simplified Modal for Patient
  if (showResetModal) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
                <form onSubmit={handleResetPassword}>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg mb-4" placeholder="Email" required />
                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg">Send Reset Link</button>
                    <button type="button" onClick={() => setShowResetModal(false)} className="w-full mt-4 text-blue-600 text-sm">Cancel</button>
                </form>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen font-inter bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        
        {/* Header for Patients */}
        <div className="text-center mb-6">
            <h1 className="text-blue-700 font-bold text-xl uppercase tracking-wider">Patient Portal</h1>
        </div>

        <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            className={`flex-1 py-2.5 text-center font-semibold rounded-md transition-all ${
              view === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => handleViewChange('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 text-center font-semibold rounded-md transition-all ${
              view === 'signup' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => handleViewChange('signup')}
          >
            Sign Up
          </button>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {view === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        <form onSubmit={view === 'login' ? handleLogin : handleSignup} noValidate>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched({ ...touched, email: true })}
              className={`w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 ${
                validationErrors.email && touched.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
              placeholder="you@example.com" required
            />
            {validationErrors.email && touched.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
          </div>
          
          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, password: true })}
                className={`w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 pr-12 ${
                  validationErrors.password && touched.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                placeholder="••••••••" required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
             {validationErrors.password && touched.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
          </div>

          {/* Confirm Password (Signup) */}
          {view === 'signup' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Confirm Password</label>
              <input
                  type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                  className={`w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 ${
                    validationErrors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                  }`}
                  placeholder="••••••••" required
                />
               {validationErrors.confirmPassword && touched.confirmPassword && <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>}
            </div>
          )}

           {/* Phone (Signup) */}
           {view === 'signup' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Phone Number</label>
              <input
                type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-200"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          )}

          {view === 'login' && (
            <div className="mb-6 text-right">
              <button type="button" onClick={() => setShowResetModal(true)} className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                Forgot Password?
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300 shadow-md"
          >
            {loading ? 'Loading...' : (view === 'login' ? 'Patient Login' : 'Create Patient Account')}
          </button>
        </form>
      </div>
    </div>
  );
}