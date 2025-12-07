import React, { useState } from 'react';
import { Calendar, CheckCircle, FileText, Users, TrendingUp } from 'lucide-react';

export default function Dashboard({ darkMode, isLoggedIn, appointments, setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { icon: Calendar, value: appointments.filter(a => a.status === 'confirmed').length, label: 'Upcoming', color: 'blue' },
    { icon: CheckCircle, value: appointments.filter(a => a.status === 'completed').length, label: 'Completed', color: 'green' },
    { icon: FileText, value: '0', label: 'Prescriptions', color: 'purple' },
    { icon: Users, value: '5', label: 'Doctors', color: 'orange' }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-24">
        <div className={`rounded-3xl p-8 mb-8 ${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-600 to-purple-700 text-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome back{isLoggedIn ? ', User' : ''}! 👋</h2>
              <p className="opacity-90">Here's your health overview for today</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{appointments.length}</p>
              <p className="opacity-90">Total Appointments</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={`p-6 rounded-2xl backdrop-blur-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500 flex items-center justify-center mb-4 text-white`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <p className="opacity-70">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className={`rounded-2xl backdrop-blur-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="border-b dark:border-gray-700 flex overflow-x-auto">
            {['overview', 'appointments', 'prescriptions', 'medical-records'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-4 font-semibold capitalize whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Recent Appointments</h3>
                  {appointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="opacity-70">No appointments yet</p>
                      <button onClick={() => setCurrentPage('home')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Book Your First Appointment</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {appointments.slice(0, 3).map(apt => (
                        <div key={apt.id} className={`p-4 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                          <div>
                            <h4 className="font-bold">{apt.doctorName}</h4>
                            <p className="text-sm opacity-70">{apt.date} • {apt.slot}</p>
                            <span className={`px-2 py-1 rounded-full text-xs ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>{apt.status}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{apt.type === 'video' ? 'Video Call' : 'In-Person'}</p>
                            {apt.type === 'video' && <button className="text-blue-600 text-sm hover:underline mt-1">Join Call</button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Health Summary</h3>
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-bold text-lg mb-2">Good Health Maintained</h4>
                      <p className="text-sm opacity-70 mb-4">Keep up with your regular checkups</p>
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">View Health Report</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div>
                <h3 className="text-xl font-bold mb-4">All Appointments</h3>
                {appointments.length === 0 ? <p className="opacity-70">No appointments</p> : (
                  <div className="space-y-4">
                    {appointments.map(a => (
                      <div key={a.id} className="p-4 rounded-xl border">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-bold">{a.doctorName}</h4>
                            <p className="text-sm opacity-70">{a.date} • {a.slot}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold">{a.type === 'video' ? 'Video' : 'In-person'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}