import React, { useState } from 'react';
import DoctorLogin from './DoctorLogin';
import PatientLogin from './PatientLogin';

export default function MainLogin({ darkMode }) {
  const [selectedRole, setSelectedRole] = useState(null); // null, 'doctor', or 'patient'

  // Function to handle returning to the selection screen
  const handleBackToSelection = () => {
    setSelectedRole(null);
  };

  // --- RENDER DOCTOR LOGIN ---
  if (selectedRole === 'doctor') {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Back Button Overlay */}
        <button 
          onClick={handleBackToSelection}
      className={`fixed top-24 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg font-semibold transition-all hover:shadow-xl ${
    darkMode 
      ? 'bg-gray-800 text-gray-300 hover:text-blue-400 border border-gray-700' 
      : 'bg-white text-gray-600 hover:text-blue-600 border border-gray-200'
  }`}
>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Roles
        </button>
        {/* Render the actual Doctor Login Component */}
        <DoctorLogin darkMode={darkMode} />
      </div>
    );
  }

  // --- RENDER PATIENT LOGIN ---
  if (selectedRole === 'patient') {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Back Button Overlay */}
      <button 
  onClick={handleBackToSelection}
  className={`fixed top-24 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg font-semibold transition-all hover:shadow-xl ${
    darkMode 
      ? 'bg-gray-800 text-gray-300 hover:text-blue-400 border border-gray-700' 
      : 'bg-white text-gray-600 hover:text-blue-600 border border-gray-200'
  }`}
>

          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Roles
        </button>
        {/* Render the actual Patient Login Component */}
        <PatientLogin darkMode={darkMode} />
      </div>
    );
  }

  // --- RENDER SELECTION SCREEN (Default) ---
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'
    }`}>
  
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Hero Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
              Welcome to WaitFree Clinic
            </h1>
            <p className="text-xl opacity-80 mb-8 leading-relaxed">
              Revolutionizing healthcare with AI-powered tools for doctors and seamless access for patients. Select your role to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => setSelectedRole('doctor')}
                className="px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                I'm a Doctor
              </button>
              <button
                onClick={() => setSelectedRole('patient')}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                I'm a Patient
              </button>
            </div>
          </div>

          {/* Right Side: Role Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {/* Doctor Card */}
            <div 
              onClick={() => setSelectedRole('doctor')}
              className={`cursor-pointer p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-teal-500 ${
                darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                  darkMode ? 'bg-teal-900/50' : 'bg-teal-100'
                }`}>
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
    d="M9 3v2a3 3 0 006 0V3M6 5v3a6 6 0 0012 0V5M12 14v7M9 21h6M16 16a3 3 0 100-6 3 3 0 000 6z"/>
</svg>

                </div>
                <div>
                  <h3 className="text-lg font-bold">Doctor Portal</h3>
                  <p className="text-sm opacity-70">Manage patients, AI insights, and more.</p>
                </div>
              </div>
            </div>

            {/* Patient Card */}
            <div 
              onClick={() => setSelectedRole('patient')}
              className={`cursor-pointer p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-500 ${
                darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                  darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                }`}>
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Patient Portal</h3>
                  <p className="text-sm opacity-70">Book appointments, track health.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`px-6 py-4 text-center ${
        darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white/80 backdrop-blur-md border-t border-gray-200'
      }`}>
        <p className="opacity-70">© 2025 WaitFree Clinic. All rights reserved.</p>
      </footer>
    </div>
  );
}