import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaReceipt, FaUserCircle, FaSignOutAlt, FaHome, FaBars, FaTimes, FaSun, FaMoon } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-bg-primary shadow-lg sticky top-0 z-40 border-b border-border-primary">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-accent-primary to-accent-tertiary p-2 rounded-lg">
              <FaReceipt className="text-text-primary text-2xl" />
            </div>
            <div>
              <span className="text-xl font-bold text-text-primary">PG Receipts</span>
              <p className="text-xs text-text-secondary">Professional Receipt Management</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <div className="flex items-center space-x-6">
                  <Link
                    to="/dashboard"
                    className="text-text-secondary hover:text-accent-primary font-medium transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/receipts"
                    className="text-text-secondary hover:text-accent-primary font-medium transition"
                  >
                    Receipts
                  </Link>
                  <Link
                    to="/history"
                    className="text-text-secondary hover:text-accent-primary font-medium transition"
                  >
                    History
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center text-text-secondary hover:text-accent-primary font-medium transition"
                  >
                    <FaUserCircle className="mr-2" />
                    {user.name}
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center w-10 h-10 bg-bg-secondary hover:bg-bg-surface dark:bg-bg-surface dark:hover:bg-bg-accent rounded-lg transition border border-border-primary"
                    aria-label="Toggle theme"
                  >
                    {theme === 'light' ? <FaMoon className="text-text-secondary" /> : <FaSun className="text-warning" />}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-error hover:bg-red-600 text-text-primary px-4 py-2 rounded-lg transition"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="text-text-secondary hover:text-accent-primary font-medium transition"
                >
                  Home
                </Link>
                <Link
                  to="/#features"
                  className="text-text-secondary hover:text-accent-primary font-medium transition"
                >
                  Features
                </Link>
                <Link
                  to="/#pricing"
                  className="text-text-secondary hover:text-accent-primary font-medium transition"
                >
                  Pricing
                </Link>
                <Link
                  to="/verify"
                  className="text-text-secondary hover:text-accent-primary font-medium transition"
                >
                  Verify Receipt
                </Link>
                <Link
                  to="/login"
                  className="text-accent-primary hover:text-accent-secondary font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-accent-primary to-accent-tertiary text-text-primary px-6 py-2 rounded-lg hover:shadow-lg transition font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-text-secondary hover:text-accent-primary"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border-primary bg-bg-primary">
            {user ? (
              <div className="space-y-4">
                <Link
                  to="/dashboard"
                  className="block text-text-secondary hover:text-accent-primary py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/receipts"
                  className="block text-text-secondary hover:text-accent-primary py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Receipts
                </Link>
                <Link
                  to="/history"
                  className="block text-text-secondary hover:text-accent-primary py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  History
                </Link>
                <Link
                  to="/profile"
                  className="block text-text-secondary hover:text-accent-primary py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
                  className="flex items-center space-x-2 text-text-secondary hover:text-accent-primary py-2 w-full text-left"
                >
                  {theme === 'light' ? <FaMoon /> : <FaSun />}
                  <span>Toggle Theme</span>
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-error hover:text-red-600 py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Link
                  to="/"
                  className="block text-text-secondary hover:text-accent-primary py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/#features"
                  className="block text-text-secondary hover:text-accent-primary py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  to="/#pricing"
                  className="block text-text-secondary hover:text-accent-primary py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  to="/verify"
                  className="block text-text-secondary hover:text-accent-primary py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Verify Receipt
                </Link>
                <div className="pt-4 space-y-3">
                  <Link
                    to="/login"
                    className="block text-center text-accent-primary hover:text-accent-secondary py-2 border border-accent-primary rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center bg-gradient-to-r from-accent-primary to-accent-tertiary text-text-primary py-2 rounded-lg hover:shadow-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;