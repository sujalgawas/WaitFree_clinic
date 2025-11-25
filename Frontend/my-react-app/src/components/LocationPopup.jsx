import React from 'react';
import { MapPin, CheckCircle, XCircle } from 'lucide-react';

export default function LocationPopup({ darkMode, handleLocationAllow, setShowLocationPopup }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`max-w-md w-full rounded-2xl p-6 transform transition-all duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Enable Location</h3>
          <p className="opacity-70">Find doctors near you instantly with precise location access</p>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={handleLocationAllow} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-3 font-semibold">
            <CheckCircle size={20} /> Allow Location Access
          </button>
          <button onClick={() => setShowLocationPopup(false)} className="border border-gray-300 dark:border-gray-600 px-6 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-3">
            <XCircle size={20} /> Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}