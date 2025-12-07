import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import axios from "axios";
import { AuthContext } from '../contexts/auth';
import firebaseConfig from '../assets/firebaseConfig.json';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function PatientLogin({ darkMode }) {
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
      'auth/wrong-password': 'Incorrect password.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-credential': 'Invalid email or password.'
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
      // 1. Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const firebaseToken = await user.getIdToken(true);
      
      // 2. Backend Login
      const response = await axios.post(`${BACKEND_URL}/login-patient`, { token: firebaseToken });
      
      // 3. Store in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", "patient");
      localStorage.setItem("userName", response.data.userName || user.email);
      
      // 4. Use AuthContext to update global state and navigate
      const from = location.state?.from?.pathname || '/patient-home';
      navigate(from);
      
      // Force reload auth context state
      window.location.reload();
      
    } catch (error) {
      console.error("Patient Login Error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          getFirebaseErrorMessage(error.code);
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
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const firebaseToken = await user.getIdToken(true);
      
      // 2. Create user in Backend
      await axios.post(`${BACKEND_URL}/signup-patient`, {
        email,
        password,
        phone_number: phoneNumber,
        firebase_uid: user.uid
      });
      
      // 3. Login to get backend token
      const response = await axios.post(`${BACKEND_URL}/login-patient`, { token: firebaseToken });
      
      // 4. Store in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", "patient");
      localStorage.setItem("userName", response.data.userName || user.email);
      
      // 5. Navigate to patient home
      navigate('/patient-home');
      window.location.reload();
      
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
    if (!email) {
      setError('Please enter your email address');
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
        darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}>
        <div className={`p-8 rounded-2xl shadow-xl w-full max-w-md ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Reset Password
          </h2>
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
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowResetModal(false)} 
                className="w-full mt-4 text-blue-600 text-sm hover:underline"
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
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className={`p-8 rounded-2xl shadow-xl w-full max-w-md ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        
        <div className="text-center mb-6">
          <h1 className="text-blue-600 font-bold text-xl uppercase tracking-wider">
            Patient Portal
          </h1>
        </div>

        <div className={`flex mb-8 rounded-lg p-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <button
            type="button"
            className={`flex-1 py-2.5 text-center font-semibold rounded-md transition-all ${
              view === 'login' 
                ? darkMode ? 'bg-gray-600 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm'
                : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => handleViewChange('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 text-center font-semibold rounded-md transition-all ${
              view === 'signup' 
                ? darkMode ? 'bg-gray-600 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm'
                : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => handleViewChange('signup')}
          >
            Sign Up
          </button>
        </div>

        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {view === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        <form onSubmit={view === 'login' ? handleLogin : handleSignup} noValidate>
          {/* Email */}
          <div className="mb-4">
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email Address
            </label>
            <input
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched({ ...touched, email: true })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                validationErrors.email && touched.email 
                  ? 'border-red-500 focus:ring-red-200' 
                  : darkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
              placeholder="you@example.com" 
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
            }`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, password: true })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 pr-12 ${
                  validationErrors.password && touched.password 
                    ? 'border-red-500 focus:ring-red-200' 
                    : darkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                    : 'border-gray-300 focus:ring-blue-200'
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

          {/* Confirm Password (Signup) */}
          {view === 'signup' && (
            <>
              <div className="mb-4">
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Confirm Password
                </label>
                <input
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    validationErrors.confirmPassword && touched.confirmPassword 
                      ? 'border-red-500 focus:ring-red-200' 
                      : darkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                      : 'border-gray-300 focus:ring-blue-200'
                  }`}
                  placeholder="••••••••" 
                  required
                />
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
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    darkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                    : 'border-gray-300 focus:ring-blue-200'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </>
          )}

          {view === 'login' && (
            <div className="mb-6 text-right">
              <button 
                type="button" 
                onClick={() => setShowResetModal(true)} 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
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
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (view === 'login' ? 'Patient Login' : 'Create Patient Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Are you a doctor?{' '}
            <button
              onClick={() => navigate('/doctor-login')}
              className="text-green-600 hover:underline font-semibold"
            >
              Doctor Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
