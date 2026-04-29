import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider } from './contexts/auth';

import Header from './components/Header';
import LocationPopup from './components/LocationPopup';

// Import Pages
import Home from './pages/PatientHome';
import LandingPage from './pages/LandingPage';
import Login from './components/login';
import Register from './pages/Register';
import DoctorLogin from './components/DoctorLogin';
import PatientLogin from './components/PatientLogin';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Confirmation from './pages/Confirmation';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorOnboarding from './pages/DoctorOnBoarding';
import PatientOnboarding from './pages/PatientOnBoarding';
import Pricing from './pages/Pricing';
import ProtectedRoute from './components/ProtectedRoute';
import DoctorHome from './pages/DoctorHome';
import DoctorProfile from './pages/DoctorProfile';
import MyAppointments from './pages/MyAppoinments';
import DoctorSchedule from './pages/DoctorSchedule';
import BookingTracker from './pages/BookingTracker';
import LiveQueueDashboard from './pages/LiveQueueDashboard';
import AboutUs from './pages/About-us';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
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
        if (adminArea) city = adminArea.long_name;
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

  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [userType, setUserType] = useState(localStorage.getItem('user'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '', mobile: '', age: '', problem: '', slot: ''
  });
  const [appointments, setAppointments] = useState([]);

  // Listen for storage changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
      setUserType(localStorage.getItem('user'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Redirect based on user type after login
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user === 'doctor' && window.location.pathname === '/') {
      navigate('/doctor-home');
    } else if (token && user === 'patient' && window.location.pathname === '/') {
      navigate('/patient-home');
    }
  }, [isLoggedIn, userType, navigate]);

  const setCurrentPage = (page) => {
    if (page === 'home') navigate('/');
    else navigate(`/${page}`);
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');

    if (savedLocation) {
      const parsedLoc = JSON.parse(savedLocation);
      setUserLocation(parsedLoc);
      if (!searchQuery) setSearchQuery(parsedLoc.city);
    } else {
      const t = setTimeout(() => setShowLocationPopup(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const handleLocationAllow = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const locationData = await getAddressFromCoordinates(lat, lng);

          if (locationData) {
            setUserLocation(locationData);
            setSearchQuery(locationData.city);
            localStorage.setItem('userLocation', JSON.stringify(locationData));

            try {
              const token = localStorage.getItem('token');
              if (token) {
                await axios.post('http://127.0.0.1:5000/update-location', {
                  ...locationData,
                  token: token
                });
              }
            } catch (err) {
              console.error("Failed to sync location to backend", err);
            }

            setShowLocationPopup(false);
          } else {
            alert("Detected coordinates, but couldn't find the address.");
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
        userType={userType}
      />

      {showLocationPopup && (
        <LocationPopup
          darkMode={darkMode}
          handleLocationAllow={handleLocationAllow}
          setShowLocationPopup={setShowLocationPopup}
        />
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage darkMode={darkMode} />} />
        <Route path="/login" element={<Login darkMode={darkMode} setIsLoggedIn={setIsLoggedIn} setUserType={setUserType} />} />
        <Route path="/register" element={<Register darkMode={darkMode} setIsLoggedIn={setIsLoggedIn} setUserType={setUserType} />} />
        <Route path="/patient-login" element={<PatientLogin darkMode={darkMode} setIsLoggedIn={setIsLoggedIn} setUserType={setUserType} />} />
        <Route path="/doctor-login" element={<DoctorLogin darkMode={darkMode} setIsLoggedIn={setIsLoggedIn} setUserType={setUserType} />} />
        <Route path="/Pricing" element={<Pricing darkMode={darkMode} />} />
      
        <Route path="/About-us" element={<AboutUs darkMode={darkMode} />} />
         <Route path="/Contact" element={<Contact darkMode={darkMode} />} />
          <Route path="/Privacy" element={<Privacy darkMode={darkMode} />} />
          
        {/* Public Search */}

        <Route path="/search" element={<Search darkMode={darkMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setCurrentPage={setCurrentPage} setSelectedDoctor={setSelectedDoctor} setBookingData={setBookingData} />} />
       
       
        {/* Public About */}

        {/* Onboarding Forms - Only accessible if profile NOT completed */}
        <Route path="/patient-form" element={
          <ProtectedRoute requiredUserType="patient">
            <PatientOnboarding darkMode={darkMode} />
          </ProtectedRoute>
        } />

        <Route path="/doctor-form" element={
          <ProtectedRoute requiredUserType="doctor">
            <DoctorOnboarding darkMode={darkMode} />
          </ProtectedRoute>
        } />

        {/* Protected Patient Routes - Require profile completion */}
        <Route path="/patient-home" element={
          <ProtectedRoute requiredUserType="patient" requireProfileCompletion={true}>
            <Home darkMode={darkMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setCurrentPage={setCurrentPage} setSelectedDoctor={setSelectedDoctor} setBookingData={setBookingData} />
          </ProtectedRoute>
        } />

        <Route path="/my-appointments" element={
          <ProtectedRoute requiredUserType="patient" requireProfileCompletion={true}>
            <MyAppointments darkMode={darkMode} />
          </ProtectedRoute>
        } />

        <Route path="/BookingTracker" element={
          <ProtectedRoute requiredUserType="patient" requireProfileCompletion={true}>
            <BookingTracker darkMode={darkMode} />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute requireProfileCompletion={true}>
            <Profile darkMode={darkMode} selectedDoctor={selectedDoctor} bookingData={bookingData} setBookingData={setBookingData} handleBookAppointment={handleBookAppointment} />
          </ProtectedRoute>
        } />

        <Route path="/confirmation" element={
          <ProtectedRoute requireProfileCompletion={true}>
            <Confirmation darkMode={darkMode} appointments={appointments} setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute requiredUserType="patient" requireProfileCompletion={true}>
            <Dashboard darkMode={darkMode} isLoggedIn={isLoggedIn} appointments={appointments} setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        } />

        {/* Protected Doctor Routes - Require profile completion */}
        <Route path="/doctor-home" element={
          <ProtectedRoute requiredUserType="doctor" requireProfileCompletion={true}>
            <DoctorHome darkMode={darkMode} />
          </ProtectedRoute>
        } />

   <Route path="/LiveQueueDashboard" element={
          <ProtectedRoute requiredUserType="doctor" requireProfileCompletion={true}>
            <LiveQueueDashboard darkMode={darkMode} />
          </ProtectedRoute>
        } />

        <Route path="/doctor-schedule" element={
          <ProtectedRoute requiredUserType="doctor" requireProfileCompletion={true}>
            <DoctorSchedule darkMode={darkMode} />
          </ProtectedRoute>
        } />

        <Route path="/doctor/:name" element={
          <DoctorProfile darkMode={darkMode} setBookingData={setBookingData} />
        } />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute requiredUserType="admin">
            <AdminDashboard darkMode={darkMode} appointments={appointments} />
          </ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </Router>
  );
}
