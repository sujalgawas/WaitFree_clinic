import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, MapPin, Star, Clock, Loader2 } from 'lucide-react';

export default function Search({ darkMode, searchQuery, setSearchQuery, setCurrentPage, setSelectedDoctor, setBookingData }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- FETCH DOCTORS FROM BACKEND ---
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Get User Location from Storage (to filter by city)
        const savedLocation = localStorage.getItem('userLocation');
        let city = '';
        if (savedLocation) {
            city = JSON.parse(savedLocation).city;
        }

        // 2. Call the Flask API
        // Make sure this URL matches your server.py
        const response = await axios.post('http://127.0.0.1:5000/search', {
          query: searchQuery,
          location: { city: city }
        });

        // 3. Update State
        if (response.data.results) {
            setDoctors(response.data.results);
        } else {
            setDoctors([]);
        }

      } catch (err) {
        console.error("Search Error:", err);
        // If API fails, we can either show an error or just show empty
        setError("Failed to connect to server. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Debounce: Wait 500ms after typing stops before calling API
    const debounceTimer = setTimeout(() => {
        fetchDoctors();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]); // Re-run whenever searchQuery changes

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        
        {/* Search Header */}
        <div className="mb-6 flex items-center gap-3">
          <input 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search doctors, specialties, clinics..." 
            className={`flex-1 px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} 
          />
          <button 
            onClick={() => setCurrentPage('home')} 
            className={`px-4 py-3 rounded-xl border font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition ${darkMode ? 'border-gray-700' : 'bg-white border-gray-200'}`}
          >
            Back
          </button>
        </div>

        {/* Loading State */}
        {loading && (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-2" />
                <p className="opacity-70">Finding the best doctors for you...</p>
            </div>
        )}

        {/* Error State */}
        {!loading && error && (
            <div className="text-center py-10 text-red-500">
                <p>{error}</p>
            </div>
        )}

        {/* Results Grid */}
        {!loading && !error && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doc => (
                <div key={doc.id} className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-white'}`}>
                
                <div className="flex items-start gap-4 mb-4">
                    {/* Doctor Image / Avatar */}
                    <div className="relative">
                        <div className="text-5xl">{doc.photo || "👨‍⚕️"}</div>
                        {doc.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                    </div>

                    <div className="flex-1">
                        <h4 className="font-bold text-lg">{doc.name}</h4>
                        <p className="text-sm font-medium text-blue-600">{doc.specialty}</p>
                        
                        <div className="flex items-center gap-2 mt-1 text-sm opacity-70">
                            <span>{doc.experience || 0} yrs exp</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                <span>{doc.rating || 4.5}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm mb-4 opacity-80">
                    <p className="flex items-center gap-2">
                        <MapPin size={16} /> {doc.clinic || "Clinic Name"}
                    </p>
                    <p className="flex items-center gap-2">
                        <Clock size={16} /> Next Slot: <span className="font-semibold">{doc.nextSlot || "Available Today"}</span>
                    </p>
                    <p className="font-bold text-green-600 text-base">
                        ₹{doc.fees || "500"} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">Consultation Fee</span>
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button 
                        onClick={() => { 
                            setSelectedDoctor(doc); 
                            setBookingData(prev => ({ ...prev, slot: doc.slots ? doc.slots[0] : '10:00 AM', doctorName: doc.name, clinic: doc.clinic, address: doc.address })); 
                            setCurrentPage('profile'); 
                        }} 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl font-semibold hover:opacity-90 transition"
                    >
                        Book
                    </button>
                    <button 
                        className={`p-2 border rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                        <MessageCircle size={20} />
                    </button>
                </div>
                </div>
            ))}
            
            {doctors.length === 0 && (
                <div className="col-span-full text-center py-20 opacity-70">
                    <p className="text-xl font-semibold">No doctors found.</p>
                    <p>Try changing your location or search for a different specialty.</p>
                </div>
            )}
            </div>
        )}
      </div>
    </div>
  );
}