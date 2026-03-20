import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaReceipt, FaUserCircle, FaSignOutAlt, FaHome, FaBars, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <FaReceipt className="text-white text-2xl" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">PG Receipts</span>
              <p className="text-xs text-gray-500">Professional Receipt Management</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <div className="flex items-center space-x-6">
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600 font-medium transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/receipts"
                    className="text-gray-700 hover:text-blue-600 font-medium transition"
                  >
                    Receipts
                  </Link>
                  <Link
                    to="/history"
                    className="text-gray-700 hover:text-blue-600 font-medium transition"
                  >
                    History
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition"
                  >
                    <FaUserCircle className="mr-2" />
                    {user.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
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
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Home
                </Link>
                <Link
                  to="/#features"
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Features
                </Link>
                <Link
                  to="/#pricing"
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Pricing
                </Link>
                <Link
                  to="/verify"
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Verify Receipt
                </Link>
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {user ? (
              <div className="space-y-4">
                <Link
                  to="/dashboard"
                  className="block text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/receipts"
                  className="block text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Receipts
                </Link>
                <Link
                  to="/history"
                  className="block text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  History
                </Link>
                <Link
                  to="/profile"
                  className="block text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-red-600 hover:text-red-700 py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Link
                  to="/"
                  className="block text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/#features"
                  className="block text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  to="/verify"
                  className="block text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Verify Receipt
                </Link>
                <div className="pt-4 space-y-3">
                  <Link
                    to="/login"
                    className="block text-center text-blue-600 hover:text-blue-700 py-2 border border-blue-600 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:shadow-lg transition"
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