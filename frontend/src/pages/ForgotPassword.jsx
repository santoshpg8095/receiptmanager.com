import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

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
        
        // Validate email
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
                `${process.env.REACT_APP_API_URL}/api/password-reset/request-reset`,
                { email }
            );

            if (response.data.success) {
                setOtpSent(true);
                toast.success('OTP sent to your email!');
                // Store email in sessionStorage for verification step
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
                `${process.env.REACT_APP_API_URL}/api/password-reset/request-reset`,
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Back to Login */}
                <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
                >
                    <FaArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
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
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                                <FaCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <p className="text-green-700 dark:text-green-300">
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;