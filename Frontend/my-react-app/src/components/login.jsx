import React, { useState } from 'react';
import DoctorLogin from './DoctorLogin';
import PatientLogin from './PatientLogin';

export default function MainLogin() {
  const [selectedRole, setSelectedRole] = useState(null); // null, 'doctor', or 'patient'

  // Function to handle returning to the selection screen
  const handleBackToSelection = () => {
    setSelectedRole(null);
  };

  // --- RENDER DOCTOR LOGIN ---
  if (selectedRole === 'doctor') {
    return (
      <div className="relative">
        {/* Back Button Overlay */}
        <button 
          onClick={handleBackToSelection}
          className="fixed top-24 left-4 z-50 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md text-gray-600 hover:text-teal-600 font-semibold transition-all hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Switch Role
        </button>
        {/* Render the actual Doctor Login Component */}
        <DoctorLogin />
      </div>
    );
  }

  // --- RENDER PATIENT LOGIN ---
  if (selectedRole === 'patient') {
    return (
      <div className="relative">
        {/* Back Button Overlay */}
        <button 
          onClick={handleBackToSelection}
          className="fixed top-24 left-4 z-50 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md text-gray-600 hover:text-blue-600 font-semibold transition-all hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Switch Role
        </button>
        {/* Render the actual Patient Login Component */}
        <PatientLogin />
      </div>
    );
  }

  // --- RENDER SELECTION SCREEN (Default) ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-inter">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to HealthPortal</h1>
        <p className="text-lg text-gray-600">Please select your role to continue</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        
        {/* Doctor Selection Card */}
        <div 
          onClick={() => setSelectedRole('doctor')}
          className="group cursor-pointer bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-teal-500 flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-teal-600">I am a Doctor</h2>
          <p className="text-gray-500 text-center">Login to manage appointments and view patient records.</p>
          <button className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            Doctor Login &rarr;
          </button>
        </div>

        {/* Patient Selection Card */}
        <div 
          onClick={() => setSelectedRole('patient')}
          className="group cursor-pointer bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-500 flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600">I am a Patient</h2>
          <p className="text-gray-500 text-center">Login to book appointments and view your medical history.</p>
          <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            Patient Login &rarr;
          </button>
        </div>

      </div>
    </div>
  );
}