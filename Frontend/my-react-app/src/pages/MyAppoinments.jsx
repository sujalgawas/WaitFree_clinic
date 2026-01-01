import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  ChevronLeft, 
  AlertCircle,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BookingTracker from './BookingTracker';

export default function MyAppointments({ darkMode }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.post('http://127.0.0.1:5000/get-user-appointments', {
          token: token
        });
        setAppointments(response.data.appointments || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments. Please ensure your database index is created.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  // If an appointment is selected, show the BookingTracker
  if (selectedAppointment) {
    return (
      <BookingTracker 
        appointment={selectedAppointment}
        darkMode={darkMode}
        onBack={() => setSelectedAppointment(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 font-inter ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-6 opacity-70 hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={20} /> Back to Home
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Booking History</h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'} found
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {appointments.length === 0 ? (
          <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <Calendar size={60} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl font-medium opacity-50">No appointments found.</p>
            <button 
              onClick={() => navigate('/search')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Book your first appointment
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments.map((appt) => (
              <div 
                key={appt.id} 
                onClick={() => setSelectedAppointment(appt)}
                className={`p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-lg cursor-pointer hover:scale-[1.02] ${
                  darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-100 hover:border-blue-200'
                }`}
              >
                <div className="flex gap-5 items-start flex-1">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <Calendar size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-1">{appt.doctor_name || "Doctor"}</h3>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {appt.clinic_name || "Clinic"}
                    </p>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-sm opacity-80">
                        <Clock size={16} className="text-blue-500" /> 
                        <span className="font-medium">{appt.date}</span> at <span className="font-medium">{appt.slot}</span>
                      </p>
                      <p className="flex items-center gap-2 text-sm opacity-80">
                        <MapPin size={16} className="text-red-500" /> 
                        {appt.clinic_address || "Clinic Address Unavailable"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                    appt.status === 'confirmed' 
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                      : appt.status === 'pending'
                      ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                      : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                  }`}>
                    <CheckCircle size={18} />
                    {(appt.status || "confirmed").toUpperCase()}
                  </div>

                  <button 
                    className={`p-3 rounded-full transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAppointment(appt);
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Helper text */}
        {appointments.length > 0 && (
          <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-start gap-3">
              <Eye size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                <strong>Tip:</strong> Click on any appointment to view detailed information, including directions to the clinic on a map.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
