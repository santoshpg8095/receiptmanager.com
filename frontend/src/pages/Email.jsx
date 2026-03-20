import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import toast from 'react-hot-toast';
import { FaEnvelope, FaPaperPlane, FaSearch, FaCheckCircle, FaTimesCircle, FaUsers, FaFilePdf, FaFilter, FaChartLine, FaCalendar, FaCog, FaMailBulk, FaUserEdit, FaHistory, FaPercent, FaRocket, FaBell, FaEye, FaRegClock } from 'react-icons/fa';
import Loader from '../components/Loader';

const Email = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipts, setSelectedReceipts] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
    recipientEmail: ''
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const [emailStats, setEmailStats] = useState({
    delivered: 0,
    opened: 0,
    clicked: 0
  });

  useEffect(() => {
    fetchReceipts();
    fetchEmailStats();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/receipts?limit=100');
      setReceipts(response.data.receipts || []);
    } catch (error) {
      toast.error('Failed to load receipts', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#EF4444',
          color: '#fff',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailStats = async () => {
    try {
      const response = await api.get('/email/stats');
      setEmailStats(response.data);
    } catch (error) {
      // Silently fail, use default stats
    }
  };

  const handleSelectReceipt = (receiptId) => {
    const newSelected = new Set(selectedReceipts);
    if (newSelected.has(receiptId)) {
      newSelected.delete(receiptId);
    } else {
      newSelected.add(receiptId);
    }
    setSelectedReceipts(newSelected);
  };

  const handleSelectAll = () => {
    const filtered = getFilteredReceipts();
    if (selectedReceipts.size === filtered.length) {
      setSelectedReceipts(new Set());
    } else {
      const allIds = filtered.map(r => r._id);
      setSelectedReceipts(new Set(allIds));
    }
  };

  const handleSendEmail = async (receiptId, email = null) => {
    setSending(true);
    try {
      const receipt = receipts.find(r => r._id === receiptId);
      await api.post('/email/send', {
        receiptId,
        recipientEmail: email || receipt.tenantEmail,
        subject: emailForm.subject || `Payment Receipt ${receipt.receiptNumber} - ${user.pgName}`,
        message: emailForm.message || `Dear ${receipt.tenantName},\n\nPlease find attached your payment receipt for ${receipt.forMonth}.\n\nThank you for your payment.\n\n${user.emailSignature || ''}`
      });
      
      toast.success('Email sent successfully!', {
        icon: '✉️',
        style: {
          borderRadius: '10px',
          background: '#10B981',
          color: '#fff',
        },
      });
      
      setReceipts(prev => prev.map(r => 
        r._id === receiptId ? { ...r, sentViaEmail: true, emailSentAt: new Date() } : r
      ));
    } catch (error) {
      toast.error('Failed to send email', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#EF4444',
          color: '#fff',
        },
      });
    } finally {
      setSending(false);
    }
  };

  const handleBulkSend = async () => {
    if (selectedReceipts.size === 0) {
      toast.error('Please select at least one receipt', {
        icon: '⚠️',
      });
      return;
    }

    setSending(true);
    try {
      const receiptIds = Array.from(selectedReceipts);
      await api.post('/email/bulk', {
        receiptIds,
        customMessage: emailForm.message
      });
      
      toast.success(`Sent ${selectedReceipts.size} emails successfully!`, {
        icon: '🚀',
        style: {
          borderRadius: '10px',
          background: '#3B82F6',
          color: '#fff',
        },
      });
      
      setReceipts(prev => prev.map(r => 
        selectedReceipts.has(r._id) ? { ...r, sentViaEmail: true, emailSentAt: new Date() } : r
      ));
      
      setSelectedReceipts(new Set());
    } catch (error) {
      toast.error('Failed to send bulk emails', {
        icon: '❌',
      });
    } finally {
      setSending(false);
    }
  };

  const handleResendAll = async () => {
    const unsentReceipts = receipts.filter(r => !r.sentViaEmail && r.tenantEmail);
    if (unsentReceipts.length === 0) {
      toast.error('All receipts have been emailed already', {
        icon: 'ℹ️',
      });
      return;
    }

    if (!window.confirm(`Resend ${unsentReceipts.length} unsent receipts?`)) {
      return;
    }

    setSending(true);
    try {
      const receiptIds = unsentReceipts.map(r => r._id);
      await api.post('/email/bulk', {
        receiptIds,
        customMessage: emailForm.message
      });
      
      toast.success(`Resent ${unsentReceipts.length} emails successfully!`, {
        icon: '🔄',
        style: {
          borderRadius: '10px',
          background: '#8B5CF6',
          color: '#fff',
        },
      });
      
      setReceipts(prev => prev.map(r => 
        receiptIds.includes(r._id) ? { ...r, sentViaEmail: true, emailSentAt: new Date() } : r
      ));
    } catch (error) {
      toast.error('Failed to resend emails', {
        icon: '❌',
      });
    } finally {
      setSending(false);
    }
  };

  const getFilteredReceipts = () => {
    let filtered = receipts.filter(receipt => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        receipt.tenantName.toLowerCase().includes(term) ||
        receipt.receiptNumber.toLowerCase().includes(term) ||
        receipt.tenantEmail?.toLowerCase().includes(term) ||
        receipt.tenantPhone.includes(term)
      );
    });

    switch (activeFilter) {
      case 'sent':
        return filtered.filter(r => r.sentViaEmail);
      case 'pending':
        return filtered.filter(r => !r.sentViaEmail && r.tenantEmail);
      case 'no-email':
        return filtered.filter(r => !r.tenantEmail);
      default:
        return filtered;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateEmailStats = () => {
    const total = receipts.length;
    const sent = receipts.filter(r => r.sentViaEmail).length;
    const pending = receipts.filter(r => !r.sentViaEmail && r.tenantEmail).length;
    const noEmail = receipts.filter(r => !r.tenantEmail).length;
    const successRate = total > 0 ? (sent / total) * 100 : 0;

    return { total, sent, pending, noEmail, successRate };
  };

  const filteredReceipts = getFilteredReceipts();
  const stats = calculateEmailStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6 lg:p-8 transition-colors duration-300">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <FaEnvelope className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Email Manager
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Send and manage receipt emails to tenants</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2">
              <FaCog className="text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-md">
              <FaBell className="h-4 w-4" />
              <span className="text-sm font-medium">Alerts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {[
          {
            title: 'Total Receipts',
            value: stats.total,
            icon: FaFilePdf,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-gradient-to-br',
            trend: '+12%',
            trendColor: 'text-emerald-600 dark:text-emerald-400'
          },
          {
            title: 'Emails Sent',
            value: stats.sent,
            icon: FaPaperPlane,
            color: 'from-emerald-500 to-green-500',
            bgColor: 'bg-gradient-to-br',
            percentage: `${stats.successRate.toFixed(1)}%`,
            percentageColor: 'text-emerald-600 dark:text-emerald-400'
          },
          {
            title: 'Pending',
            value: stats.pending,
            icon: FaRegClock,
            color: 'from-amber-500 to-orange-500',
            bgColor: 'bg-gradient-to-br',
            description: 'Need attention'
          },
          {
            title: 'No Email',
            value: stats.noEmail,
            icon: FaUsers,
            color: 'from-rose-500 to-pink-500',
            bgColor: 'bg-gradient-to-br',
            description: 'Add email to send'
          }
        ].map((stat, index) => (
          <div key={index} className={`${stat.bgColor} ${stat.color} text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 md:p-6`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm opacity-90 mb-1">{stat.title}</p>
                <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
            </div>
            <div className="pt-4 border-t border-white/20">
              {stat.trend && (
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">{stat.trend} this month</span>
                  <span className={`text-sm font-medium ${stat.trendColor}`}>{stat.trend}</span>
                </div>
              )}
              {stat.percentage && (
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Success rate</span>
                  <span className={`text-sm font-medium ${stat.percentageColor}`}>{stat.percentage}</span>
                </div>
              )}
              {stat.description && (
                <span className="text-sm opacity-90">{stat.description}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Email Template & Bulk Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
        {/* Email Template */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <FaEnvelope className="mr-2 text-blue-600 dark:text-blue-400" />
              Email Template
            </h3>
          </div>
          <div className="p-5 md:p-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Subject Template
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={`Payment Receipt - ${user.pgName}`}
                  />
                  <div className="absolute right-3 top-3">
                    <FaCog className="text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Message Template
                </label>
                <div className="relative">
                  <textarea
                    value={emailForm.message}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                    rows="5"
                    className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={`Dear {tenantName},\n\nPlease find attached your payment receipt for {month}.\n\nThank you for your payment.\n\n${user.emailSignature || 'Best regards,'}`}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">{"{tenantName}"}</span>
                    <span className="text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">{"{month}"}</span>
                    <span className="text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded">{"{amount}"}</span>
                    <span className="text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded">{"{room}"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <FaMailBulk className="mr-2 text-purple-600 dark:text-purple-400" />
              Bulk Actions
            </h3>
          </div>
          <div className="p-5 md:p-6">
            <div className="space-y-4">
              <button
                onClick={handleBulkSend}
                disabled={sending || selectedReceipts.size === 0}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all ${
                  selectedReceipts.size === 0
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                <FaPaperPlane className="mr-2" />
                {sending ? 'Sending...' : `Send Selected (${selectedReceipts.size})`}
              </button>
              
              <button
                onClick={handleResendAll}
                disabled={sending || stats.pending === 0}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all ${
                  stats.pending === 0
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                <FaEnvelope className="mr-2" />
                Resend All Unsent ({stats.pending})
              </button>
              
              <button
                onClick={handleSelectAll}
                className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                {selectedReceipts.size === filteredReceipts.length ? 'Deselect All' : 'Select All'}
              </button>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick Filters</p>
                <div className="flex flex-wrap gap-2">
                  {['all', 'sent', 'pending', 'no-email'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        activeFilter === filter
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 md:mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Search by tenant name, email, receipt number..."
                />
              </div>
              
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                  <FaFilter className="h-4 w-4" />
                  <span className="text-sm font-medium">Filters</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md">
                  <FaUserEdit className="h-4 w-4" />
                  <span className="text-sm font-medium">Update Emails</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 mb-6 md:mb-8">
        <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Receipts List</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Showing {filteredReceipts.length} of {receipts.length} receipts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium text-green-600 dark:text-green-400">{stats.sent}</span> sent •{' '}
                <span className="font-medium text-amber-600 dark:text-amber-400">{stats.pending}</span> pending •{' '}
                <span className="font-medium text-rose-600 dark:text-rose-400">{stats.noEmail}</span> no email
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="text-center">
              <Loader size="large" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading receipts...</p>
            </div>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
              <FaEnvelope className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No matching receipts' : 'No receipts yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              {searchTerm 
                ? 'Try adjusting your search or filters to find what you\'re looking for'
                : 'Create receipts to start sending emails to your tenants'
              }
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
            >
              {searchTerm ? 'Clear Search' : 'Create First Receipt'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedReceipts.size === filteredReceipts.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:bg-gray-600"
                    />
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Receipt Details</th>
                  <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Tenant Information</th>
                  <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Payment</th>
                  <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Email Status</th>
                  <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Actions</th>
                 </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((receipt) => (
                  <tr 
                    key={receipt._id} 
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors duration-150 group"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedReceipts.has(receipt._id)}
                        onChange={() => handleSelectReceipt(receipt._id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:bg-gray-600"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center mr-3">
                          <FaFilePdf className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">{receipt.receiptNumber}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <FaCalendar className="inline mr-1" />
                            {formatDate(receipt.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{receipt.tenantName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{receipt.tenantPhone}</p>
                        {receipt.tenantEmail ? (
                          <p className="text-sm text-blue-600 dark:text-blue-400 truncate max-w-xs">{receipt.tenantEmail}</p>
                        ) : (
                          <p className="text-sm text-rose-600 dark:text-rose-400">No email provided</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-green-600 dark:text-green-400 text-sm">
                          ₹{receipt.amountPaid?.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded inline-block mt-1">
                          {receipt.forMonth}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      {receipt.sentViaEmail ? (
                        <div className="flex items-center">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                            <FaCheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <span className="text-green-700 dark:text-green-400 font-medium text-sm">Sent</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {receipt.emailSentAt ? formatDate(receipt.emailSentAt) : ''}
                            </p>
                          </div>
                        </div>
                      ) : receipt.tenantEmail ? (
                        <div className="flex items-center">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg mr-3">
                            <FaRegClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <span className="text-amber-700 dark:text-amber-400 font-medium text-sm">Pending</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg mr-3">
                            <FaTimesCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                          </div>
                          <span className="text-rose-700 dark:text-rose-400 font-medium text-sm">No Email</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {receipt.tenantEmail && (
                          <button
                            onClick={() => handleSendEmail(receipt._id)}
                            disabled={sending || receipt.sentViaEmail}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                              receipt.sentViaEmail
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            <FaPaperPlane className="h-3 w-3" />
                            {receipt.sentViaEmail ? 'Sent' : 'Send'}
                          </button>
                        )}
                        
                        {!receipt.tenantEmail && (
                          <button
                            onClick={() => {
                              const email = prompt('Enter email address for tenant:');
                              if (email && email.includes('@')) {
                                handleSendEmail(receipt._id, email);
                              } else if (email) {
                                toast.error('Please enter a valid email address');
                              }
                            }}
                            disabled={sending}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all text-xs font-medium flex items-center gap-1"
                          >
                            <FaUserEdit className="h-3 w-3" />
                            Add & Send
                          </button>
                        )}
                        
                        <button
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-xs font-medium flex items-center gap-1"
                          title="View Details"
                        >
                          <FaEye className="h-3 w-3" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Insights & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Email Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <FaChartLine className="mr-2 text-blue-600 dark:text-blue-400" />
              Email Performance
            </h3>
          </div>
          <div className="p-5 md:p-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate.toFixed(1)}%</p>
                </div>
                <div className="w-24 h-24 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.successRate.toFixed(0)}%</span>
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      strokeDasharray={`${stats.successRate}, 100`}
                    />
                  </svg>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Opened Rate</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{emailStats.opened}%</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Clicked Rate</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{emailStats.clicked}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <FaRocket className="mr-2 text-purple-600 dark:text-purple-400" />
              Best Practices
            </h3>
          </div>
          <div className="p-5 md:p-6">
            <ul className="space-y-4">
              {[
                { icon: FaCheckCircle, text: 'Send receipts within 1 hour of payment', color: 'text-green-500' },
                { icon: FaCheckCircle, text: 'Use personalized subject lines', color: 'text-blue-500' },
                { icon: FaCheckCircle, text: 'Follow up on unopened emails', color: 'text-amber-500' },
                { icon: FaCheckCircle, text: 'Collect tenant emails during registration', color: 'text-purple-500' },
                { icon: FaCheckCircle, text: 'Schedule bulk sends during business hours', color: 'text-emerald-500' }
              ].map((tip, index) => (
                <li key={index} className="flex items-start">
                  <div className={`p-1.5 rounded-md bg-${tip.color.replace('text-', '')} bg-opacity-10 dark:bg-opacity-20 mr-3 mt-0.5`}>
                    <tip.icon className={`h-4 w-4 ${tip.color}`} />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{tip.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Email manager last updated • {new Date().toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p className="mt-1">
            Need help with email delivery? 
            <a href="/help" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Email;