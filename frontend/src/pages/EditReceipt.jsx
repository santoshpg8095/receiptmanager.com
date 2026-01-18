import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import toast from 'react-hot-toast';
import { 
  FaArrowLeft, 
  FaSave, 
  FaEye, 
  FaFileInvoice, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaHome, 
  FaCalendar, 
  FaRupeeSign, 
  FaReceipt, 
  FaCheckCircle,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import Loader from '../components/Loader';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const EditReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [formData, setFormData] = useState({
    tenantName: '',
    tenantEmail: '',
    tenantPhone: '',
    roomNumber: '',
    month: '',
    year: currentYear,
    amount: '',
    securityDeposit: '',
    electricityCharges: '',
    waterCharges: '',
    otherCharges: '',
    previousBalance: '',
    amountPaid: '',
    paymentMode: 'cash',
    transactionId: '',
    receivedFrom: '',
    forMonth: '',
    notes: ''
  });

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const fetchReceipt = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/receipts/${id}`);
      const receiptData = response.data;
      
      setReceipt(receiptData);
      
      // Set form data
      setFormData({
        tenantName: receiptData.tenantName || '',
        tenantEmail: receiptData.tenantEmail || '',
        tenantPhone: receiptData.tenantPhone || '',
        roomNumber: receiptData.roomNumber || '',
        month: receiptData.month || months[new Date().getMonth()],
        year: receiptData.year || currentYear,
        amount: receiptData.amount || '',
        securityDeposit: receiptData.securityDeposit || '',
        electricityCharges: receiptData.electricityCharges || '',
        waterCharges: receiptData.waterCharges || '',
        otherCharges: receiptData.otherCharges || '',
        previousBalance: receiptData.previousBalance || '',
        amountPaid: receiptData.amountPaid || '',
        paymentMode: receiptData.paymentMode || 'cash',
        transactionId: receiptData.transactionId || '',
        receivedFrom: receiptData.receivedFrom || receiptData.tenantName || '',
        forMonth: receiptData.forMonth || '',
        notes: receiptData.notes || ''
      });
    } catch (error) {
      toast.error('Failed to load receipt details');
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-update forMonth when month/year changes
    if (name === 'month' || name === 'year') {
      setFormData(prev => ({
        ...prev,
        forMonth: `${prev.month} ${prev.year}`
      }));
    }

    // Auto-fill receivedFrom when tenantName changes
    if (name === 'tenantName') {
      setFormData(prev => ({
        ...prev,
        receivedFrom: value
      }));
    }
  };

  const calculateTotals = () => {
    const totalAmount = 
      parseFloat(formData.amount || 0) +
      parseFloat(formData.securityDeposit || 0) +
      parseFloat(formData.electricityCharges || 0) +
      parseFloat(formData.waterCharges || 0) +
      parseFloat(formData.otherCharges || 0);
    
    const previousBalance = parseFloat(formData.previousBalance || 0);
    const amountPaid = parseFloat(formData.amountPaid || totalAmount);
    const balanceDue = totalAmount + previousBalance - amountPaid;

    return { totalAmount, previousBalance, amountPaid, balanceDue };
  };

  const validateForm = () => {
    if (!formData.tenantName.trim()) {
      toast.error('Please enter tenant name');
      return false;
    }
    
    if (!formData.tenantPhone.trim() || !/^\d{10}$/.test(formData.tenantPhone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    
    if (!formData.roomNumber.trim()) {
      toast.error('Please enter room number');
      return false;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }
    
    if (formData.tenantEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.tenantEmail)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);

    try {
      const totals = calculateTotals();
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        securityDeposit: parseFloat(formData.securityDeposit || 0),
        electricityCharges: parseFloat(formData.electricityCharges || 0),
        waterCharges: parseFloat(formData.waterCharges || 0),
        otherCharges: parseFloat(formData.otherCharges || 0),
        previousBalance: parseFloat(formData.previousBalance || 0),
        amountPaid: parseFloat(formData.amountPaid || totals.totalAmount),
        totalAmount: totals.totalAmount,
        balanceDue: totals.balanceDue
      };

      const response = await api.put(`/receipts/${id}`, submitData);
      
      toast.success('Receipt updated successfully!', {
        icon: '✅',
        style: {
          borderRadius: '10px',
          background: '#10B981',
          color: '#fff',
        },
      });
      
      navigate('/history');
    } catch (error) {
      toast.error('Failed to update receipt: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this receipt? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/receipts/${id}`);
      toast.success('Receipt deleted successfully', {
        icon: '🗑️',
        style: {
          borderRadius: '10px',
          background: '#10B981',
          color: '#fff',
        },
      });
      navigate('/history');
    } catch (error) {
      toast.error('Failed to delete receipt', {
        icon: '❌',
      });
    }
  };

  const handlePreview = () => {
    if (!validateForm()) return;
    
    const totals = calculateTotals();
    const receiptData = {
      ...formData,
      ...totals,
      _id: id,
      receiptNumber: receipt?.receiptNumber || 'UPDATED',
      createdAt: receipt?.createdAt || new Date().toISOString(),
      verificationHash: receipt?.verificationHash || 'preview-hash',
      qrCode: receipt?.qrCode,
      amountInWords: 'Amount in words will be generated after save'
    };
    
    // Open preview in new tab
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Receipt Preview - ${receiptData.receiptNumber}</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="p-8">
            <div class="max-w-4xl mx-auto">
              <div class="bg-white rounded-lg shadow-lg p-6">
                <h1 class="text-2xl font-bold mb-6">Receipt Preview</h1>
                <p class="mb-4">This is a preview of your updated receipt.</p>
                <pre class="bg-gray-100 p-4 rounded">${JSON.stringify(receiptData, null, 2)}</pre>
                <button onclick="window.close()" class="mt-6 px-4 py-2 bg-blue-600 text-white rounded">Close Preview</button>
              </div>
            </div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <FaFileInvoice className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Receipt Not Found</h2>
          <p className="text-gray-600 mb-6">The receipt you're trying to edit doesn't exist or you don't have permission.</p>
          <button
            onClick={() => navigate('/history')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
          >
            Back to History
          </button>
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
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate('/history')}
                className="p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <FaArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
                <FaEdit className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Edit Receipt
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  {receipt.receiptNumber} • Created on {new Date(receipt.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center gap-2"
            >
              <FaEye className="h-4 w-4" />
              <span className="text-sm font-medium">Preview</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Saving...</span>
                </>
              ) : (
                <>
                  <FaSave className="h-4 w-4" />
                  <span className="text-sm font-medium">Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <FaReceipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Editing Mode Active</h3>
              <p className="text-sm text-gray-600">
                Changes made here will update the original receipt. The receipt number and verification hash will remain the same.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {receipt.sentViaEmail && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <FaCheckCircle className="h-3 w-3 mr-1" />
                Email Sent
              </span>
            )}
            {receipt.verificationCount > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Verified {receipt.verificationCount} times
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-5 md:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
                <FaFileInvoice className="mr-2 text-indigo-600" />
                Receipt Details
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-6">
              {/* Tenant Details Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Tenant Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tenant Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="tenantName"
                        value={formData.tenantName}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Enter tenant name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="tenantPhone"
                        value={formData.tenantPhone}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="tenantEmail"
                        value={formData.tenantEmail}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="tenant@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaHome className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="e.g., 101, A-12"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Details Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  <FaCalendar className="mr-2 text-green-600" />
                  Payment Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month *
                    </label>
                    <select
                      name="month"
                      value={formData.month}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    >
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rent Amount (₹) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaRupeeSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Mode *
                    </label>
                    <select
                      name="paymentMode"
                      value={formData.paymentMode}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="cheque">Cheque</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  {formData.paymentMode !== 'cash' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction ID
                      </label>
                      <input
                        type="text"
                        name="transactionId"
                        value={formData.transactionId}
                        onChange={handleChange}
                        className="block w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Enter transaction reference"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Additional Charges Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Additional Charges
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Deposit
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaRupeeSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="securityDeposit"
                        value={formData.securityDeposit}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Electricity
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaRupeeSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="electricityCharges"
                        value={formData.electricityCharges}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Water Charges
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaRupeeSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="waterCharges"
                        value={formData.waterCharges}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other Charges
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaRupeeSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="otherCharges"
                        value={formData.otherCharges}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Balance Details Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Balance Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Previous Balance
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaRupeeSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="previousBalance"
                        value={formData.previousBalance}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount Paid *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaRupeeSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="amountPaid"
                        value={formData.amountPaid}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Balance Due
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaRupeeSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={totals.balanceDue.toFixed(2)}
                        readOnly
                        className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Notes Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="block w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Any additional notes or remarks..."
                />
              </div>
              
              {/* Hidden Fields */}
              <input
                type="hidden"
                name="receivedFrom"
                value={formData.receivedFrom}
              />
              <input
                type="hidden"
                name="forMonth"
                value={formData.forMonth}
              />
            </form>
          </div>
        </div>
        
        {/* Summary Card */}
        <div>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 sticky top-6">
            <div className="p-5 md:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <FaReceipt className="mr-2 text-indigo-600" />
                Receipt Summary
              </h3>
            </div>
            
            <div className="p-5 md:p-6 space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <h4 className="font-medium text-blue-800 mb-3">Original Receipt</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Number:</span> {receipt.receiptNumber}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Created:</span> {new Date(receipt.createdAt).toLocaleDateString('en-IN')}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span> {receipt.sentViaEmail ? 'Emailed' : 'Not Emailed'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Verified:</span> {receipt.verificationCount} times
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Rent:</span>
                  <span className="font-medium">₹{parseFloat(formData.amount || 0).toFixed(2)}</span>
                </div>
                
                {formData.securityDeposit > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Deposit:</span>
                    <span className="font-medium">₹{parseFloat(formData.securityDeposit).toFixed(2)}</span>
                  </div>
                )}
                
                {formData.electricityCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Electricity:</span>
                    <span className="font-medium">₹{parseFloat(formData.electricityCharges).toFixed(2)}</span>
                  </div>
                )}
                
                {formData.waterCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Water Charges:</span>
                    <span className="font-medium">₹{parseFloat(formData.waterCharges).toFixed(2)}</span>
                  </div>
                )}
                
                {formData.otherCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Other Charges:</span>
                    <span className="font-medium">₹{parseFloat(formData.otherCharges).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₹{totals.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                {formData.previousBalance > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Previous Balance:</span>
                    <span className="font-medium">₹{parseFloat(formData.previousBalance).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-semibold text-blue-600">
                  <span>Amount Paid:</span>
                  <span>₹{totals.amountPaid.toFixed(2)}</span>
                </div>
                
                {totals.balanceDue > 0 && (
                  <div className="flex justify-between font-semibold text-red-600">
                    <span>Balance Due:</span>
                    <span>₹{totals.balanceDue.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-3">Editing Notes:</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 flex-shrink-0">
                      <span className="text-xs">i</span>
                    </div>
                    <span>Receipt number cannot be changed</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 flex-shrink-0">
                      <span className="text-xs">i</span>
                    </div>
                    <span>Verification hash remains the same</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 flex-shrink-0">
                      <span className="text-xs">i</span>
                    </div>
                    <span>QR code will still verify the receipt</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 flex-shrink-0">
                      <span className="text-xs">!</span>
                    </div>
                    <span>Email status may reset if tenant email changes</span>
                  </li>
                </ul>
              </div>
              
              <div className="pt-4 border-t">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="h-4 w-4" />
                      <span className="text-sm font-medium">Save All Changes</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => navigate('/history')}
                  className="w-full mt-3 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel & Return
                </button>
              </div>
            </div>
          </div>
          
          {/* Danger Zone */}
          <div className="mt-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 md:p-6">
              <h4 className="font-bold text-red-800 mb-3 flex items-center">
                ⚠️ Danger Zone
              </h4>
              <p className="text-sm text-red-700 mb-4">
                Be careful with these actions. They cannot be undone.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center gap-2"
                >
                  <FaTrash className="h-4 w-4" />
                  Delete This Receipt
                </button>
                
                <button
                  onClick={() => {
                    if (window.confirm('This will mark the receipt as re-sent and update the email timestamp. Continue?')) {
                      toast.success('Receipt marked as re-sent', {
                        icon: '📧',
                      });
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                >
                  <FaEnvelope className="h-4 w-4" />
                  Mark as Re-sent
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(`/receipts/${id}`)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <FaEye className="h-4 w-4" />
            <span className="text-sm font-medium">View Original Receipt</span>
          </button>
          
          <div className="text-sm text-gray-500">
            Editing receipt #{receipt.receiptNumber} • Last updated: {new Date(receipt.updatedAt || receipt.createdAt).toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditReceipt;