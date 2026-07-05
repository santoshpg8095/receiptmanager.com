import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaSpinner, FaShieldAlt, FaBell, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [emailError, setEmailError] = useState('');
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setEmailError('Email is required');
            return;
        }
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        setEmailError('');

        setLoading(true);
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/password-reset/request-reset`,
                { email }
            );

            if (response.data.success) {
                setOtpSent(true);
                toast.success('OTP sent to your email!');
                sessionStorage.setItem('resetEmail', email);
            }
        } catch (error) {
            console.error('Error requesting password reset:', error);
            toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/password-reset/request-reset`,
                { email }
            );

            if (response.data.success) {
                toast.success('New OTP sent to your email!');
            }
        } catch (error) {
            toast.error('Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Navbar />
            
            <div className="flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-80px)] py-8 px-4">
                {/* Left Side - Features */}
                <div className="lg:w-1/2 max-w-xl mb-8 lg:mb-0 lg:pr-12">
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl">
                                <FaEnvelope className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Password Recovery</h1>
                        </div>
                        
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                            {otpSent 
                                ? 'Check your email for the OTP code to reset your password securely.'
                                : 'Enter your registered email address and we\'ll send you a One-Time Password (OTP) to reset your password.'
                            }
                        </p>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <FaEnvelope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Secure OTP System</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">6-digit OTP valid for 15 minutes</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <FaCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Instant Delivery</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">OTP delivered via email instantly</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <FaShieldAlt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Encrypted Security</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Your password is securely encrypted</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="lg:w-1/2 max-w-xl w-full">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                                <FaEnvelope className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {otpSent ? 'Check Your Email' : 'Forgot Password'}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                {otpSent 
                                    ? `We've sent a 6-digit OTP to ${email}`
                                    : 'Enter your email and we\'ll send you an OTP to reset your password'
                                }
                            </p>
                        </div>

                        {!otpSent ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaEnvelope className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setEmailError('');
                                            }}
                                            className={`block w-full pl-10 pr-3 py-3 border ${
                                                emailError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                                            } rounded-xl focus:ring-2 focus:ring-offset-1 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                            placeholder="Enter your registered email"
                                            disabled={loading}
                                        />
                                    </div>
                                    {emailError && (
                                        <p className="mt-1 text-sm text-red-600">{emailError}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <FaSpinner className="animate-spin w-5 h-5" />
                                            Sending OTP...
                                        </div>
                                    ) : (
                                        'Send OTP'
                                    )}
                                </button>

                                <div className="text-center">
                                    <Link to="/login" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                                        <FaArrowLeft className="inline mr-2" />
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                                    <FaCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                    <p className="text-green-700 dark:text-green-300 font-medium">
                                        OTP sent successfully!
                                    </p>
                                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                                        Please check your email for the 6-digit OTP
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate('/reset-password')}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg transition-all duration-300"
                                >
                                    Verify OTP & Reset Password
                                </button>

                                <div className="text-center">
                                    <button
                                        onClick={handleResendOTP}
                                        disabled={loading}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium disabled:opacity-50"
                                    >
                                        {loading ? 'Sending...' : 'Resend OTP'}
                                    </button>
                                </div>

                                <div className="text-center">
                                    <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                                        <FaArrowLeft className="inline mr-2" />
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Mobile Stats */}
                        <div className="lg:hidden mt-8">
                            <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <FaShieldAlt className="w-4 h-4 text-green-500" />
                                    <span>Secure</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaBell className="w-4 h-4 text-blue-500" />
                                    <span>Instant</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaCheck className="w-4 h-4 text-green-500" />
                                    <span>Reliable</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;