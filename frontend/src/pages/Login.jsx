import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser, FaChartLine, FaQrcode, FaFileInvoice, FaCheck, FaArrowRight } from 'react-icons/fa';
import { GiTakeMyMoney } from 'react-icons/gi';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field
    setFormErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);

    // Remember me functionality
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', formData.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('🎉 Login successful! Welcome back');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed. Please check your credentials.');
    }
    
    setLoading(false);
  };

  // Load remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />
      
      <div className="flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-80px)] py-8 px-4">
        {/* Left Side - Welcome & Features */}
        <div className="lg:w-1/2 max-w-xl mb-8 lg:mb-0 lg:pr-12">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl">
                <FaUser className="w-8 h-8" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Welcome Back</h1>
            </div>
            
            <p className="text-lg text-gray-600 mb-8">
              Sign in to access your PG Receipt dashboard and manage all your receipts in one place.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GiTakeMyMoney className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Revenue Tracking</h3>
                  <p className="text-sm text-gray-600">Monitor all payments in real-time</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaFileInvoice className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quick Receipts</h3>
                  <p className="text-sm text-gray-600">Generate receipts in seconds</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaQrcode className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Secure Verification</h3>
                  <p className="text-sm text-gray-600">QR code verification system</p>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <FaCheck className="w-4 h-4 text-green-500" />
                  <span>500+ PG Owners Trust Us</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="w-4 h-4 text-green-500" />
                  <span>99.9% Uptime</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:w-1/2 max-w-xl w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Sign In to Your Account</h2>
              <p className="text-gray-600 mt-2">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      formErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-xl focus:ring-2 focus:ring-offset-1 transition-all duration-200`}
                    placeholder="owner@example.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`block w-full pl-10 pr-12 py-3 border ${
                      formErrors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-xl focus:ring-2 focus:ring-offset-1 transition-all duration-200`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-3 text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <FaArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    New to PG Receipts?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/register"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-blue-600 text-blue-600 font-medium rounded-xl hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                >
                  <FaUser className="w-4 h-4" />
                  Create new account
                </Link>
              </div>
            </div>          
            {/* Mobile Stats */}
            <div className="lg:hidden mt-8">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaChartLine className="w-4 h-4 text-blue-500" />
                  <span>500+ Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="w-4 h-4 text-green-500" />
                  <span>Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;