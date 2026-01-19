import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaPhone, 
  FaReceipt, FaEye, FaEyeSlash, FaCheck, FaChevronRight, 
  FaShieldAlt, FaGem, FaQrcode, FaFileInvoice, FaChartLine, 
  FaBell 
} from 'react-icons/fa';
import { GiTakeMyMoney, GiHouse } from 'react-icons/gi';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

// Moved InputField outside the component to prevent re-renders
const InputField = React.memo(({ 
  label, 
  name, 
  type = 'text', 
  icon, 
  value,
  onChange,
  required = false, 
  placeholder,
  maxLength,
  className = '',
  error,
  ...props 
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          className={`
            block w-full pl-10 pr-3 py-3 border rounded-xl 
            focus:ring-2 focus:ring-offset-1 transition-all duration-200
            ${error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${className}
          `}
          placeholder={placeholder}
          autoComplete="off"
          {...props}
        />
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
            <FaEyeSlash className="w-4 h-4" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    pgName: '',
    pgAddress: '',
    pgContact: '',
    gstin: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Use useCallback for change handler to prevent re-renders
  const handleChange = React.useCallback((e) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user starts typing
    setFormErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) errors.name = 'Name is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
      
      if (!formData.password) errors.password = 'Password is required';
      else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
      
      if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm password';
      else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }
    
    if (step === 2) {
      if (!formData.pgName.trim()) errors.pgName = 'PG name is required';
      if (!formData.pgAddress.trim()) errors.pgAddress = 'PG address is required';
      
      if (!formData.pgContact) errors.pgContact = 'Contact number is required';
      else if (!/^\d{10}$/.test(formData.pgContact)) errors.pgContact = 'Enter a valid 10-digit number';
      
      // GSTIN validation (optional field)
      if (formData.gstin && formData.gstin.trim() !== '') {
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstinRegex.test(formData.gstin.toUpperCase())) {
          errors.gstin = 'Enter a valid GSTIN format (e.g., 22AAAAA0000A1Z5)';
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = (e) => {
    e?.preventDefault();
    if (validateStep(1)) {
      setCurrentStep(2);
    } else {
      // Show toast for errors on step 1
      toast.error('Please fix the errors before proceeding');
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(2)) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);

    // Remove confirmPassword from submission data
    const { confirmPassword, ...submitData } = formData;
    
    try {
      const result = await register(submitData);
      
      if (result.success) {
        toast.success('🎉 Registration successful! Welcome to PG Receipts');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />
      
      <div className="flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-80px)] py-8 px-4">
        {/* Left Side - Benefits & Info */}
        <div className="lg:w-1/2 max-w-xl mb-8 lg:mb-0 lg:pr-12">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl">
                <FaReceipt className="w-8 h-8" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">PG Receipt Manager</h1>
            </div>
            
            <p className="text-lg text-gray-600 mb-8">
              Streamline your PG management with professional receipts, automated tracking, and seamless tenant communication.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <GiTakeMyMoney className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Automated Receipts</h3>
                </div>
                <p className="text-sm text-gray-600">Generate professional receipts in seconds</p>
              </div>
              
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FaFileInvoice className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Digital Records</h3>
                </div>
                <p className="text-sm text-gray-600">Secure cloud storage for all receipts</p>
              </div>
              
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FaChartLine className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Analytics Dashboard</h3>
                </div>
                <p className="text-sm text-gray-600">Track payments and generate reports</p>
              </div>
              
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FaQrcode className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">QR Verification</h3>
                </div>
                <p className="text-sm text-gray-600">Secure digital verification system</p>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <FaCheck className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="w-4 h-4 text-green-500" />
                  <span>Free forever plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="w-4 h-4 text-green-500" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="lg:w-1/2 max-w-xl w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentStep === 1 ? 'Create Your Account' : 'PG Details'}
                </h2>
                <span className="text-sm text-gray-500">Step {currentStep} of 2</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: currentStep === 1 ? '50%' : '100%' }}
                ></div>
              </div>
              
              <div className="flex justify-between mt-2">
                <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                  Account Info
                </span>
                <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                  PG Setup
                </span>
              </div>
            </div>

            <form onSubmit={currentStep === 1 ? nextStep : handleSubmit}>
              {currentStep === 1 ? (
                <div className="space-y-6">
                  <InputField
                    label="Full Name"
                    name="name"
                    icon={<FaUser className="h-5 w-5 text-gray-400" />}
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    autoComplete="name"
                    error={formErrors.name}
                  />
                  
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    icon={<FaEnvelope className="h-5 w-5 text-gray-400" />}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="owner@example.com"
                    autoComplete="email"
                    error={formErrors.email}
                  />
                  
                  <div className="space-y-4">
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
                          className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-offset-1 transition-all duration-200 ${
                            formErrors.password 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          placeholder="Minimum 6 characters"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <FaEyeSlash className="h-5 w-5 text-gray-400" />
                          ) : (
                            <FaEye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {formErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-offset-1 transition-all duration-200 ${
                            formErrors.confirmPassword 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <FaEyeSlash className="h-5 w-5 text-gray-400" />
                          ) : (
                            <FaEye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                      I agree to the{' '}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Continue to PG Details
                    <FaChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <InputField
                    label="PG Name"
                    name="pgName"
                    icon={<GiHouse className="h-5 w-5 text-gray-400" />}
                    value={formData.pgName}
                    onChange={handleChange}
                    required
                    placeholder="Sunshine PG"
                    error={formErrors.pgName}
                  />
                  
                  <InputField
                    label="PG Address"
                    name="pgAddress"
                    icon={<FaMapMarkerAlt className="h-5 w-5 text-gray-400" />}
                    value={formData.pgAddress}
                    onChange={handleChange}
                    required
                    placeholder="Street, City, State, PIN"
                    error={formErrors.pgAddress}
                  />
                  
                  <InputField
                    label="Contact Number"
                    name="pgContact"
                    type="tel"
                    icon={<FaPhone className="h-5 w-5 text-gray-400" />}
                    value={formData.pgContact}
                    onChange={handleChange}
                    required
                    placeholder="9876543210"
                    maxLength={10}
                    inputMode="numeric"
                    error={formErrors.pgContact}
                  />
                  
                  <InputField
                    label="GSTIN (Optional)"
                    name="gstin"
                    icon={<FaGem className="h-5 w-5 text-gray-400" />}
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="22AAAAA0000A1Z5"
                    className="uppercase"
                    error={formErrors.gstin}
                  />
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
                    >
                      Back
                    </button>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Creating Account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in here
                </Link>
              </p>
            </div>
            
            {/* Mobile Benefits */}
            <div className="lg:hidden mt-8">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="w-4 h-4 text-green-500" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaBell className="w-4 h-4 text-green-500" />
                  <span>Free Plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="w-4 h-4 text-green-500" />
                  <span>Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;