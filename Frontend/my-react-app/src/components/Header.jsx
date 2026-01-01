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
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled
        ? darkMode ? 'bg-gray-900/95 border-gray-800 shadow-xl' : 'bg-white/95 border-gray-200 shadow-lg'
        : 'bg-transparent border-transparent'
      } backdrop-blur-md border-b`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3"> {/* Adjusted padding */}
        <div className="flex items-center justify-between h-14"> {/* Fixed height for better alignment */}
          {/* Logo Section */}
          <div
            onClick={() => {setCurrentPage('home'); navigate('/');}}
            className="flex items-center cursor-pointer flex-shrink-0"
          >
            {/* Using a placeholder for the logo image and adjusting the text style */}
            <img
              src="/Logo.png" // Assuming this path is correct
              alt="WaitFree Clinic"
              className="h-9 w-auto mr-1" 
            />
            <span className="text-2xl font-extrabold tracking-tight">
              WaitFree<span className="text-blue-600">Clinic</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => handleScroll("features")}
              className={`${baseTextColor} ${hoverTextColor} font-medium transition-colors duration-200`}
            >
              Features
            </button>
            <button
              onClick={() => { setCurrentPage('Pricing');  }}
              className={`${baseTextColor} ${hoverTextColor} font-medium transition-colors duration-200`}
            >
              Pricing
            </button>
            <button
              onClick={() => handleScroll("patient-portal")}
              className={`${baseTextColor} ${hoverTextColor} font-medium transition-colors duration-200`}
            >
             Patient Portal
            </button>
            <button
              onClick={() => setCurrentPage('search')}
              className={`${baseTextColor} ${hoverTextColor} font-medium transition-colors duration-200 flex items-center gap-1`}
            >
              <Search className='w-4 h-4' /> Find Doctors
            </button>

            {/* Authentication and User Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 ml-4">
                {/* User Info Dropdown Placeholder/Button */}
                <button
                  onClick={() => navigate(userType === 'doctor' ? '/doctor-home' : '/dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors ${
                    darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">
                    {userType === 'doctor' ? 'Dr. Dashboard' : 'My Dashboard'}
                  </span>
                </button>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
             <button
  onClick={() => navigate('/login')}
  className="
    flex items-center justify-center gap-2
    py-2  w--32 px-2
    rounded-xl
    text-white font-semibold

    bg-gradient-to-r from-blue-600 to-purple-600
    hover:from-blue-700 hover:to-purple-700

    transition-all duration-300
  "
>
  <LogIn className="w-5 h-5" />
  Login / Register
</button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </nav>

          {/* Mobile Menu Button (always visible on mobile) */}
          <div className='md:hidden flex items-center gap-2'>
            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-colors ${
                darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'
              }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            
            {/* Mobile Menu Icon */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'text-white hover:bg-gray-800' : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              {showMobileMenu ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu (Dropdown) */}
        {showMobileMenu && (
          <div className={`md:hidden mt-4 pt-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <nav className="flex flex-col gap-3 font-medium">
              <button
                onClick={() => { navigate('/'); handleScroll('home'); }}
                className={`text-left py-2 px-2 rounded-lg ${baseTextColor} ${hoverTextColor} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
              >
                Home
              </button>
              <button
                onClick={() => { handleScroll("features"); }}
                className={`text-left py-2 px-2 rounded-lg ${baseTextColor} ${hoverTextColor} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
              >
                Features
              </button>
             
              <button
                onClick={() => { handleScroll("patient-portal"); }}
                className={`text-left py-2 px-2 rounded-lg ${baseTextColor} ${hoverTextColor} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
              >
                Patient Portal
              </button>
              <button
                onClick={() => { setCurrentPage('search'); setShowMobileMenu(false); }}
                className={`text-left py-2 px-2 rounded-lg ${baseTextColor} ${hoverTextColor} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
              >
                Find Doctors
              </button>

              {/* Mobile Auth Links */}
              <div className='mt-2 pt-4 border-t border-dashed'>
                {isAuthenticated ? (
                  <>
                    <div className={`flex items-center justify-between py-2 px-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div className="flex items-center gap-2 font-semibold">
                        <User className="w-5 h-5 text-blue-500" />
                        <span>{user?.name || user?.username}</span>
                      </div>
                      <span className='text-xs text-gray-500 font-normal capitalize'>{userType}</span>
                    </div>

                    <button
                      onClick={() => { navigate(userType === 'doctor' ? '/doctor-home' : '/dashboard'); setShowMobileMenu(false); }}
                      className={`text-left py-2 px-2 w-full rounded-lg ${baseTextColor} ${hoverTextColor} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                    >
                      Dashboard
                    </button>

                    {userType === 'patient' && (
                      <button
                        onClick={() => {navigate('/my-appointments');setShowMobileMenu(false);}}
                        className={`text-left py-2 px-2 w-full rounded-lg ${baseTextColor} ${hoverTextColor} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                      >
                        <Calendar className='w-4 h-4 inline-block mr-2'/> My Appointments
                      </button>
                    )}

                    {userType === 'doctor' && (
                      <button
                        onClick={() => {navigate('/doctor-schedule');setShowMobileMenu(false);}}
                        className={`text-left py-2 px-2 w-full rounded-lg ${baseTextColor} ${hoverTextColor} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                      >
                        My Schedule
                      </button>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 py-3 px-2 w-full text-red-600 hover:text-red-700 font-bold mt-2 border-t border-gray-200/50"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setCurrentPage('login'); setShowMobileMenu(false); }}
                    className={`flex items-center justify-center gap-2 py-3 w-full rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors mt-2`}
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