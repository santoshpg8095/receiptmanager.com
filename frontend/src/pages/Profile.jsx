import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import toast from 'react-hot-toast';
import { 
  FaUser, FaEnvelope, FaBuilding, FaMapMarkerAlt, FaPhone, 
  FaReceipt, FaSave, FaLock, FaEye, FaEyeSlash, FaChartLine, 
  FaCalendar, FaRupeeSign, FaKey, FaDatabase, FaTrash, 
  FaShieldAlt, FaFileExport, FaCog, FaBell, FaUserCircle, 
  FaQrcode, FaInfoCircle, FaCheckCircle, FaHistory,
  FaTimes, FaCheck, FaToggleOn, FaToggleOff
} from 'react-icons/fa';
import Loader from '../components/Loader';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pgName: '',
    pgAddress: '',
    pgContact: '',
    gstin: '',
    emailSignature: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        pgName: user.pgName || '',
        pgAddress: user.pgAddress || '',
        pgContact: user.pgContact || '',
        gstin: user.gstin || '',
        emailSignature: user.emailSignature || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setUserStats(response.data);
    } catch (error) {
      console.error('Failed to fetch user stats');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const profileData = {
      name: formData.name,
      email: formData.email,
      pgName: formData.pgName,
      pgAddress: formData.pgAddress,
      pgContact: formData.pgContact,
      gstin: formData.gstin || null,
      emailSignature: formData.emailSignature,
    };

    try {
      const result = await updateProfile(profileData);
      
      if (result.success) {
        toast.success('Profile updated successfully!', {
          icon: '✅',
          style: {
            borderRadius: '10px',
            background: '#10B981',
            color: '#fff',
          },
        });
      } else {
        toast.error(result.error || 'Failed to update profile', {
          icon: '❌',
        });
      }
    } catch (error) {
      toast.error('An error occurred while updating profile', {
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.currentPassword) {
      toast.error('Please enter your current password', {
        icon: '⚠️',
      });
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match', {
        icon: '⚠️',
      });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters', {
        icon: '⚠️',
      });
      return;
    }
    
    setLoading(true);

    try {
      const result = await updateProfile({
        password: formData.newPassword,
      });
      
      if (result.success) {
        toast.success('Password changed successfully!', {
          icon: '🔐',
          style: {
            borderRadius: '10px',
            background: '#10B981',
            color: '#fff',
          },
        });
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        toast.error(result.error || 'Failed to change password', {
          icon: '❌',
        });
      }
    } catch (error) {
      toast.error('An error occurred while changing password', {
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
        const toastId = toast.loading('Preparing your data export...');
        
        const response = await api.get('/profile/export', { 
            responseType: 'blob' 
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `pg-receipts-export-${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.dismiss(toastId);
        toast.success('Data exported successfully!', {
            icon: '📥',
            style: {
                borderRadius: '10px',
                background: '#3B82F6',
                color: '#fff',
            },
        });
    } catch (error) {
        toast.error('Export failed. Please try again.', {
            icon: '❌',
        });
    }
  };

  const handleEnableTwoFactor = async () => {
    try {
        const toastId = toast.loading('Setting up two-factor authentication...');
        
        const response = await api.post('/profile/enable-2fa');
        
        setTwoFactorEnabled(true);
        toast.dismiss(toastId);
        
        // Show QR code and backup codes in a modal
        toast.success('Two-factor authentication enabled!', {
            icon: '🔐',
            style: {
                borderRadius: '10px',
                background: '#8B5CF6',
                color: '#fff',
            },
            duration: 5000,
        });
        
        // Store backup codes securely (show to user)
        console.log('Backup codes:', response.data.backupCodes);
        
    } catch (error) {
        toast.error('Failed to enable two-factor authentication', {
            icon: '❌',
        });
    }
  };

  const handleDisableTwoFactor = async () => {
    try {
        const response = await api.post('/profile/disable-2fa');
        setTwoFactorEnabled(false);
        toast.success('Two-factor authentication disabled!', {
            icon: '🔓',
            style: {
                borderRadius: '10px',
                background: '#6B7280',
                color: '#fff',
            },
        });
    } catch (error) {
        toast.error('Failed to disable two-factor authentication', {
            icon: '❌',
        });
    }
  };

  const handleDeleteAccount = async () => {
    try {
        setLoading(true);
        
        // Ask for password confirmation
        const password = window.prompt('Please enter your password to confirm account deletion:');
        if (!password) {
            setLoading(false);
            setShowDeleteConfirm(false);
            return;
        }
        
        await api.delete('/profile/delete-account', {
            data: { password }
        });
        
        toast.success('Account deleted successfully. Redirecting...', {
            icon: '👋',
            style: {
                borderRadius: '10px',
                background: '#10B981',
                color: '#fff',
            },
            duration: 3000,
        });
        
        // Logout and redirect after delay
        setTimeout(() => {
            logout();
        }, 2000);
        
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete account', {
            icon: '❌',
        });
    } finally {
        setLoading(false);
        setShowDeleteConfirm(false);
    }
  };

  const validateGSTIN = (gstin) => {
    if (!gstin) return true;
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return regex.test(gstin);
  };

  const validatePhone = (phone) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phone);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-600 text-sm md:text-base mt-2">Manage your account and PG details</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-6">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <FaUserCircle className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <FaCheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h2>
                <p className="text-gray-600 mb-3">{user.email}</p>
                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                  user.role === 'admin' 
                    ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800' 
                    : 'bg-gradient-to-r from-green-100 to-emerald-200 text-green-800'
                }`}>
                  {user.role === 'admin' ? 'Administrator' : 'Staff'}
                </span>
              </div>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-center p-3 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <FaBuilding className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">PG Name</p>
                    <p className="font-bold text-gray-900">{user.pgName}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-emerald-50 rounded-xl">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                    <FaMapMarkerAlt className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-bold text-gray-900">{user.pgAddress}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <FaPhone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-bold text-gray-900">{user.pgContact}</p>
                  </div>
                </div>
                
                {user.gstin && (
                  <div className="flex items-center p-3 bg-amber-50 rounded-xl">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                      <FaReceipt className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">GSTIN</p>
                      <p className="font-bold text-gray-900 tracking-wide">{user.gstin}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Account Created</p>
                  <p className="font-bold text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <FaHistory className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Account Statistics</h3>
              <FaChartLine className="h-5 w-5 opacity-80" />
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <FaReceipt className="h-4 w-4" />
                  </div>
                  <span>Total Receipts</span>
                </div>
                <span className="text-lg font-bold">{userStats?.stats?.totalReceipts || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <FaCalendar className="h-4 w-4" />
                  </div>
                  <span>This Month</span>
                </div>
                <span className="text-lg font-bold">{userStats?.stats?.currentMonthReceipts || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-xl backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <FaRupeeSign className="h-4 w-4" />
                  </div>
                  <span>Total Revenue</span>
                </div>
                <span className="text-lg font-bold">
                  ₹{(userStats?.stats?.currentMonthAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <FaQrcode className="h-4 w-4" />
                  </div>
                  <span>Verified Receipts</span>
                </div>
                <span className="text-lg font-bold">{userStats?.stats?.totalReceipts || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tabs Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'profile', label: 'Profile Details', icon: FaUser },
              { id: 'password', label: 'Security', icon: FaKey },
              { id: 'settings', label: 'Settings', icon: FaCog },
              { id: 'danger', label: 'Advanced', icon: FaInfoCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Edit Profile Details
                </h3>
                <p className="text-gray-600 text-sm mt-1">Update your personal and PG information</p>
              </div>
              
              <form onSubmit={handleProfileSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      PG Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaBuilding className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="pgName"
                        value={formData.pgName}
                        onChange={handleChange}
                        required
                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Contact Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="pgContact"
                        value={formData.pgContact}
                        onChange={handleChange}
                        required
                        pattern="[6-9]{1}[0-9]{9}"
                        maxLength="10"
                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                    {!validatePhone(formData.pgContact) && formData.pgContact && (
                      <p className="mt-1 text-sm text-red-600">Please enter a valid 10-digit Indian phone number</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      PG Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        name="pgAddress"
                        value={formData.pgAddress}
                        onChange={handleChange}
                        required
                        rows="2"
                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleChange}
                      className={`block w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all uppercase tracking-wider ${
                        formData.gstin && !validateGSTIN(formData.gstin)
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      placeholder="22AAAAA0000A1Z5"
                    />
                    {formData.gstin && !validateGSTIN(formData.gstin) && (
                      <p className="mt-1 text-sm text-red-600">Please enter a valid GSTIN</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Email Signature
                    </label>
                    <textarea
                      name="emailSignature"
                      value={formData.emailSignature}
                      onChange={handleChange}
                      rows="2"
                      className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                      placeholder="Best regards,\n[Your Name]"
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !validatePhone(formData.pgContact) || (formData.gstin && !validateGSTIN(formData.gstin))}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaSave className="h-4 w-4" />
                    <span className="font-medium">{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <FaLock className="mr-2 text-green-600" />
                  Update Password
                </h3>
                <p className="text-gray-600 text-sm mt-1">Change your account password</p>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Current Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                        className="block w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showPassword ? (
                          <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      New Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        minLength="6"
                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl mb-6 border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                      <FaShieldAlt className="mr-2" />
                      Password Requirements
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm text-blue-700">
                        <FaCheckCircle className={`h-4 w-4 mr-2 ${
                          formData.newPassword.length >= 6 ? 'text-green-500' : 'text-gray-300'
                        }`} />
                        Minimum 6 characters
                      </li>
                      <li className="flex items-center text-sm text-blue-700">
                        <FaCheckCircle className={`h-4 w-4 mr-2 ${
                          formData.newPassword === formData.confirmPassword && formData.newPassword ? 'text-green-500' : 'text-gray-300'
                        }`} />
                        Passwords must match
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword || formData.newPassword.length < 6}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaLock className="h-4 w-4" />
                      <span className="font-medium">{loading ? 'Updating...' : 'Update Password'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Security Settings */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <FaShieldAlt className="mr-2 text-purple-600" />
                    Security Settings
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                          <FaShieldAlt className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                          <p className="text-xs text-purple-600 mt-1">
                            {twoFactorEnabled ? '✓ Currently enabled' : 'Currently disabled'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={twoFactorEnabled ? handleDisableTwoFactor : handleEnableTwoFactor}
                        className={`px-5 py-2.5 rounded-lg transition-all ${
                          twoFactorEnabled
                            ? 'bg-gradient-to-r from-gray-600 to-slate-600 text-white hover:from-gray-700 hover:to-slate-700'
                            : 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700'
                        }`}
                      >
                        {twoFactorEnabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <FaBell className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Login Notifications</p>
                          <p className="text-sm text-gray-600">Get alerts for new login attempts</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        style={{ backgroundColor: notificationsEnabled ? '#3b82f6' : '#d1d5db' }}
                      >
                        <span
                          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                            notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <FaDatabase className="mr-2 text-amber-600" />
                    Data Management
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mr-4">
                          <FaFileExport className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Export Data</p>
                          <p className="text-sm text-gray-600">Download all your receipts and data as CSV</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleExportData}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
                      >
                        Export
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mr-4">
                          <FaTrash className="h-6 w-6 text-rose-600" />
                        </div>
                        <div>
                          <p className="font-bold text-rose-900">Delete Account</p>
                          <p className="text-sm text-rose-700">Permanently delete your account and all data</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-5 py-2.5 border-2 border-rose-600 text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mr-4">
                  <FaTrash className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Account</h3>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="p-4 bg-rose-50 rounded-xl mb-6">
                <p className="text-rose-800 text-sm">
                  <strong>Warning:</strong> This will permanently delete your account, all receipts, 
                  and associated data. This action cannot be reversed.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-lg hover:from-rose-700 hover:to-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;