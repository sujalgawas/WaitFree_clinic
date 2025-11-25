import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LocationPopup from './components/LocationPopup';

// Import Pages
import Home from './pages/Home';
import Login from './components/Login'; // Or './pages/Login' if you move it
import Register from './pages/Register';
import DoctorLogin from './pages/DoctorLogin';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Confirmation from './pages/Confirmation';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '', mobile: '', age: '', problem: '', slot: ''
  });
  const [appointments, setAppointments] = useState([]);

  // Show location popup once when user lands on home (if no location)
  useEffect(() => {
    if (currentPage === 'home' && !userLocation) {
      const t = setTimeout(() => setShowLocationPopup(true), 800);
      return () => clearTimeout(t);
    }
  }, [currentPage, userLocation]);

  // toggle dark mode on body
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleLocationAllow = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setShowLocationPopup(false);
          setCurrentPage('search');
        },
        () => {
          alert('Location access denied. Please enter your area manually.');
          setShowLocationPopup(false);
        }
      );
    } else {
      alert('Geolocation not supported in your browser.');
      setShowLocationPopup(false);
    }
  };

  const handleBookAppointment = () => {
    if (bookingData.name && bookingData.mobile && bookingData.slot) {
      const newAppointment = {
        id: Date.now(),
        doctorId: selectedDoctor?.id || null,
        doctorName: selectedDoctor?.name || bookingData.doctorName || 'Unknown',
        clinic: selectedDoctor?.clinic || bookingData.clinic || '',
        address: selectedDoctor?.address || bookingData.address || '',
        ...bookingData,
        status: 'confirmed',
        date: new Date().toLocaleDateString(),
        type: Math.random() > 0.5 ? 'video' : 'in-person'
      };
      setAppointments(prev => [newAppointment, ...prev]);
      // reset booking form
      setBookingData({ name: '', mobile: '', age: '', problem: '', slot: '' });
      setSelectedDoctor(null);
      setCurrentPage('confirmation');
    } else {
      alert('Please fill all required fields (name, mobile, slot).');
    }
  };

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <Header 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setCurrentPage={setCurrentPage}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
      />
      
      {showLocationPopup && (
        <LocationPopup 
          darkMode={darkMode}
          handleLocationAllow={handleLocationAllow}
          setShowLocationPopup={setShowLocationPopup}
        />
      )}

      {currentPage === 'home' && (
        <Home 
          darkMode={darkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setCurrentPage={setCurrentPage}
          setSelectedDoctor={setSelectedDoctor}
          setBookingData={setBookingData}
        />
      )}

      {currentPage === 'login' && (
        <Login 
          darkMode={darkMode}
          setIsLoggedIn={setIsLoggedIn}
          setUserType={setUserType}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'register' && (
        <Register 
          darkMode={darkMode}
          setIsLoggedIn={setIsLoggedIn}
          setUserType={setUserType}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'doctor-login' && (
        <DoctorLogin 
          darkMode={darkMode}
          setIsLoggedIn={setIsLoggedIn}
          setUserType={setUserType}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'search' && (
        <Search 
          darkMode={darkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setCurrentPage={setCurrentPage}
          setSelectedDoctor={setSelectedDoctor}
          setBookingData={setBookingData}
        />
      )}

      {currentPage === 'profile' && (
        <Profile 
          darkMode={darkMode}
          selectedDoctor={selectedDoctor}
          setCurrentPage={setCurrentPage}
          bookingData={bookingData}
          setBookingData={setBookingData}
          handleBookAppointment={handleBookAppointment}
        />
      )}

      {currentPage === 'confirmation' && (
        <Confirmation 
          darkMode={darkMode}
          appointments={appointments}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'dashboard' && (
        <Dashboard 
          darkMode={darkMode}
          isLoggedIn={isLoggedIn}
          appointments={appointments}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'admin-dashboard' && (
        <AdminDashboard 
          darkMode={darkMode}
          appointments={appointments}
        />
      )}
    </div>
  );
}