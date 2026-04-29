// DoctorProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
<<<<<<< HEAD
import { MapPin, Star, Shield, Briefcase, Calendar, Navigation } from 'lucide-react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import API_KEYS from '../assets/API_keys.json';

const libraries = ['places'];

const isValidMapLink = (url) => {
  if (!url) return false;
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    const host = u.hostname.toLowerCase();
    return host.includes('google') || host.includes('goo.gl');
  } catch (e) {
    return false;
  }
};
=======
import { 
  MapPin, Star, Calendar, Activity, CheckCircle, Clock, Heart, 
  Award, User, Sun, Moon, Lock, Navigation, Shield, Briefcase 
} from 'lucide-react';
>>>>>>> friend/main

export default function DoctorProfile({ darkMode, setBookingData }) {
  const { name } = useParams();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
<<<<<<< HEAD
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false); // New state for booking button

  // Google Maps setup
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEYS.GOOGLE_API_KEY,
    libraries: libraries,
  });

  const mapContainerStyle = {
    width: '100%',
    height: '220px',
    borderRadius: '12px',
    marginTop: '16px'
  };
=======
>>>>>>> friend/main
  
  // Booking State
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    phone: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    visitType: 'New Patient',
    symptoms: '',
    history: ''
  });

  // Generate next 7 days
  const getDays = () => {
    const daysList = [];
    const today = new Date();
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      daysList.push({
        label: names[d.getDay()],
        num: d.getDate(),
        full: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        date: d,
        isToday: i === 0
      });
    }
    return daysList;
  };

  const days = getDays();
  const morningSlotsList = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
  const eveningSlotsList = ['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'];
  
  const [bookedSlots, setBookedSlots] = useState({
    '09:30': true,
    '10:30': true,
    '06:00 PM': true
  });

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

  // Handle patient info changes
  const handlePatientInfoChange = (e) => {
    const { id, value } = e.target;
    const fieldMap = {
      pName: 'name',
      pPhone: 'phone',
      pDob: 'dob',
      pGender: 'gender',
      pBloodGroup: 'bloodGroup',
      pVisitType: 'visitType',
      pSymptoms: 'symptoms',
      pHistory: 'history'
    };
    const fieldName = fieldMap[id];
    if (fieldName) {
      setPatientInfo(prev => ({ ...prev, [fieldName]: value }));
    }
  };

  // Handle slot selection
  const handleSlotSelect = (slot) => {
    if (!bookedSlots[slot]) {
      setSelectedSlot(slot);
    }
  };

  // Show toast message
  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Handle booking
  const handleBook = async () => {
    if (!patientInfo.name || !patientInfo.phone) {
      showToastMessage('Please fill in your name and phone number first');
      const formCard = document.getElementById('patientFormCard');
      if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!selectedSlot) {
      showToastMessage('Please select a time slot');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showToastMessage('You must be logged in to book an appointment');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    setIsBooking(true);

    const bookingPayload = {
<<<<<<< HEAD
        token: token,
        doctorName: doctor?.full_name,
        doctor_uid: doctor?.uid, // Fallback gracefully if name doesn't match
        slot: selectedSlot, 
        date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
        is_new_patient: true, // we can default this for now
        is_emergency: false
    };

    try {
        const response = await axios.post('http://127.0.0.1:5000/scheduler/add-to-queue', bookingPayload);
        
        if (response.status === 200) {
            // Update local state for confirmation page (use the optimized AI slot if available)
            const scheduledSlot = response.data.your_slot;
            setBookingData(prev => ({
                ...prev,
                doctorName: doctor?.full_name,
                clinic: doctor?.clinic_details?.name,
                address: doctor?.clinic_details?.address,
                slot: scheduledSlot ? scheduledSlot.appointment_time_str.split(' ')[1] : selectedSlot,
                date: bookingPayload.date,
                fees: doctor?.consultation_fee,
                predictedDeparture: scheduledSlot?.departure_time_str,
                queuePosition: scheduledSlot?.queue_position
            }));
            
            navigate('/confirmation');
=======
      token: token,
      doctorName: doctor?.full_name,
      slot: selectedSlot,
      date: days[selectedDay].full,
      patientName: patientInfo.name,
      patientPhone: patientInfo.phone,
      patientDob: patientInfo.dob,
      patientGender: patientInfo.gender,
      patientBloodGroup: patientInfo.bloodGroup,
      visitType: patientInfo.visitType,
      symptoms: patientInfo.symptoms,
      history: patientInfo.history
    };

    try {
      const response = await axios.post('http://127.0.0.1:5000/booking', bookingPayload);
      
      if (response.status === 200) {
        setBookedSlots(prev => ({ ...prev, [selectedSlot]: true }));
        
        if (setBookingData) {
          setBookingData({
            doctorName: doctor?.full_name,
            clinic: doctor?.clinic_details?.name,
            address: doctor?.clinic_details?.address,
            slot: selectedSlot,
            date: days[selectedDay].full,
            fees: doctor?.consultation_fee,
            patientName: patientInfo.name,
            patientPhone: patientInfo.phone
          });
>>>>>>> friend/main
        }
        
        showToastMessage(`✓ Appointment confirmed for ${days[selectedDay].full} at ${selectedSlot}`);
        setSelectedSlot(null);
        
        setTimeout(() => {
          navigate('/confirmation');
        }, 1500);
      }
    } catch (err) {
      console.error("Booking failed", err);
      showToastMessage("Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center p-10 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      Loading Profile...
    </div>
  );
  
  if (error) return (
    <div className={`min-h-screen flex items-center justify-center p-10 text-red-500 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {error}
    </div>
  );
  
  if (!doctor) return (
    <div className={`min-h-screen flex items-center justify-center p-10 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      Doctor not found.
    </div>
  );

  
  return (
    <div className={`min-h-screen font-sans pb-20 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Hero Section */}
      <div className={`relative bg-gradient-to-r from-blue-600 to-teal-600 h-44 overflow-hidden`}>
        <div className="relative max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
          
           
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Doctor Card */}
        <div className={`rounded-xl shadow-lg -mt-16 relative z-10 p-6 mb-5 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="w-20 h-20 rounded-xl bg-blue-50 flex items-center justify-center text-3xl shrink-0 shadow-md border-3 border-white">
              {doctor.profile_image && doctor.profile_image !== 'default_avatar' && doctor.profile_image !== 'pending_upload' ? 
                <img src={doctor.profile_image} className="w-full h-full object-cover rounded-xl" alt="Doc" /> : "👨‍⚕️"
              }
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold font-display">{doctor.full_name || "Doctor Name"}</h1>
                {doctor.is_verified && (
                  <span className="w-5 h-5 bg-blue-600 rounded-full inline-flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-pulse"></span>
                  Available Today
                </span>
              </div>
              <div className="text-blue-600 text-sm font-medium mb-2">{doctor.specialization || "Specialist"}</div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                  <Briefcase className="w-3 h-3" /> {doctor.personal_details?.experience_years || 0} Years Exp.
                </span>
                <span className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> 4.9 Rating • 1,200+ Reviews
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3" /> {doctor.city || "City"}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 font-semibold text-sm px-4 py-1.5 rounded-lg border border-green-200">
                <Heart className="w-4 h-4" /> Consultation: ₹{doctor.consultation_fee || "0"}
              </div>
            </div>
          </div>
        </div>

<<<<<<< HEAD
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <div className={`p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><MapPin className="text-blue-500"/> Clinic Details</h3>
                    <p className="font-semibold text-lg">{doctor.clinic_details?.name || "Clinic Name Unavailable"}</p>
                    <p className="opacity-70 mb-2">{doctor.clinic_details?.address || "Address Unavailable"}</p>
                    <p className="opacity-70 mb-4">{doctor.clinic_details?.zip_code}</p>
                    
                    {/* Render Map if Clinic Location is available */}
                    {doctor.clinic_details?.location?.lat && doctor.clinic_details?.location?.lng ? (
                      <div className="mt-4 border border-black/10 rounded-xl overflow-hidden shadow-sm relative">
                         {isLoaded ? (
                            <GoogleMap
                               mapContainerStyle={mapContainerStyle}
                               center={{ 
                                   lat: parseFloat(doctor.clinic_details.location.lat), 
                                   lng: parseFloat(doctor.clinic_details.location.lng) 
                               }}
                               zoom={15}
                               options={{
                                  styles: darkMode ? [
                                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }
                                  ] : [],
                                  disableDefaultUI: true,
                                  zoomControl: true
                               }}
                            >
                               <Marker 
                                  position={{ 
                                      lat: parseFloat(doctor.clinic_details.location.lat), 
                                      lng: parseFloat(doctor.clinic_details.location.lng) 
                                  }} 
                                  icon={{ url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" }}
                               />
                            </GoogleMap>
                         ) : (
                           <div className="h-[220px] bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-xl mt-4">
                             <span className="opacity-50">Loading Map...</span>
                           </div>
                         )}
                         {isValidMapLink(doctor.clinic_details?.google_maps_link) && (
                           <a 
                             href={doctor.clinic_details.google_maps_link.startsWith('http') ? doctor.clinic_details.google_maps_link : `https://${doctor.clinic_details.google_maps_link}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:scale-105 transition flex items-center gap-1 text-blue-600 dark:text-blue-400"
                           >
                             <Navigation size={12} /> View in Maps
                           </a>
                         )}
                      </div>
                    ) : isValidMapLink(doctor.clinic_details?.google_maps_link) && (
                       <a 
                         href={doctor.clinic_details.google_maps_link.startsWith('http') ? doctor.clinic_details.google_maps_link : `https://${doctor.clinic_details.google_maps_link}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition font-medium text-sm"
                       >
                         <MapPin size={16} />
                         Open in Google Maps
                       </a>
                    )}
                </div>
                <div className={`p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className="text-xl font-bold mb-4">About Doctor</h3>
                    <p className="opacity-80 leading-relaxed">
                        {doctor.full_name} is a highly skilled {doctor.specialization} with over {doctor.personal_details?.experience_years || 0} years of experience.
                    </p>
=======
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Clinic Details */}
            <div className={`p-5 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold">Clinic Details</h3>
              </div>
              <div className="font-semibold text-sm mb-0.5">{doctor.clinic_details?.name || "Clinic Name Unavailable"}</div>
              <div className="text-xs text-gray-400 mb-0.5">{doctor.clinic_details?.address || "Address Unavailable"}</div>
              <div className="text-xs text-gray-400 mb-3">{doctor.clinic_details?.zip_code}</div>
              <div className={`bg-gray-100 rounded-lg h-24 relative flex items-center justify-center overflow-hidden border border-gray-200 ${darkMode ? 'bg-gray-700' : ''}`}>
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_20px,rgba(148,163,184,0.1)_20px,rgba(148,163,184,0.1)_21px),repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(148,163,184,0.1)_20px,rgba(148,163,184,0.1)_21px)]"></div>
                <div className="flex flex-col items-center z-10">
                  <Navigation className="w-6 h-6 text-blue-600" />
                  <span className="text-xs font-medium text-gray-600 bg-white px-2 py-0.5 rounded shadow-sm">Clinic Location</span>
>>>>>>> friend/main
                </div>
              </div>
            </div>

            {/* About Doctor */}
            <div className={`p-5 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold">About Doctor</h3>
              </div>
              <p className="text-sm leading-relaxed opacity-80">
                {doctor.full_name} is a highly skilled {doctor.specialization} with over {doctor.personal_details?.experience_years || 0} years of experience.
              </p>
            </div>

            {/* Patient Form */}
            <div className={`p-5 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`} id="patientFormCard">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold">Patient Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Full Name</label>
                  <input type="text" id="pName" value={patientInfo.name} onChange={handlePatientInfoChange} 
                    placeholder="e.g. Rahul Sharma" 
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone Number</label>
                  <input type="tel" id="pPhone" value={patientInfo.phone} onChange={handlePatientInfoChange} 
                    placeholder="+91 98765 43210" 
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Date of Birth</label>
                  <input type="date" id="pDob" value={patientInfo.dob} onChange={handlePatientInfoChange} 
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Gender</label>
                  <select id="pGender" value={patientInfo.gender} onChange={handlePatientInfoChange} 
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Blood Group</label>
                  <select id="pBloodGroup" value={patientInfo.bloodGroup} onChange={handlePatientInfoChange} 
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                    <option value="">Select</option>
                    <option>A+</option><option>A−</option><option>B+</option><option>B−</option>
                    <option>O+</option><option>O−</option><option>AB+</option><option>AB−</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Visit Type</label>
                  <select id="pVisitType" value={patientInfo.visitType} onChange={handlePatientInfoChange} 
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                    <option>New Patient</option>
                    <option>Follow-up</option>
                    <option>Emergency</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Chief Complaint / Symptoms</label>
                  <textarea id="pSymptoms" value={patientInfo.symptoms} onChange={handlePatientInfoChange} 
                    rows="2" placeholder="Describe your symptoms or reason for visit..." 
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Known Allergies or Existing Conditions (optional)</label>
                  <input type="text" id="pHistory" value={patientInfo.history} onChange={handlePatientInfoChange} 
                    placeholder="e.g. Diabetes, Hypertension, Penicillin allergy" 
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <div className={`p-5 rounded-xl shadow-lg sticky top-5 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-blue-100'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold">Select Appointment</h3>
              </div>

              {/* Days */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 no-scrollbar">
                {days.map((day, idx) => (
                  <button key={idx} onClick={() => { setSelectedDay(idx); setSelectedSlot(null); }} 
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg border transition-all text-center ${selectedDay === idx ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} ${darkMode && selectedDay !== idx ? 'bg-gray-700 border-gray-600' : ''}`}>
                    <div className={`text-[10px] font-medium uppercase tracking-wide ${selectedDay === idx ? 'text-blue-600' : 'text-gray-400'}`}>{day.label}</div>
                    <div className={`text-base font-bold ${selectedDay === idx ? 'text-blue-600' : 'text-gray-800'} ${darkMode && selectedDay !== idx ? 'text-gray-200' : ''}`}>{day.num}</div>
                  </button>
                ))}
              </div>

              {/* Morning Slots */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-2">
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Morning
              </div>
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {morningSlotsList.map(slot => (
                  <button key={slot} disabled={bookedSlots[slot]} onClick={() => handleSlotSelect(slot)} 
                    className={`py-2 rounded-lg text-xs font-medium transition-all text-center ${
                      bookedSlots[slot] ? 'bg-gray-50 text-gray-300 border border-gray-100 line-through cursor-not-allowed' : 
                      (selectedSlot === slot ? 'bg-blue-600 text-white border-blue-600' : 
                      `bg-white text-gray-600 border border-gray-200 hover:border-blue-400 hover:bg-blue-50 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : ''}`)
                    }`}>
                    {slot}
                  </button>
                ))}
              </div>

              {/* Evening Slots */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-2">
                <Moon className="w-3.5 h-3.5 text-purple-600" /> Evening
              </div>
              <div className="grid grid-cols-3 gap-1.5 mb-5">
                {eveningSlotsList.map(slot => (
                  <button key={slot} disabled={bookedSlots[slot]} onClick={() => handleSlotSelect(slot)} 
                    className={`py-2 rounded-lg text-xs font-medium transition-all text-center ${
                      bookedSlots[slot] ? 'bg-gray-50 text-gray-300 border border-gray-100 line-through cursor-not-allowed' : 
                      (selectedSlot === slot ? 'bg-blue-600 text-white border-blue-600' : 
                      `bg-white text-gray-600 border border-gray-200 hover:border-blue-400 hover:bg-blue-50 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : ''}`)
                    }`}>
                    {slot}
                  </button>
                ))}
              </div>

              <hr className={`my-3 ${darkMode ? 'border-gray-700' : ''}`} />

              {/* Summary */}
              {selectedSlot && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-xs mb-1"><span className="text-gray-600">Doctor</span><span className="font-semibold text-gray-800">{doctor.full_name}</span></div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-gray-600">Date</span><span className="font-semibold text-gray-800">{days[selectedDay].full}</span></div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-gray-600">Time</span><span className="font-semibold text-gray-800">{selectedSlot}</span></div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-gray-600">Type</span><span className="font-semibold text-gray-800">{patientInfo.visitType}</span></div>
                  <div className="flex justify-between text-xs pt-1 mt-1 border-t border-blue-200"><span className="text-gray-600">Total</span><span className="font-bold text-blue-600">₹{doctor.consultation_fee || 800}</span></div>
                </div>
              )}

              <button onClick={handleBook} disabled={!selectedSlot || isBooking} 
                className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                  !selectedSlot || isBooking ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 
                  'bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:opacity-90 active:scale-98'
                }`}>
                {isBooking ? 'Confirming...' : (selectedSlot ? 'Confirm Appointment →' : 'Select a Slot to Continue')}
              </button>
              
              <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
                <Lock className="w-3 h-3" /> Secure & Instant Confirmation via SMS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 transition-all duration-300 z-50 ${
        showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'
      }`}>
        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
          <CheckCircle className="w-2.5 h-2.5 text-white" />
        </div>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}