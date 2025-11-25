import React from 'react';

export default function AdminDashboard({ darkMode, appointments }) {
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border bg-white/50">
            <h3 className="font-semibold mb-2">Recent Appointments</h3>
            <div className="space-y-3">
              {appointments.length === 0 ? <p className="opacity-70">No appointments</p> : appointments.slice(0, 5).map(a => (
                <div key={a.id} className="p-3 rounded-lg border">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-bold">{a.doctorName}</div>
                      <div className="text-sm opacity-70">{a.date} • {a.slot}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{a.name}</div>
                      <div className="text-xs opacity-70">{a.mobile}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 rounded-2xl border bg-white/50">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <button className="px-4 py-2 rounded-lg border">Manage Doctors</button>
              <button className="px-4 py-2 rounded-lg border">View Reports</button>
              <button className="px-4 py-2 rounded-lg border">Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}