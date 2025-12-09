import React, { useContext, useEffect, useState } from 'react';
import { Zap, Search as SearchIcon, Shield, Video, Star, MapPin, Clock, MessageCircle, User } from 'lucide-react';
import { AuthContext } from '../contexts/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Fallback data
import { mockDoctors as fallbackDoctors, specialties } from '../data'; 

export default function PatientHome({ darkMode, searchQuery, setSearchQuery, setCurrentPage, setSelectedDoctor, setBookingData }) {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  const displayName = user?.name || localStorage.getItem('userName') || 'User';
  
  // --- FETCH TOP DOCTORS (On Mount) ---
  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        const savedLocation = localStorage.getItem('userLocation');
        let city = '';
        if (savedLocation) {
           city = JSON.parse(savedLocation).city;
        }

        const response = await axios.post('http://127.0.0.1:5000/search', {
          query: '', // Empty query gets top doctors
          location: { city: city }
        });
        
        if(response.data.results && response.data.results.length > 0) {
            setDoctors(response.data.results);
        } else {
            setDoctors(fallbackDoctors);
        }
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        setDoctors(fallbackDoctors);
      }
    };

    fetchTopDoctors();
  }, []);

  // --- UPDATED SEARCH HANDLER ---
  const handleSearch = (term) => {
    // If a term is passed (like clicking a specialty), use it. Otherwise use the input state.
    const queryToSearch = term || searchQuery;
    
    // Navigate with Query String (?q=...)
    navigate(`/search?q=${encodeURIComponent(queryToSearch)}`);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-24">
        
        {/* Welcome Banner */}
        {isAuthenticated && (
          <div className={`rounded-2xl p-6 mb-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-md'}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Welcome back, {displayName}! 👋</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Find your next appointment in seconds
                </p>
              </div>
            </div>
          </div>
        )}
          
        {/* Hero Section */}
        <div className={`rounded-3xl p-8 mb-12 relative overflow-hidden ${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-600 to-purple-700'} text-white`}>
          <div className="relative z-10 max-w-2xl">
            {/* ... (Header Text) ... */}
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Find Doctors Without <span className="text-yellow-300"> Waiting</span>
            </h2>
            <p className="text-xl mb-8 opacity-90">Book same-day appointments with verified doctors near you</p>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 flex flex-col md:flex-row gap-2 border border-white/20">
              <div className="flex-1 flex items-center gap-3 px-4">
                <SearchIcon className="w-5 h-5 opacity-70" />
                <input 
                  type="text" 
                  placeholder="Search doctors, specialties, clinics..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  // Pass null to handleSearch so it uses the state value
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(null)}
                  className="flex-1 py-4 bg-transparent outline-none placeholder-white/70 text-white" 
                />
              </div>
              <button 
                onClick={() => handleSearch(null)} 
                className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
              >
                <SearchIcon size={20} /> Search
              </button>
            </div>
          </div>
          {/* ... */}
        </div>

        {/* ... (Features Grid) ... */}

        {/* Specialties */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold">Top Specialties</h3>
            <button className="text-blue-600 hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialties.map((spec, idx) => (
              <div 
                key={idx} 
                onClick={() => { 
                  // Update global state AND navigate with query string
                  setSearchQuery(spec.name); 
                  handleSearch(spec.name);
                }} 
                className={`p-4 rounded-2xl text-center cursor-pointer group backdrop-blur-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50' : 'bg-white/50 border-white hover:bg-white'} transition-all hover:scale-105 hover:shadow-lg`}
              >
                <div className={`text-4xl mb-3 transform group-hover:scale-110 transition-transform`}>{spec.icon}</div>
                <p className="font-semibold text-sm">{spec.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Doctors Grid */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold">Top Doctors Near You</h3>
            <button className="text-blue-600 hover:underline">View All</button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doctor => (
              <div key={doctor.id || doctor.uid} className={`rounded-2xl overflow-hidden group backdrop-blur-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-white'} hover:shadow-xl transition-all duration-300`}>
                <div className="p-6">
                  {/* ... (Existing Doctor Card UI) ... */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="text-6xl transform group-hover:scale-110 transition-transform">
                        {doctor.photo && doctor.photo !== "default_avatar" ? 
                           (typeof doctor.photo === 'string' && doctor.photo.includes('http') ? <img src={doctor.photo} alt="doc" className="w-16 h-16 rounded-full object-cover"/> : doctor.photo) 
                           : "👨‍⚕️"}
                      </div>
                      {doctor.online && <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg">{doctor.name || doctor.full_name}</h4>
                        {doctor.verified && <Shield className="w-4 h-4 text-blue-500" />}
                      </div>
                      <p className="text-blue-600 font-semibold">{doctor.specialty || doctor.specialization}</p>
                      {/* ... */}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <p className="flex items-center gap-2">
                      <MapPin size={16} className="opacity-70" /> {doctor.clinic || doctor.clinic_details?.name}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={16} className="opacity-70" /> Next: {doctor.nextSlot || 'Available'}
                    </p>
                    <p className="font-semibold text-green-600">₹{doctor.fees || doctor.consultation_fee} consultation</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { 
                        setSelectedDoctor(doctor); 
                        // Fix navigation to use Name
                        navigate(`/doctor/${doctor.name || doctor.full_name}`);
                      }} 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                      Book Now
                    </button>
                    <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <MessageCircle size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}