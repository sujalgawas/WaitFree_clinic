import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios'; // Make sure to import axios
import { AuthProvider } from './contexts/auth'; 

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
import PatientOnboarding from './pages/PatientOnBoarding';
import API_KEYS from './assets/API_keys.json';

const getAddressFromCoordinates = async (lat, lng) => {
  const GOOGLE_API_KEY = API_KEYS.GOOGLE_API_KEY; 
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const addressComponents = data.results[0].address_components;
      let city = '';
      let zip = '';
      
      addressComponents.forEach(comp => {
        if (comp.types.includes('locality')) city = comp.long_name;
        if (comp.types.includes('postal_code')) zip = comp.long_name;
      });

      if (!city) {
         const adminArea = addressComponents.find(c => c.types.includes('administrative_area_level_2'));
         if(adminArea) city = adminArea.long_name;
      }

      return {
        formatted_address: data.results[0].formatted_address,
        city: city || 'Unknown',
        zip_code: zip,
        lat: lat,
        lng: lng
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

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

  // Shim for old components
  const setCurrentPage = (page) => {
    if (page === 'home') navigate('/');
    else navigate(`/${page}`);
  };

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // --- LOCATION LOGIC ---
  useEffect(() => {
    // 1. Check LocalStorage on startup
    const savedLocation = localStorage.getItem('userLocation');
    
    if (savedLocation) {
      // If we have it, load it into state
      const parsedLoc = JSON.parse(savedLocation);
      setUserLocation(parsedLoc);
      // Pre-fill search if on home/search page
      if(!searchQuery) setSearchQuery(parsedLoc.city);
    } else {
      // 2. If NOT in LocalStorage, show popup after delay (only on home page)
      if (window.location.pathname === '/') {
        const t = setTimeout(() => setShowLocationPopup(true), 1000);
        return () => clearTimeout(t);
      }
    }
  }, []); // Run once on mount

  const handleLocationAllow = () => {
    if (navigator.geolocation) {
      // Show loading state if you have one, or just wait
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // 1. Get readable address from Google API
          const locationData = await getAddressFromCoordinates(lat, lng);
          
          if (locationData) {
            // Update State
            setUserLocation(locationData);
            setSearchQuery(locationData.city);
            
            // 2. Save to LocalStorage
            localStorage.setItem('userLocation', JSON.stringify(locationData));
            
            // 3. Send to Backend (to save in DB)
            try {
                const token = localStorage.getItem('token');
                // We send it even if token is null (guest mode backend handling)
                await axios.post('http://127.0.0.1:5000/update-location', { 
                    ...locationData, 
                    token: token 
                });
            } catch (err) {
                console.error("Failed to sync location to backend", err);
            }

            setShowLocationPopup(false);
            //navigate('/search'); 
          } else {
            alert("Detected coordinates, but Google couldn't find the City address.");
            setShowLocationPopup(false);
          }
        },
        (error) => {
          console.error("Geolocation denied:", error);
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
      setBookingData({ name: '', mobile: '', age: '', problem: '', slot: '' });
      setSelectedDoctor(null);
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
        
        <Route path="/patient-form" element={
          <PatientOnboarding 
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