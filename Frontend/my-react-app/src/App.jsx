import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/auth'; // Importing from your specified path

import Header from './components/Header';
import LocationPopup from './components/LocationPopup';

// Import Pages
import Home from './pages/Home';
import Login from './components/Login'; 
import Register from './pages/Register';
import DoctorLogin from './pages/DoctorLogin';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Confirmation from './pages/Confirmation';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorOnboarding from './pages/DoctorOnBoarding';

// We separate the Logic into a child component so we can use 'useNavigate'
function MainLayout() {
  const navigate = useNavigate();

  // --- Global State ---
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

  // --- "Shim" Function to support your existing components ---
  // This translates your old "setCurrentPage" calls into Router navigation
  const setCurrentPage = (page) => {
    if (page === 'home') navigate('/');
    else navigate(`/${page}`);
  };

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Location Popup Logic
  useEffect(() => {
    // Check if we are on the home page (root path)
    if (window.location.pathname === '/' && !userLocation) {
      const t = setTimeout(() => setShowLocationPopup(true), 800);
      return () => clearTimeout(t);
    }
  }, [userLocation]);

  const handleLocationAllow = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setShowLocationPopup(false);
          navigate('/search'); // Use router navigation
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
      
      // Reset form
      setBookingData({ name: '', mobile: '', age: '', problem: '', slot: '' });
      setSelectedDoctor(null);
      
      // Navigate to confirmation
      navigate('/confirmation'); 
    } else {
      alert('Please fill all required fields (name, mobile, slot).');
    }
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200`}>
      <Header 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setCurrentPage={setCurrentPage} // Passed down so Header links still work
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

      {/* React Router Routes */}
      <Routes>
        <Route path="/" element={
          <Home 
            darkMode={darkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setCurrentPage={setCurrentPage}
            setSelectedDoctor={setSelectedDoctor}
            setBookingData={setBookingData}
          />
        } />

        <Route path="/doctor-form" element={
          <DoctorOnboarding 
            darkMode={darkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setCurrentPage={setCurrentPage}
            setSelectedDoctor={setSelectedDoctor}
            setBookingData={setBookingData}
          />
        } />

        <Route path="/login" element={
          <Login 
            darkMode={darkMode}
            setIsLoggedIn={setIsLoggedIn}
            setUserType={setUserType}
            setCurrentPage={setCurrentPage}
          />
        } />

        <Route path="/register" element={
          <Register 
            darkMode={darkMode}
            setIsLoggedIn={setIsLoggedIn}
            setUserType={setUserType}
            setCurrentPage={setCurrentPage}
          />
        } />

        <Route path="/doctor-login" element={
          <DoctorLogin 
            darkMode={darkMode}
            setIsLoggedIn={setIsLoggedIn}
            setUserType={setUserType}
            setCurrentPage={setCurrentPage}
          />
        } />

        <Route path="/search" element={
          <Search 
            darkMode={darkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setCurrentPage={setCurrentPage}
            setSelectedDoctor={setSelectedDoctor}
            setBookingData={setBookingData}
          />
        } />

        <Route path="/profile" element={
          <Profile 
            darkMode={darkMode}
            selectedDoctor={selectedDoctor}
            setCurrentPage={setCurrentPage}
            bookingData={bookingData}
            setBookingData={setBookingData}
            handleBookAppointment={handleBookAppointment}
          />
        } />

        <Route path="/confirmation" element={
          <Confirmation 
            darkMode={darkMode}
            appointments={appointments}
            setCurrentPage={setCurrentPage}
          />
        } />

        <Route path="/dashboard" element={
          <Dashboard 
            darkMode={darkMode}
            isLoggedIn={isLoggedIn}
            appointments={appointments}
            setCurrentPage={setCurrentPage}
          />
        } />

        <Route path="/admin-dashboard" element={
          <AdminDashboard 
            darkMode={darkMode}
            appointments={appointments}
          />
        } />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    //<AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    //</AuthProvider>
  );
}