import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaSpinner, FaArrowLeft, FaKey, FaShieldAlt, FaBell, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const ResetPassword = () => {
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const resetEmail = sessionStorage.getItem('resetEmail');
        if (resetEmail) {
            setEmail(resetEmail);
        } else {
            toast.error('Please request OTP first');
            navigate('/forgot-password');
        }
    }, [navigate]);

    const validateOTP = (otp) => {
        return /^\d{6}$/.test(otp);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        
        if (!validateOTP(otp)) {
            setErrors({ otp: 'Please enter a valid 6-digit OTP' });
            return;
        }

        setVerifying(true);
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/password-reset/verify-otp`,
                { email, otp }
            );

            if (response.data.success) {
                setOtpVerified(true);
                toast.success('OTP verified successfully!');
                setErrors({});
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            toast.error(error.response?.data?.message || 'Invalid or expired OTP');
            setErrors({ otp: error.response?.data?.message || 'Invalid OTP' });
        } finally {
            setVerifying(false);
        }
    };

    const validatePassword = () => {
        const newErrors = {};
        
        if (newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }
        
        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (!validatePassword()) {
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/password-reset/reset-password`,
                { email, otp, newPassword }
            );

            if (response.data.success) {
                toast.success('Password reset successful! Please login.');
                sessionStorage.removeItem('resetEmail');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            console.error('Password reset error:', error);
            toast.error(error.response?.data?.message || 'Failed to reset password');
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
                                <FaKey className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                                {otpVerified ? 'Set New Password' : 'Verify Your Identity'}
                            </h1>
                        </div>
                        
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                            {otpVerified 
                                ? 'Create a strong new password to secure your account.'
                                : `Enter the 6-digit OTP sent to your email address to verify your identity.`
                            }
                        </p>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <FaLock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Secure Password Reset</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">OTP ensures only you can reset your password</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <FaShieldAlt className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Strong Encryption</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Your new password is securely encrypted</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <FaCheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Instant Access</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Reset your password and login immediately</p>
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
                                <FaKey className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {otpVerified ? 'Reset Password' : 'Verify OTP'}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                {otpVerified 
                                    ? 'Set your new password below'
                                    : `Enter the 6-digit OTP sent to ${email}`
                                }
                            </p>
                        </div>

                        {!otpVerified ? (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Enter OTP
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                if (value.length <= 6) {
                                                    setOtp(value);
                                                    setErrors({});
                                                }
                                            }}
                                            maxLength="6"
                                            className={`block w-full px-4 py-3 text-center text-2xl tracking-widest border ${
                                                errors.otp ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                                            } rounded-xl focus:ring-2 focus:ring-offset-1 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                            placeholder="------"
                                            disabled={verifying}
                                        />
                                    </div>
                                    {errors.otp && (
                                        <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
                                    )}
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Enter the 6-digit OTP sent to your email
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={verifying || otp.length !== 6}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                >
                                    {verifying ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <FaSpinner className="animate-spin w-5 h-5" />
                                            Verifying OTP...
                                        </div>
                                    ) : (
                                        'Verify OTP'
                                    )}
                                </button>

                                <div className="text-center">
                                    <Link 
                                        to="/forgot-password" 
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                                    >
                                        <FaArrowLeft className="inline mr-2" />
                                        Resend OTP
                                    </Link>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value);
                                                setErrors({});
                                            }}
                                            className={`block w-full pl-10 pr-12 py-3 border ${
                                                errors.newPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                                            } rounded-xl focus:ring-2 focus:ring-offset-1 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                            placeholder="Enter new password"
                                            disabled={loading}
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
                                    {errors.newPassword && (
                                        <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaCheckCircle className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setErrors({});
                                            }}
                                            className={`block w-full pl-10 pr-12 py-3 border ${
                                                errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                                            } rounded-xl focus:ring-2 focus:ring-offset-1 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                            placeholder="Confirm new password"
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showConfirmPassword ? (
                                                <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !newPassword || !confirmPassword}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <FaSpinner className="animate-spin w-5 h-5" />
                                            Resetting Password...
                                        </div>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>

                                <div className="text-center">
                                    <Link to="/login" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                                        <FaArrowLeft className="inline mr-2" />
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
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

export default ResetPassword;