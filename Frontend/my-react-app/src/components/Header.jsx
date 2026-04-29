import React, { useContext, useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, User, LogOut, LogIn, ChevronDown, Calendar, Search } from 'lucide-react';
import { AuthContext } from '../contexts/auth';
import { useNavigate, useLocation } from "react-router-dom";

export default function Header({
  darkMode,
  setDarkMode,
  setCurrentPage,
  showMobileMenu,
  setShowMobileMenu,
  userType
}) {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrollToId, setScrollToId] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false); // To add shadow/background change on scroll

  // Handle Logout
  const handleLogout = () => {
    logout();
    setShowMobileMenu(false);
    navigate('/'); // Navigate to home after logout
  };

  // Effect to scroll after navigation (if coming from a different page)
  useEffect(() => {
    if (scrollToId) {
      const section = document.getElementById(scrollToId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        setScrollToId(null);
        setShowMobileMenu(false); // Close menu after scroll action
      }
    }
  }, [scrollToId, location]);

  // Handle Scroll logic (navigate to home first if not already there)
  const handleScroll = (id) => {
    const section = document.getElementById(id);

    if (section && location.pathname === "/") {
      section.scrollIntoView({ behavior: "smooth" });
      setShowMobileMenu(false); // Close menu immediately if on the same page
    } else {
      setScrollToId(id);
      if (location.pathname !== "/") {
        navigate("/");
      }
    }
  };

  // Handle scroll detection for dynamic header styling
  useEffect(() => {
    const handleScrollDetection = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScrollDetection);
    return () => window.removeEventListener('scroll', handleScrollDetection);
  }, []);

  // Base text color for desktop links
  const baseTextColor = darkMode ? 'text-gray-300' : 'text-gray-700';
  const hoverTextColor = 'hover:text-blue-500';

  return (
    
<header className={`fixed w-full top-0 z-50 transition-all duration-300  dark:bg-gray-900  ${
      isScrolled
        ? darkMode ? '  dark:bg-gray-900 bg-gray-900/95 border-gray-800 shadow-xl' : 'bg-white/95 border-gray-200 shadow-lg '
        : 'bg-transparent border-transparent'
      } backdrop-blur-md border-b `}>
 <div className="container mx-auto px-4 sm:px-6 lg:px-8  dark:bg-gray-900 ">
    <div className="flex items-center justify-between h-16  dark:bg-gray-900 ">
      
      {/* Logo Section - LEFT */}
      <div
        onClick={() => {setCurrentPage('home'); navigate('/');}}
        className="flex items-center cursor-pointer flex-shrink-0  dark:bg-gray-900 "
      >
        <img
          src="/Logo.png"
          alt="WaitFree Clinic"
          className="h-8 w-auto mr-2" 
        />
      <span className="text-xl font-extrabold tracking-tight whitespace-nowrap text-black dark:text-white">
  WaitFree<span className="text-blue-600 dark:text-blue-400">Clinic</span>
</span>
      </div>

      {/* Desktop Navigation - CENTER */}
      <nav className="hidden md:flex items-center justify-center   dark:bg-gray-900  space-x-6 lg:space-x-8 ">
        <button
          onClick={() => handleScroll("features")}
          className={`${baseTextColor} ${hoverTextColor} font-medium transition-colors duration-200 whitespace-nowrap text-sm lg:text-base`}
        >
          Features
        </button>
        <button
          onClick={() => { setCurrentPage('Pricing'); }}
          className={`${baseTextColor} ${hoverTextColor} font-medium transition-colors duration-200 whitespace-nowrap text-sm lg:text-base`}
        >
          Pricing
        </button>
        <button
          onClick={() => handleScroll("patient-portal")}
          className={`${baseTextColor} ${hoverTextColor} font-medium transition-colors duration-200 whitespace-nowrap text-sm lg:text-base`}
        >
          Patient Portal
        </button>
        <button
          onClick={() => setCurrentPage('search')}
          className={`${baseTextColor} ${hoverTextColor} font-medium transition-colors duration-200 flex items-center gap-2 whitespace-nowrap text-sm lg:text-base`}
        >
          <Search className='w-4 h-4' />
          Find Doctors
        </button>
      </nav>

      {/* Right Section - Auth & Dark Mode */}
      <div className="hidden md:flex items-center space-x-3  dark:bg-gray-900  lg:space-x-4">
        {/* Authentication Buttons */}
        {isAuthenticated ? (
          <>
            {userType === 'patient' && (
              <button
                onClick={() => navigate('/my-appointments')}
                className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors whitespace-nowrap text-sm font-medium`}
              >
                My Appointments
              </button>
            )}

            {userType === 'doctor' && (
              <button
                onClick={() => navigate('/doctor-schedule')}
                className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors whitespace-nowrap text-sm font-medium`}
              >
                My Schedule
              </button>
            )}
            
            <button
              onClick={() => navigate(userType === 'doctor' ? '/doctor-home' : '/dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
                darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            > 
              <User className="w-4 h-4" />
              <span className="whitespace-nowrap">
                {userType === 'doctor' ? 'Dashboard' : 'Dashboard'}
              </span>
            </button>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm"
          >
            <LogIn className="w-4 h-4" />
            Login / Register
          </button>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Button */}
      <div className='md:hidden flex items-center gap-2'>
        {/* Mobile Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-lg transition-colors ${
            darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'
          }`}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        {/* Mobile Menu Icon */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className={`p-2 rounded-lg transition-colors ${
            darkMode ? 'text-white hover:bg-gray-800' : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </div>

    {/* Mobile Menu Dropdown */}
    {showMobileMenu && (
      <div className={`md:hidden mt-4 pt-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <nav className="flex flex-col gap-2 pb-4">
          <button
            onClick={() => { handleScroll("features"); setShowMobileMenu(false); }}
            className={`text-left py-3 px-3 rounded-lg ${baseTextColor} ${hoverTextColor} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} font-medium`}
          >
            Features
          </button>
          <button
            onClick={() => { setCurrentPage('Pricing'); setShowMobileMenu(false); }}
            className={`text-left py-3 px-3 rounded-lg ${baseTextColor} ${hoverTextColor} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} font-medium`}
          >
            Pricing
          </button>
          <button
            onClick={() => { handleScroll("patient-portal"); setShowMobileMenu(false); }}
            className={`text-left py-3 px-3 rounded-lg ${baseTextColor} ${hoverTextColor} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} font-medium`}
          >
            Patient Portal
          </button>
          <button
            onClick={() => { setCurrentPage('search'); setShowMobileMenu(false); }}
            className={`text-left py-3 px-3 rounded-lg ${baseTextColor} ${hoverTextColor} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} font-medium`}
          >
            <Search className='w-4 h-4 inline mr-2' />
            Find Doctors
          </button>

          {/* Mobile Auth Section */}
          <div className='mt-4 pt-4 border-t border-dashed'>
            {isAuthenticated ? (
              <>
                <div className={`flex items-center justify-between py-3 px-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} mb-2`}>
                  <div className="flex items-center gap-2 font-semibold">
                    <User className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">{user?.name || user?.username}</span>
                  </div>
                  <span className='text-xs text-gray-500 font-normal capitalize'>{userType}</span>
                </div>

                <button
                  onClick={() => { navigate(userType === 'doctor' ? '/doctor-home' : '/dashboard'); setShowMobileMenu(false); }}
                  className={`text-left py-3 px-3 w-full rounded-lg ${baseTextColor} ${hoverTextColor} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} font-medium`}
                >
                  Dashboard
                </button>

                {userType === 'patient' && (
                  <button
                    onClick={() => {navigate('/my-appointments'); setShowMobileMenu(false);}}
                    className={`text-left py-3 px-3 w-full rounded-lg ${baseTextColor} ${hoverTextColor} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} font-medium`}
                  >
                    <Calendar className='w-4 h-4 inline-block mr-2'/> My Appointments
                  </button>
                )}

                {userType === 'doctor' && (
                  <button
                    onClick={() => {navigate('/doctor-schedule'); setShowMobileMenu(false);}}
                    className={`text-left py-3 px-3 w-full rounded-lg ${baseTextColor} ${hoverTextColor} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} font-medium`}
                  >
                    My Schedule
                  </button>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 py-3 px-3 w-full text-red-600 hover:text-red-700 font-semibold mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => { setCurrentPage('login'); setShowMobileMenu(false); }}
                className="flex items-center justify-center gap-2 py-3 w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                <LogIn className="w-5 h-5" />
                Login / Register
              </button>
            )}
          </div>
        </nav>
      </div>
    )}
  </div>
    </header>
  );
}