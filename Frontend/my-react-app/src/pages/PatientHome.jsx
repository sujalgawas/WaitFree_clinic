import React, { useContext } from 'react';
import { Zap, Search, Shield, Video, Star, MapPin, Clock, MessageCircle, User } from 'lucide-react';
import { mockDoctors, specialties } from '../data';
import { AuthContext } from '../contexts/auth';

export default function Home({ darkMode, searchQuery, setSearchQuery, setCurrentPage, setSelectedDoctor, setBookingData }) {
  const { user, isAuthenticated } = useContext(AuthContext);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-24">
        {/* Welcome Banner for Authenticated Users */}
        {isAuthenticated && user && (
          <div className={`rounded-2xl p-6 mb-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-md'}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Welcome back, {user.name || user.username}! 👋</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Find your next appointment in seconds
                </p>
              </div>
            </div>
          </div>
        )}
          
        <div className={`rounded-3xl p-8 mb-12 relative overflow-hidden ${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-600 to-purple-700'} text-white`}>
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-yellow-300" />
              <span className="text-sm font-semibold">INSTANT APPOINTMENTS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Find Doctors Without <span className="text-yellow-300"> Waiting</span>
            </h2>
            <p className="text-xl mb-8 opacity-90">Book same-day appointments with verified doctors near you</p>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 flex flex-col md:flex-row gap-2 border border-white/20">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="w-5 h-5 opacity-70" />
                <input 
                  type="text" 
                  placeholder="Search doctors, specialties, clinics..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="flex-1 py-4 bg-transparent outline-none placeholder-white/70" 
                />
              </div>
              <button 
                onClick={() => setCurrentPage('search')} 
                className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Search size={20} /> Search
              </button>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-1/4 h-full opacity-10 pointer-events-none overflow-hidden">
            <div className="text-[8rem] leading-none">🏥</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: <Zap className="w-8 h-8" />, title: "Instant Booking", desc: "Book appointments in under 60 seconds" },
            { icon: <Shield className="w-8 h-8" />, title: "Verified Doctors", desc: "All doctors are verified and experienced" },
            { icon: <Video className="w-8 h-8" />, title: "Video Consult", desc: "Online consultations available" }
          ].map((feature, idx) => (
            <div 
              key={idx} 
              className={`p-6 rounded-2xl backdrop-blur-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-white'} text-center group hover:scale-105 transition-transform`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 text-white group-hover:shadow-lg transition-all`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm opacity-70">{feature.desc}</p>
            </div>
          ))}
        </div>

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
                  setSearchQuery(spec.name); 
                  setCurrentPage('search'); 
                }} 
                className={`p-4 rounded-2xl text-center cursor-pointer group backdrop-blur-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50' : 'bg-white/50 border-white hover:bg-white'} transition-all hover:scale-105 hover:shadow-lg`}
              >
                <div className={`text-4xl mb-3 transform group-hover:scale-110 transition-transform`}>{spec.icon}</div>
                <p className="font-semibold text-sm">{spec.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold">Top Doctors Near You</h3>
            <button className="text-blue-600 hover:underline">View All</button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDoctors.map(doctor => (
              <div 
                key={doctor.id} 
                className={`rounded-2xl overflow-hidden group backdrop-blur-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-white'} hover:shadow-xl transition-all duration-300`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="text-6xl transform group-hover:scale-110 transition-transform">{doctor.photo}</div>
                      {doctor.online && <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg">{doctor.name}</h4>
                        {doctor.verified && <Shield className="w-4 h-4 text-blue-500" />}
                      </div>
                      <p className="text-blue-600 font-semibold">{doctor.specialty}</p>
                      <p className="text-sm opacity-70">{doctor.experience} years exp</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{doctor.rating}</span>
                        </div>
                        <span className="text-xs opacity-70">• {doctor.distance} km away</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <p className="flex items-center gap-2">
                      <MapPin size={16} className="opacity-70" /> {doctor.clinic}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={16} className="opacity-70" /> Next: {doctor.nextSlot}
                    </p>
                    <p className="font-semibold text-green-600">₹{doctor.fees} consultation</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { 
                        setSelectedDoctor(doctor); 
                        setBookingData(prev => ({ ...prev, slot: doctor.slots[0] })); 
                        setCurrentPage('profile'); 
                      }} 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                      Book Now
                    </button>
                    <button 
                      onClick={() => { 
                        setSelectedDoctor(doctor); 
                        setCurrentPage('chat'); 
                      }} 
                      className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
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
