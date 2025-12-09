import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Star, Shield, Briefcase, Calendar } from 'lucide-react';

export default function DoctorProfile({ darkMode, setBookingData }) {
  const { name } = useParams(); 
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false); // New state for booking button
  
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const realName = decodeURIComponent(name); 
        const response = await axios.post('http://127.0.0.1:5000/get-doctor-profile', {
          doctor_name: realName 
        });
        setDoctor(response.data.doctor);
      } catch (err) {
        console.error("Error loading profile", err);
        setError("Could not load doctor profile.");
      } finally {
        setLoading(false);
      }
    };
    if (name) fetchDoctor();
  }, [name]);

  const generateSlots = (start, end) => {
    if (!start || !end) return [];
    return [start, `${start.split(':')[0]}:30`, end]; 
  };

  // --- UPDATED BOOKING LOGIC ---
  const handleBook = async () => {
    if (!selectedSlot) return alert("Please select a time slot");
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert("You must be logged in to book an appointment.");
        navigate('/login');
        return;
    }

    setBookingLoading(true);

    const bookingPayload = {
        token: token,
        doctorName: doctor?.full_name,
        timings: selectedSlot, // Matches backend 'timings' expectation? No, backend code above uses 'slot' logic mapping.
        // Let's match the backend variable names I wrote above:
        slot: selectedSlot, 
        date: new Date().toLocaleDateString('en-CA') // YYYY-MM-DD format is safer
    };

    try {
        const response = await axios.post('http://127.0.0.1:5000/booking', bookingPayload);
        
        if (response.status === 200) {
            // Update local state for confirmation page
            setBookingData(prev => ({
                ...prev,
                doctorName: doctor?.full_name,
                clinic: doctor?.clinic_details?.name,
                address: doctor?.clinic_details?.address,
                slot: selectedSlot,
                date: bookingPayload.date,
                fees: doctor?.consultation_fee
            }));
            
            navigate('/confirmation');
        }
    } catch (err) {
        console.error("Booking failed", err);
        alert("Booking failed. Please try again.");
    } finally {
        setBookingLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center p-10">Loading Profile...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center p-10 text-red-500">{error}</div>;
  if (!doctor) return <div className="min-h-screen flex items-center justify-center p-10">Doctor not found.</div>;

  const morningSlots = doctor.availability?.morning_shift 
    ? generateSlots(doctor.availability.morning_shift.start, doctor.availability.morning_shift.end) 
    : [];
  const eveningSlots = doctor.availability?.evening_shift 
    ? generateSlots(doctor.availability.evening_shift.start, doctor.availability.evening_shift.end) 
    : [];

  return (
    <div className={`min-h-screen font-inter pb-20 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      <div className="bg-blue-600 h-48 w-full relative"></div>
      
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        
        <div className={`rounded-2xl shadow-xl p-6 mb-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 rounded-2xl bg-gray-200 border-4 border-white shadow-md overflow-hidden flex-shrink-0 flex items-center justify-center text-4xl">
                {doctor.profile_image && doctor.profile_image !== 'default_avatar' && doctor.profile_image !== 'pending_upload' ? 
                    <img src={doctor.profile_image} className="w-full h-full object-cover" alt="Doc" /> : "👨‍⚕️"
                }
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                    {doctor.full_name || "Doctor Name"} 
                    {doctor.is_verified && <Shield className="w-5 h-5 text-blue-500 fill-blue-100" />}
                </h1>
                <p className="text-blue-600 font-medium text-lg mb-2">{doctor.specialization || "Specialist"}</p>
                <div className="flex flex-wrap gap-4 text-sm opacity-80 mb-4">
                    <span className="flex items-center gap-1"><Briefcase size={16}/> {doctor.personal_details?.experience_years || 0} Years Exp.</span>
                    <span className="flex items-center gap-1"><Star size={16} className="text-yellow-500 fill-yellow-500"/> 4.8 Rating</span>
                    <span className="flex items-center gap-1"><MapPin size={16}/> {doctor.city || "City"}</span>
                </div>
                <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 w-fit px-3 py-1 rounded-lg">
                    <span>Consultation Fee:</span>
                    <span>₹{doctor.consultation_fee || "0"}</span>
                </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <div className={`p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><MapPin className="text-blue-500"/> Clinic Details</h3>
                    <p className="font-semibold text-lg">{doctor.clinic_details?.name || "Clinic Name Unavailable"}</p>
                    <p className="opacity-70 mb-2">{doctor.clinic_details?.address || "Address Unavailable"}</p>
                    <p className="opacity-70 mb-4">{doctor.clinic_details?.zip_code}</p>
                </div>
                <div className={`p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className="text-xl font-bold mb-4">About Doctor</h3>
                    <p className="opacity-80 leading-relaxed">
                        {doctor.full_name} is a highly skilled {doctor.specialization} with over {doctor.personal_details?.experience_years || 0} years of experience.
                    </p>
                </div>
            </div>

            <div className="md:col-span-1">
                <div className={`p-6 rounded-2xl shadow-lg sticky top-24 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-blue-100'}`}>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar className="text-blue-500"/> Book Slot</h3>
                    
                    <div className="mb-4">
                        <p className="text-xs font-bold uppercase opacity-50 mb-2">Available Slots</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[...morningSlots, ...eveningSlots].map((slot, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`py-2 text-sm rounded-lg border transition ${selectedSlot === slot ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:border-blue-400'}`}
                                >
                                    {slot}
                                </button>
                            ))}
                            {morningSlots.length === 0 && eveningSlots.length === 0 && <p className="col-span-3 text-sm text-gray-400">No slots available today.</p>}
                        </div>
                    </div>

                    <button 
                        onClick={handleBook}
                        disabled={!selectedSlot || bookingLoading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {bookingLoading ? "Booking..." : "Confirm Booking"}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}