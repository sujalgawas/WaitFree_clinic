import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, UserPlus, LogIn } from 'lucide-react';

const AuthRequired = ({ darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className={`max-w-md w-full p-8 rounded-2xl shadow-2xl ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            darkMode ? 'bg-blue-900' : 'bg-blue-100'
          }`}>
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className={`text-3xl font-bold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Authentication Required
          </h2>
          
          <p className={`mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Please log in or create an account to access this page
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/login', { state: { from } })}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Login as Patient
            </button>

            <button
              onClick={() => navigate('/doctor-login', { state: { from } })}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Login as Doctor
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                  Don't have an account?
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/register', { state: { from } })}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}>
              <UserPlus className="w-5 h-5" />
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRequired;
