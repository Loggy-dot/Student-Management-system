import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center w-12 h-6
        bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        hover:bg-gray-300 dark:hover:bg-gray-600
        ${className}
      `}
      aria-label="Toggle theme"
    >
      {/* Toggle Circle */}
      <div
        className={`
          absolute w-5 h-5 bg-white dark:bg-gray-300 rounded-full shadow-md
          transform transition-transform duration-200 ease-in-out
          ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}
        `}
      />
      
      {/* Sun Icon */}
      <Sun 
        className={`
          absolute left-1 w-3 h-3 text-yellow-500 transition-opacity duration-200
          ${isDarkMode ? 'opacity-0' : 'opacity-100'}
        `} 
      />
      
      {/* Moon Icon */}
      <Moon 
        className={`
          absolute right-1 w-3 h-3 text-blue-400 transition-opacity duration-200
          ${isDarkMode ? 'opacity-100' : 'opacity-0'}
        `} 
      />
    </button>
  );
};

export default ThemeToggle;
