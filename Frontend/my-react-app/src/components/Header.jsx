import React, { useContext } from 'react';
import { Moon, Sun, Menu, X, User, LogOut, LogIn } from 'lucide-react';
import { AuthContext } from '../contexts/auth';

export default function Header({ 
  darkMode, 
  setDarkMode, 
  setCurrentPage, 
  showMobileMenu, 
  setShowMobileMenu,
  userType 
}) {
  const { user, isAuthenticated, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    setShowMobileMenu(false);
  };

  return (
    <header className={`fixed w-full top-0 z-50 backdrop-blur-lg border-b transition-colors ${
      darkMode 
        ? 'bg-gray-900/90 border-gray-800' 
        : 'bg-white/90 border-gray-200'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => setCurrentPage('home')} 
            className="text-2xl font-bold cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            WaitFreeClinic
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setCurrentPage('home')}
              className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentPage('search')}
              className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Find Doctors
            </button>
            
            {isAuthenticated ? (
              <>
                <button 
                  onClick={() => setCurrentPage(userType === 'doctor' ? 'doctor-home' : 'dashboard')}
                  className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Dashboard
                </button>
                
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    darkMode ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {user?.name || user?.username}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setCurrentPage('login')}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
                
              </>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className={`md:hidden mt-4 py-4 border-t ${
            darkMode ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <nav className="flex flex-col gap-4">
              <button 
                onClick={() => { setCurrentPage('home'); setShowMobileMenu(false); }}
                className="text-left py-2 hover:text-blue-600"
              >
                Home
              </button>
              <button 
                onClick={() => { setCurrentPage('search'); setShowMobileMenu(false); }}
                className="text-left py-2 hover:text-blue-600"
              >
                Find Doctors
              </button>
              
              {isAuthenticated ? (
                <>
                  <div className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{user?.name || user?.username}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setCurrentPage(userType === 'doctor' ? 'doctor-home' : 'dashboard'); setShowMobileMenu(false); }}
                    className="text-left py-2 hover:text-blue-600"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 py-2 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { setCurrentPage('login'); setShowMobileMenu(false); }}
                    className="text-left py-2 text-blue-600"
                  >
                    Login
                  </button>
                  
                </>
              )}

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2 py-2"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
