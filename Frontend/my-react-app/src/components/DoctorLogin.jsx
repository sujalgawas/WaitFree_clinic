import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import axios from "axios";
import { AuthContext } from '../contexts/auth';
import firebaseConfig from '../assets/firebaseConfig.json';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function DoctorLogin({ darkMode }) {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
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
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const BACKEND_URL = 'http://127.0.0.1:5000';

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
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/invalid-credential': 'Invalid email or password.'
    };
    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  };

  // --- DOCTOR LOGIN ---
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
      // 1. Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const firebaseToken = await user.getIdToken(true);
      
      // 2. Backend Login
      const response = await axios.post(`${BACKEND_URL}/login-doctor`, { token: firebaseToken });
      
      // 3. Store in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", "doctor");
      localStorage.setItem("userName", response.data.userName || user.email);
      
      // 4. Navigate to doctor home
      navigate('/doctor-home');
      window.location.reload();
      
    } catch (error) {
      console.error("Doctor Login Error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          getFirebaseErrorMessage(error.code);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- DOCTOR SIGNUP ---
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
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const firebaseToken = await user.getIdToken(true);
      
      // 2. Create user in Backend
      await axios.post(`${BACKEND_URL}/signup-doctor`, {
        email,
        password,
        phone_number: phoneNumber,
        firebase_uid: user.uid
      });
      
      // 3. Login to get backend token
      const response = await axios.post(`${BACKEND_URL}/login-doctor`, { token: firebaseToken });
      
      // 4. Store in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", "doctor");
      localStorage.setItem("userName", response.data.userName || user.email);

      // 5. Navigate to doctor home
      navigate('/doctor-home');
      window.location.reload();
      
    } catch (error) {
      console.error("Doctor Signup Error:", error);
      const errorMessage = error.response?.data?.error || getFirebaseErrorMessage(error.code);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setTouched({ email: true });
      setValidationErrors({ email: 'Please enter your email address' });
      return;
    }
    if (validationErrors.email) {
       setTouched({ email: true });
       return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setTimeout(() => {
        setShowResetModal(false);
        setResetEmailSent(false);
      }, 3000);
    } catch (error) {
      setError(getFirebaseErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
    setError(null);
    setTouched({});
    setValidationErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  if (showResetModal) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 pt-20 ${
        darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 to-teal-100'
      }`}>
        <div className={`p-8 rounded-2xl shadow-xl w-full max-w-md ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Reset Password
          </h2>
          <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
          {resetEmailSent ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Password reset email sent! Check your inbox.
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className={`w-full px-4 py-3 border rounded-lg mb-4 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                placeholder="Email" 
                required 
              />
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowResetModal(false)} 
                className="w-full mt-4 text-teal-600 text-sm hover:underline"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 pt-20 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 to-teal-100'
    }`}>
      <div className={`p-8 rounded-2xl shadow-xl w-full max-w-md ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        
        <div className="text-center mb-6">
          <h1 className="text-teal-600 font-bold text-xl uppercase tracking-wider">
            Doctor Portal
          </h1>
        </div>

        <div className={`flex mb-8 rounded-lg p-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <button
            type="button"
            className={`flex-1 py-2.5 text-center font-semibold rounded-md transition-all ${
              view === 'login' 
                ? darkMode ? 'bg-gray-600 text-teal-400 shadow-sm' : 'bg-white text-teal-600 shadow-sm'
                : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => handleViewChange('login')}
          >
            Doctor Login
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 text-center font-semibold rounded-md transition-all ${
              view === 'signup' 
                ? darkMode ? 'bg-gray-600 text-teal-400 shadow-sm' : 'bg-white text-teal-600 shadow-sm'
                : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => handleViewChange('signup')}
          >
            New Registration
          </button>
        </div>

        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {view === 'login' ? 'Welcome Doctor' : 'Create Doctor Account'}
        </h2>
        
        <form onSubmit={view === 'login' ? handleLogin : handleSignup} noValidate>
          {/* Email */}
          <div className="mb-4">
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`} htmlFor="email">
              Email Address
            </label>
            <input
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched({ ...touched, email: true })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                validationErrors.email && touched.email 
                  ? 'border-red-500 focus:ring-red-200' 
                  : darkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-teal-500'
                  : 'border-gray-300 focus:ring-teal-200'
              }`}
              placeholder="doctor@hospital.com" 
              required
            />
            {validationErrors.email && touched.email && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>
          
          {/* Password */}
          <div className="mb-4">
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`} htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, password: true })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition pr-12 ${
                  validationErrors.password && touched.password 
                    ? 'border-red-500 focus:ring-red-200' 
                    : darkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-teal-500'
                    : 'border-gray-300 focus:ring-teal-200'
                }`}
                placeholder="••••••••" 
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {validationErrors.password && touched.password && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
            )}
          </div>

          {/* Confirm Password (Signup only) */}
          {view === 'signup' && (
            <>
              <div className="mb-4">
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 pr-12 ${
                      validationErrors.confirmPassword && touched.confirmPassword 
                        ? 'border-red-500 focus:ring-red-200' 
                        : darkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-teal-500'
                        : 'border-gray-300 focus:ring-teal-200'
                    }`}
                    placeholder="••••••••" 
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                     {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {validationErrors.confirmPassword && touched.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Phone Number (Optional)
                </label>
                <input
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onBlur={() => setTouched({ ...touched, phoneNumber: true })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    validationErrors.phoneNumber && touched.phoneNumber 
                      ? 'border-red-500 focus:ring-red-200' 
                      : darkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-teal-500'
                      : 'border-gray-300 focus:ring-teal-200'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {validationErrors.phoneNumber && touched.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.phoneNumber}</p>
                )}
              </div>
            </>
          )}

          {view === 'login' && (
            <div className="mb-6 text-right">
              <button 
                type="button" 
                onClick={() => setShowResetModal(true)} 
                className="text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline"
              >
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
            type="submit" 
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 transition duration-300 disabled:bg-gray-400 font-medium shadow-md"
          >
            {loading ? 'Processing...' : (view === 'login' ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Are you a patient?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline font-semibold"
            >
              Patient Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
