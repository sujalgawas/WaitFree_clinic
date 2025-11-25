import React from 'react';
import { Sun, Moon, LogOut, Menu, X } from 'lucide-react';

export default function Header({ 
  darkMode, setDarkMode, isLoggedIn, setIsLoggedIn, 
  setCurrentPage, showMobileMenu, setShowMobileMenu 
}) {
  return (
    <header className={`sticky top-0 z-50 backdrop-blur-lg border-b ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setCurrentPage('home'); setShowMobileMenu(false); }}>
            <div className="text-3xl group-hover:scale-110 transition-transform">🏥</div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MediQuick
              </h1>
              <p className="text-xs opacity-70">Zero Wait Healthcare</p>
            </div>
          </div>

          <nav className="hidden md:flex gap-1 items-center">
            {!isLoggedIn ? (
              <>
                <button onClick={() => setCurrentPage('login')} className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Login</button>
                <button onClick={() => setCurrentPage('register')} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">Get Started</button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button onClick={() => setCurrentPage('dashboard')} className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Dashboard</button>
                <button onClick={() => { setIsLoggedIn(false); setCurrentPage('home'); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </nav>

          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => setShowMobileMenu(prev => !prev)}>
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {showMobileMenu && (
          <nav className="md:hidden mt-4 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700">
            {!isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <button onClick={() => { setCurrentPage('login'); setShowMobileMenu(false); }} className="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">Login</button>
                <button onClick={() => { setCurrentPage('register'); setShowMobileMenu(false); }} className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">Get Started</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button onClick={() => setDarkMode(!darkMode)} className="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left flex items-center gap-3">
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button onClick={() => { setCurrentPage('dashboard'); setShowMobileMenu(false); }} className="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">Dashboard</button>
                <button onClick={() => { setIsLoggedIn(false); setCurrentPage('home'); setShowMobileMenu(false); }} className="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left flex items-center gap-3">
                  <LogOut size={20} /> Logout
                </button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}