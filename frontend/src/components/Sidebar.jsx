import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FaTachometerAlt, 
  FaReceipt, 
  FaHistory, 
  FaUser, 
  FaUserCircle,
  FaQrcode,
  FaEnvelope,
  FaChartBar,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaSun,
  FaMoon
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <FaTachometerAlt />,
    },
    {
      name: 'Generate Receipt',
      path: '/receipts',
      icon: <FaReceipt />,
    },
    {
      name: 'Receipt History',
      path: '/history',
      icon: <FaHistory />,
    },
    {
      name: 'Send Email',
      path: '/email',
      icon: <FaEnvelope />,
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: <FaChartBar />,
    },
    {
      name: 'Verify Receipt',
      path: '/verify',
      icon: <FaQrcode />,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <FaUser />,
    },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const handleThemeToggle = () => {
    toggleTheme();
    // Optional: Show toast message for theme change
    // toast.success(`${theme === 'light' ? 'Dark' : 'Light'} mode activated`);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed top-4 right-4 z-50 md:hidden bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-md shadow-lg transition-colors duration-200"
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-gray-800 dark:bg-gray-900 text-white z-50 md:z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700 dark:border-gray-700">
          {!isCollapsed && (
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              PG System
            </h2>
          )}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors mx-auto"
          >
            <FaBars className="text-sm text-gray-300" />
          </button>
        </div>
        
        {/* User info for mobile menu */}
        {user && !isCollapsed && (
          <div className="md:hidden p-4 border-b border-gray-700 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <FaUserCircle className="text-xl text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-white">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* User info for desktop when not collapsed */}
        {user && !isCollapsed && (
          <div className="hidden md:block p-4 border-b border-gray-700 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <FaUserCircle className="text-xl text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* User avatar for collapsed state */}
        {user && isCollapsed && (
          <div className="hidden md:flex justify-center py-4 border-b border-gray-700 dark:border-gray-700">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
              <FaUserCircle className="text-lg text-white" />
            </div>
          </div>
        )}
        
        <nav className="mt-4 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              <span className={`text-lg ${isCollapsed ? '' : 'mr-3'}`}>{item.icon}</span>
              {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
          
          {/* Theme Toggle Button in Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden px-4 py-2 mt-4 border-t border-gray-700 dark:border-gray-700">
              <button
                onClick={handleThemeToggle}
                className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-200 space-x-3"
              >
                {theme === 'light' ? <FaMoon className="text-lg" /> : <FaSun className="text-lg" />}
                <span className="text-sm font-medium">
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </button>
            </div>
          )}
        </nav>
        
        {/* Logout at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 dark:border-gray-700 bg-gray-800 dark:bg-gray-900">
          {/* Theme Toggle for Desktop (when not collapsed) */}
          {!isCollapsed && !isMobileMenuOpen && (
            <button
              onClick={handleThemeToggle}
              className="flex items-center w-full px-4 py-3 mb-2 text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-200 space-x-3 group"
            >
              {theme === 'light' ? <FaMoon className="text-lg" /> : <FaSun className="text-lg" />}
              <span className="text-sm font-medium">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </button>
          )}
          
          {/* Theme Toggle for Collapsed State */}
          {isCollapsed && (
            <button
              onClick={handleThemeToggle}
              className="flex items-center justify-center w-full px-4 py-3 mb-2 text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-200 group relative"
            >
              {theme === 'light' ? <FaMoon className="text-lg" /> : <FaSun className="text-lg" />}
              
              {/* Tooltip for collapsed state */}
              <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </div>
            </button>
          )}
          
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-4 py-3 text-gray-300 hover:bg-red-600 dark:hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 group ${
              isCollapsed ? 'justify-center' : 'space-x-3'
            }`}
          >
            <FaSignOutAlt className="text-lg" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;