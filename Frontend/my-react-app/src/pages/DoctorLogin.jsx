import React from 'react';

export default function DoctorLogin({ darkMode, setIsLoggedIn, setUserType, setCurrentPage }) {
  return (
    <div className={`min-h-screen flex items-center justify-center py-12 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
      <div className="max-w-md w-full mx-4">
        <div className={`rounded-3xl p-8 backdrop-blur-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-white'}`}>
          <h2 className="text-2xl font-bold mb-4">Doctor Portal</h2>
          <div className="space-y-4">
            <input placeholder="Email" className="w-full px-4 py-3 rounded-xl border" />
            <input placeholder="Password" type="password" className="w-full px-4 py-3 rounded-xl border" />
            <button onClick={() => { setIsLoggedIn(true); setUserType('doctor'); setCurrentPage('dashboard'); }} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl">Sign in</button>
            <p className="text-center opacity-70">Not registered? <button onClick={() => setCurrentPage('register')} className="text-blue-600">Register</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}