import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import axios from "axios";

// --- Firebase Configuration (kept as-is) ---
const firebaseConfig = {
  apiKey: "AIzaSyAPSJEKhIKrM43ZrCL9UYd4QzRs5EQEXEc",
  authDomain: "waitfreeclinic.firebaseapp.com",
  projectId: "waitfreeclinic",
  storageBucket: "waitfreeclinic.firebasestorage.app",
  messagingSenderId: "1072458368316",
  appId: "1:1072458368316:web:12baddf57862dfba9e0a39",
  measurementId: "G-C2ZVQXR25Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- Main Component ---
export default function Login() {
  const [view, setView] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  
  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // UI state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const BACKEND_URL = 'http://localhost:5000';

  // Real-time validation
  useEffect(() => {
    const errors = {};
    
    if (touched.email && email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    if (touched.password && password) {
      if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }
    
    if (view === 'signup' && touched.confirmPassword && confirmPassword) {
      if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    // Only validate phone number if it's not empty
    if (view === 'signup' && touched.phoneNumber && phoneNumber.length > 0) {
      const phoneRegex = /^\+?[\d\s\-()]+$/;
      if (!phoneRegex.test(phoneNumber)) {
        errors.phoneNumber = 'Please enter a valid phone number';
      }
    }
    
    setValidationErrors(errors);
  }, [email, password, confirmPassword, phoneNumber, touched, view]);

  // Better error messages
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

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Mark fields as touched
    setTouched({ email: true, password: true });
    
    // **NEW**: Check for empty fields on submit
    const localErrors = {};
    if (!email) localErrors.email = 'Email is required';
    if (!password) localErrors.password = 'Password is required';
    
    if (Object.keys(localErrors).length > 0) {
       setValidationErrors(prev => ({ ...prev, ...localErrors }));
       return;
    }

    // Check validation
    if (validationErrors.email || validationErrors.password) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken(true);
      
      const response = await axios.post(`${BACKEND_URL}/login`, { token });
      setUserData(response.data.user_data);
      
    } catch (error) {
      console.error("Login Error:", error);
      const errorMessage = error.response?.data?.error || getFirebaseErrorMessage(error.code);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ 
      email: true, 
      password: true, 
      confirmPassword: true, 
      phoneNumber: true 
    });
    
    // **NEW**: Check for empty fields on submit
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

    // Check validation
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await axios.post(`${BACKEND_URL}/signup`, {
        email,
        password,
        phone_number: phoneNumber
      });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken(true);
      
      const response = await axios.post(`${BACKEND_URL}/login`, { token });
      setUserData(response.data.user_data);
      
    } catch (error) {
      console.error("Signup Error:", error);
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
      console.error("Reset Password Error:", error);
      setError(getFirebaseErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      setUserData(null);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhoneNumber('');
      setError(null);
      setTouched({});
      setValidationErrors({});
      setView('login');
    }).catch((error) => {
      console.error("Logout Error:", error);
      setError(getFirebaseErrorMessage(error.code));
    });
  };

  const handleViewChange = (newView) => {
    setView(newView);
    setError(null);
    setTouched({});
    setValidationErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Logged in view
  if (userData) {
    return (
      <div className="min-h-screen font-inter bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-full max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome Back!</h2>
            <p className="text-gray-600">You're successfully logged in</p>
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
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition duration-300 font-medium shadow-md hover:shadow-lg"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Reset password modal
  if (showResetModal) {
    return (
      <div className="min-h-screen font-inter bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
          <p className="text-gray-600 text-sm mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          {resetEmailSent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-green-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm font-medium">Password reset email sent! Check your inbox.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="reset-email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="reset-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  className={`w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 transition ${
                    validationErrors.email && touched.email
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200'
                  }`}
                  placeholder="you@example.com"
                  required
                />
                {validationErrors.email && touched.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-800 text-sm flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          <button
            onClick={() => {
              setShowResetModal(false);
              setError(null);
              setTouched({});
              setValidationErrors({});
            }}
            className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Login/Signup form
  return (
    <div className="min-h-screen font-inter bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        
        {/* Tabs */}
        <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            className={`flex-1 py-2.5 text-center font-semibold rounded-md transition-all ${
              view === 'login'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => handleViewChange('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 text-center font-semibold rounded-md transition-all ${
              view === 'signup'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
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
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched({ ...touched, email: true })}
              className={`w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 transition ${
                validationErrors.email && touched.email
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
              placeholder="you@example.com"
              required
            />
            {validationErrors.email && touched.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.email}
              </p>
            )}
          </div>
          
          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, password: true })}
                className={`w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 transition pr-12 ${
                  validationErrors.password && touched.password
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-blue-200'
                }`}
                placeholder="••••••••"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {validationErrors.password && touched.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password (Signup only) */}
          {view === 'signup' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                  className={`w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 transition pr-12 ${
                    validationErrors.confirmPassword && touched.confirmPassword
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200'
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && touched.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* Phone Number (Signup only) */}
          {view === 'signup' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="phoneNumber">
                Phone Number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onBlur={() => setTouched({ ...touched, phoneNumber: true })}
                className={`w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 transition ${
                  validationErrors.phoneNumber && touched.phoneNumber
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-blue-200'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {validationErrors.phoneNumber && touched.phoneNumber && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.phoneNumber}
                </p>
              )}
            </div>
          )}

          {/* Forgot Password Link */}
          {view === 'login' && (
            <div className="mb-6 text-right">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(true);
                  setError(null);
                  setTouched({ email: touched.email }); // Keep email touched state
                  setValidationErrors({ email: validationErrors.email }); // Keep email error
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {view === 'login' ? 'Logging in...' : 'Creating account...'}
              </span>
            ) : (
              view === 'login' ? 'Login' : 'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}