import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Navigation, 
  User, 
  Building2,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Activity,
  Loader
} from 'lucide-react';
import { useLoadScript, GoogleMap, DirectionsRenderer, Marker } from '@react-google-maps/api';
import API_KEYS from '../assets/API_keys.json';

const libraries = ['places', 'directions'];

export default function BookingTracker({ appointment, darkMode, onBack }) {
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [clinicLocation, setClinicLocation] = useState(null);
  const [clinicInfo, setClinicInfo] = useState({});
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEYS.GOOGLE_API_KEY,
    libraries: libraries,
  });

  // Map container style
  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px'
  };

  // Get accurate locations from backend
  useEffect(() => {
    if (appointment && appointment.doctor_uid) {
      getAccurateLocations();
    } else {
      console.error('Missing doctor_uid in appointment:', appointment);
      setMapError('Missing doctor information');
      setLoadingLocation(false);
    }
  }, [appointment]);

  const getAccurateLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Fetching locations for doctor_uid:', appointment.doctor_uid);
      
      // Fetch both patient and clinic locations from backend
      const response = await axios.post('http://127.0.0.1:5000/get-appointment-locations', {
        token: token,
        doctor_uid: appointment.doctor_uid
      });
      
      console.log('Location response:', response.data);
      
      if (response.data.success) {
        // Store debug info
        setDebugInfo(response.data.debug);
        
        // Set patient location
        if (response.data.patient_location) {
          setUserLocation(response.data.patient_location);
          console.log('✓ Patient location set:', response.data.patient_location);
        } else {
          console.log('No saved patient location, using browser geolocation');
          getUserLocationFromBrowser();
        }
        
        // Set clinic location
        if (response.data.clinic_location) {
          setClinicLocation(response.data.clinic_location);
          console.log('✓ Clinic location set:', response.data.clinic_location);
          setMapError(null);
        } else {
          console.warn('⚠ Clinic location not available');
          setMapError('Clinic location could not be extracted from Google Maps link');
          
          // Log the maps link for debugging
          if (response.data.clinic_info?.google_maps_link) {
            console.log('Google Maps link:', response.data.clinic_info.google_maps_link);
          }
        }
        
        // Set clinic info
        if (response.data.clinic_info) {
          setClinicInfo(response.data.clinic_info);
        }
      } else {
        setMapError('Failed to fetch location data');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setMapError(`Server error: ${error.response.data.error || 'Unknown error'}`);
      } else {
        setMapError('Network error - could not reach server');
      }
      // Fallback to browser geolocation for user
      getUserLocationFromBrowser();
    } finally {
      setLoadingLocation(false);
    }
  };

  const getUserLocationFromBrowser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('✓ Browser geolocation:', loc);
          setUserLocation(loc);
          
          // Save this location to backend
          saveUserLocation(loc);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to Mumbai coordinates
          const fallback = { lat: 19.0760, lng: 72.8777 };
          console.log('Using fallback location:', fallback);
          setUserLocation(fallback);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.log('Geolocation not supported, using fallback');
      setUserLocation({ lat: 19.0760, lng: 72.8777 });
    }
  };

  const saveUserLocation = async (location) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:5000/update-location', {
        token: token,
        lat: location.lat,
        lng: location.lng,
        city: '',
        zip_code: '',
        formatted_address: ''
      });
      console.log('✓ User location saved to backend');
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  // Calculate directions when both locations are available AND map is loaded
  useEffect(() => {
    if (userLocation && clinicLocation && isLoaded && window.google) {
      console.log('Calculating directions...');
      console.log('From:', userLocation);
      console.log('To:', clinicLocation);
      calculateDirections();
    }
  }, [userLocation, clinicLocation, isLoaded]);

  const calculateDirections = () => {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded');
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
        destination: new window.google.maps.LatLng(clinicLocation.lat, clinicLocation.lng),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          console.log('✓ Directions calculated successfully');
          setDirections(result);
          setDistance(result.routes[0].legs[0].distance.text);
          setDuration(result.routes[0].legs[0].duration.text);
        } else {
          console.error('Directions request failed:', status);
          setMapError(`Could not calculate directions: ${status}`);
        }
      }
    );
  };

  const openInGoogleMaps = () => {
    if (clinicLocation && userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${clinicLocation.lat},${clinicLocation.lng}&travelmode=driving`;
      window.open(url, '_blank');
    } else if (clinicInfo.google_maps_link) {
      // Fallback to opening the clinic's Google Maps link
      window.open(clinicInfo.google_maps_link, '_blank');
    }
  };

  if (!appointment) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
            Appointment not found
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    console.error('Map load error:', loadError);
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pb-20`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ChevronLeft className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Booking Details
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Track your appointment
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status Card */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-full ${
              appointment.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/40' : 
              appointment.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/40' : 'bg-red-100 dark:bg-red-900/40'
            }`}>
              <CheckCircle className={
                appointment.status === 'confirmed' ? 'text-green-600 dark:text-green-400' : 
                appointment.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
              } size={24} />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Appointment Status
              </p>
              <p className={`text-lg font-semibold capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {appointment.status || 'Confirmed'}
              </p>
            </div>
          </div>
          <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-4 mt-4`}>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Booking ID: {appointment.id}
            </p>
          </div>
        </div>

        {/* Doctor & Clinic Info */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Appointment Information
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className={`mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Doctor Name</p>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {appointment.doctor_name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className={`mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Clinic</p>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {clinicInfo.name || appointment.clinic_name || 'Clinic Name'}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {clinicInfo.address || appointment.clinic_address || 'Address not available'}
                </p>
                {clinicInfo.google_maps_link && (
                  <a 
                    href={clinicInfo.google_maps_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-1"
                  >
                    <MapPin size={12} />
                    View on Google Maps
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className={`mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Appointment Date</p>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {appointment.date}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className={`mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Time Slot</p>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {appointment.slot}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map with Directions */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Directions to Clinic
            </h2>
            {distance && duration && (
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="font-semibold text-blue-600">{distance}</span> • {duration}
              </div>
            )}
          </div>

          {loadError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="text-sm">Error loading maps. Please check your API key.</p>
            </div>
          )}

          {mapError && (
            <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Location Issue</p>
                <p className="text-xs mt-1">{mapError}</p>
                {debugInfo?.maps_link && (
                  <p className="text-xs mt-1 opacity-70">
                    Maps link: {debugInfo.maps_link.substring(0, 50)}...
                  </p>
                )}
              </div>
            </div>
          )}

          {loadingLocation ? (
            <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-700 rounded-xl">
              <div className="text-center">
                <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Fetching locations...
                </p>
              </div>
            </div>
          ) : !isLoaded ? (
            <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-700 rounded-xl">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Loading map...
                </p>
              </div>
            </div>
          ) : userLocation && clinicLocation ? (
            <>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={userLocation}
                zoom={13}
                options={{
                  styles: darkMode ? [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }
                  ] : []
                }}
              >
                {/* User Location Marker */}
                <Marker
                  position={userLocation}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                  }}
                  title="Your Location"
                />

                {/* Clinic Location Marker */}
                <Marker
                  position={clinicLocation}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                  }}
                  title={clinicInfo.name || "Clinic"}
                />

                {/* Directions */}
                {directions && (
                  <DirectionsRenderer 
                    directions={directions}
                    options={{
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: '#4285F4',
                        strokeWeight: 5
                      }
                    }}
                  />
                )}
              </GoogleMap>

              <button
                onClick={openInGoogleMaps}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Navigation size={20} />
                Open in Google Maps
              </button>
            </>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-8 text-center">
              <MapPin className={`mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={48} />
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                Location data not available
              </p>
              {clinicInfo.google_maps_link && (
                <button
                  onClick={openInGoogleMaps}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  Open Clinic in Google Maps
                </button>
              )}
            </div>
          )}
        </div>

        {/* Before Visit Instructions */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Before Your Visit
          </h2>
          <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Arrive 10 minutes early for registration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Bring your ID proof and previous medical records</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Wear a mask and follow clinic protocols</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Have your booking confirmation ready</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
