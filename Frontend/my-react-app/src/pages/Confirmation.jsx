import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function Confirmation({ darkMode, appointments, setCurrentPage }) {
  const last = appointments[0];
  return (
    <div className={`min-h-screen mt-20 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto p-6 rounded-2xl border bg-white/50 text-center">
          <CheckCircle className="mx-auto mb-4 text-green-600" size={48} />
          <h2 className="text-2xl font-bold mb-2">Appointment Confirmed</h2>
          {last ? (
            <>
              <p className="opacity-80 mb-4">You're booked with <strong>{last.doctorName}</strong> on <strong>{last.date}</strong> at <strong>{last.slot}</strong>.</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setCurrentPage('dashboard')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Go to Dashboard</button>
                <button onClick={() => setCurrentPage('home')} className="px-4 py-2 border rounded-lg">Back to Home</button>
              </div>
            </>
          ) : (
            <p className="opacity-70">No appointment data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}