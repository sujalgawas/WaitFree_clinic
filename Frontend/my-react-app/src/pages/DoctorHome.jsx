import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, TrendingUp, Video, MessageSquare, FileText, Settings } from 'lucide-react';
import axios from 'axios';

const DoctorHome = ({ darkMode }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Doctor';
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingConsults: 0,
    revenue: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/doctor/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
      setUpcomingAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    }
  };

  const quickActions = [
    { icon: Calendar, label: 'View Schedule', color: 'blue', action: () => navigate('/doctor/schedule') },
    { icon: Users, label: 'Patient List', color: 'green', action: () => navigate('/doctor/patients') },
    { icon: Video, label: 'Start Consultation', color: 'purple', action: () => navigate('/doctor/consult') },
    { icon: FileText, label: 'Prescriptions', color: 'orange', action: () => navigate('/doctor/prescriptions') }
  ];

  const statCards = [
    { icon: Calendar, label: "Today's Appointments", value: stats.todayAppointments, color: 'blue' },
    { icon: Users, label: 'Total Patients', value: stats.totalPatients, color: 'green' },
    { icon: Clock, label: 'Pending Consults', value: stats.pendingConsults, color: 'yellow' },
    { icon: TrendingUp, label: 'Monthly Revenue', value: `₹${stats.revenue}`, color: 'purple' }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-20 pb-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className={`rounded-xl p-6 mb-8 ${
          darkMode ? 'bg-gradient-to-r from-blue-900 to-indigo-900' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        }`}>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, Dr. {userName}
          </h1>
          <p className="text-blue-100">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className={`rounded-xl p-6 shadow-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    {stat.label}
                  </p>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`p-6 rounded-xl shadow-lg transition-all hover:scale-105 ${
                  darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-xl'
                }`}
              >
                <action.icon className={`w-8 h-8 text-${action.color}-600 mx-auto mb-3`} />
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {action.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Today's Appointments
          </h2>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  darkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-200 hover:bg-gray-50'
                } transition-colors cursor-pointer`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        darkMode ? 'bg-blue-900' : 'bg-blue-100'
                      }`}>
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {appointment.patientName}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {appointment.problem}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {appointment.time}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                        appointment.type === 'video' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {appointment.type === 'video' ? 'Video' : 'In-person'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              No appointments scheduled for today
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorHome;
