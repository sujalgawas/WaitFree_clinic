import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, User, Phone, CheckCircle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DoctorSchedule({ darkMode }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedule = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const date = new Date().toLocaleDateString('en-CA');
        const response = await axios.post('http://127.0.0.1:5000/scheduler/optimized-queue', { 
            token, 
            date 
        });
        setSchedule(response.data.schedule || []);
      } catch (err) {
        console.error("Error fetching schedule:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [navigate]);

  if (loading) return <div className="p-10 text-center">Loading Schedule...</div>;

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <div className="text-sm opacity-70 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold">
            {schedule.length} Appointments Total
          </div>
        </div>

        {schedule.length === 0 ? (
          <div className="text-center py-20 opacity-50 border-2 border-dashed rounded-3xl">
            <Calendar size={48} className="mx-auto mb-4" />
            <p>No appointments booked yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {schedule.map((appt) => (
              <div 
                key={appt.id} 
                className={`p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xl ring-4 ring-purple-50">
                    {appt.queue_position ? `#${appt.queue_position}` : <User />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{appt.patient_name || `Patient ID: ${appt.patient_uid.slice(0,8)}...`}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm opacity-70">
                      <span className="flex items-center gap-1 font-semibold text-blue-600">
                        <Clock size={14}/> {appt.appointment_time_str ? appt.appointment_time_str.split(' ')[1] : appt.slot}
                      </span>
                      <span className="flex items-center gap-1"><Calendar size={14}/> {appt.appointment_time_str ? appt.appointment_time_str.split(' ')[0] : appt.date}</span>
                      {appt.urgency_label && (
                         <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide ${
                            appt.urgency_label === 'critical' ? 'bg-red-100 text-red-700' :
                            appt.urgency_label === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                         }`}>{appt.urgency_label}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-xs uppercase opacity-50 font-bold">Duration</p>
                    <p className="font-bold">{appt.consultation_time_min || 15} min</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
                    View Records
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}