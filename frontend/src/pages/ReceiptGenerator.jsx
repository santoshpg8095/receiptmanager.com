import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import ReceiptPreview from '../components/ReceiptPreview';
import toast from 'react-hot-toast';
import { 
  FaSave, 
  FaPrint, 
  FaEnvelope, 
  FaCalendar, 
  FaUser, 
  FaPhone, 
  FaHome, 
  FaRupeeSign, 
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaMinus,
  FaCalculator,
  FaStickyNote,
  FaCreditCard,
  FaTimes
} from 'react-icons/fa';

// Move FormSection outside the main component
const FormSection = React.memo(({ 
  title, 
  icon, 
  sectionKey, 
  children, 
  isRequired = false,
  expandedSections,
  toggleSection 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="text-blue-600">{icon}</div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            {title}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </h3>
        </div>
        <div className="text-gray-500">
          {expandedSections[sectionKey] ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </button>
      
      <div className={`transition-all duration-300 ease-in-out ${
        expandedSections[sectionKey] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
});

FormSection.displayName = 'FormSection';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const ReceiptGenerator = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    tenant: true,
    payment: true,
    dates: false,
    charges: false,
    balance: false,
    notes: false
  });
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    tenantName: '',
    tenantEmail: '',
    tenantPhone: '',
    roomNumber: '',
    month: months[new Date().getMonth()],
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
    forMonth: `${months[new Date().getMonth()]} ${currentYear}`,
    notes: '',
    monthlyPaymentDate: today,
    paidDate: today
  });

  useEffect(() => {
    // Auto-calculate amountPaid if not set
    if (!formData.amountPaid && formData.amount) {
      const total = 
        parseFloat(formData.amount || 0) +
        parseFloat(formData.securityDeposit || 0) +
        parseFloat(formData.electricityCharges || 0) +
        parseFloat(formData.waterCharges || 0) +
        parseFloat(formData.otherCharges || 0);
      
      setFormData(prev => ({
        ...prev,
        amountPaid: total.toString(),
        receivedFrom: prev.receivedFrom || prev.tenantName
      }));
    }
  }, [formData.amount, formData.securityDeposit, formData.electricityCharges, formData.waterCharges, formData.otherCharges]);

  // Memoize toggleSection function
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Memoize handleChange function
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-update forMonth when month/year changes
      if (name === 'month' || name === 'year') {
        newData.forMonth = `${name === 'month' ? value : prev.month} ${name === 'year' ? value : prev.year}`;
      }
      
      // Auto-fill receivedFrom when tenantName changes
      if (name === 'tenantName') {
        newData.receivedFrom = value;
      }
      
      return newData;
    });
  }, []);

  const calculateTotals = useCallback(() => {
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
  }, [formData]);

  const validateForm = useCallback(() => {
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
    
    // Validate date fields
    if (!formData.monthlyPaymentDate) {
      toast.error('Please select monthly payment date');
      return false;
    }
    
    if (!formData.paidDate) {
      toast.error('Please select paid date');
      return false;
    }
    
    // Check if paid date is after monthly payment date
    if (new Date(formData.paidDate) < new Date(formData.monthlyPaymentDate)) {
      toast.error('Paid date cannot be before monthly payment date');
      return false;
    }
    
    return true;
  }, [formData]);

  const handlePreview = useCallback(() => {
    if (!validateForm()) return;
    
    const totals = calculateTotals();
    const receiptData = {
      ...formData,
      ...totals,
      _id: 'preview-' + Date.now(),
      receiptNumber: 'PREVIEW' + Date.now().toString().slice(-6),
      createdAt: new Date().toISOString(),
      verificationHash: 'preview-hash-' + Date.now(),
      qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlFSIENvZGU8L3RleHQ+PC9zdmc+',
      amountInWords: 'Preview Amount in Words',
      monthlyPaymentDate: formData.monthlyPaymentDate,
      paidDate: formData.paidDate
    };
    
    setGeneratedReceipt(receiptData);
    setPreviewMode(true);
  }, [formData, calculateTotals, validateForm]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
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
        monthlyPaymentDate: formData.monthlyPaymentDate,
        paidDate: formData.paidDate
      };

      const response = await api.post('/receipts', submitData);
      
      setGeneratedReceipt(response.data.receipt);
      toast.success('Receipt created successfully!');
      
      // Reset form
      setFormData({
        tenantName: '',
        tenantEmail: '',
        tenantPhone: '',
        roomNumber: '',
        month: months[new Date().getMonth()],
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
        forMonth: `${months[new Date().getMonth()]} ${currentYear}`,
        notes: '',
        monthlyPaymentDate: today,
        paidDate: today
      });
      
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to create receipt: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [formData, calculateTotals, validateForm, today]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleEmail = useCallback(async (receipt) => {
    try {
      await api.post('/email/send', {
        receiptId: receipt._id,
        recipientEmail: receipt.tenantEmail
      });
      toast.success('Receipt sent via email successfully!');
    } catch (error) {
      toast.error('Failed to send email');
    }
  }, []);

  const totals = calculateTotals();

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Generate Receipt</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Create a new payment receipt for your tenant</p>
      </div>

      {previewMode && generatedReceipt ? (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Receipt Preview</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPreviewMode(false)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
              >
                Back to Form
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                <FaPrint className="mr-2" />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm"
              >
                <FaSave className="mr-2" />
                {loading ? 'Saving...' : 'Save Receipt'}
              </button>
            </div>
          </div>
          
          <ReceiptPreview
            receipt={generatedReceipt}
            user={user}
            onPrint={handlePrint}
            onEmail={handleEmail}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              {/* Desktop View - Always Visible Sections */}
              <div className="hidden md:block">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Tenant Details */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b pb-2">
                      Tenant Details
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Tenant Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="tenantName"
                          value={formData.tenantName}
                          onChange={handleChange}
                          required
                          className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                          placeholder="Enter tenant name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaPhone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="tenantPhone"
                          value={formData.tenantPhone}
                          onChange={handleChange}
                          required
                          className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                          placeholder="9876543210"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Email Address (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="tenantEmail"
                          value={formData.tenantEmail}
                          onChange={handleChange}
                          className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                          placeholder="tenant@example.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Room Number *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaHome className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="roomNumber"
                          value={formData.roomNumber}
                          onChange={handleChange}
                          required
                          className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                          placeholder="e.g., 101, A-12"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Details */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b pb-2">
                      Payment Details
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Month *
                      </label>
                      <select
                        name="month"
                        value={formData.month}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                      >
                        {months.map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Year *
                      </label>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                      >
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Rent Amount (₹) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaRupeeSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          required
                          className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Payment Mode *
                      </label>
                      <select
                        name="paymentMode"
                        value={formData.paymentMode}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                      >
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="upi">UPI</option>
                        <option value="cheque">Cheque</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    {formData.paymentMode !== 'cash' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Transaction ID
                        </label>
                        <input
                          type="text"
                          name="transactionId"
                          value={formData.transactionId}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                          placeholder="Enter transaction reference"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Mobile View - Collapsible Sections */}
              <div className="md:hidden">
                {/* Tenant Details Section */}
                <FormSection 
                  title="Tenant Information" 
                  icon={<FaUser />}
                  sectionKey="tenant"
                  isRequired={true}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="tenantName"
                        value={formData.tenantName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Enter tenant's full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="tenantPhone"
                        value={formData.tenantPhone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="9876543210"
                        maxLength={10}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="tenantEmail"
                        value={formData.tenantEmail}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="tenant@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Number *
                      </label>
                      <input
                        type="text"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="e.g., 101, A-12"
                      />
                    </div>
                  </div>
                </FormSection>

                {/* Payment Details Section */}
                <FormSection 
                  title="Payment Details" 
                  icon={<FaCreditCard />}
                  sectionKey="payment"
                  isRequired={true}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Month *
                        </label>
                        <select
                          name="month"
                          value={formData.month}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monthly Rent (₹) *
                        </label>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Mode *
                        </label>
                        <select
                          name="paymentMode"
                          value={formData.paymentMode}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                          <option value="cash">Cash</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="upi">UPI</option>
                          <option value="cheque">Cheque</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    {formData.paymentMode !== 'cash' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Transaction ID / Reference
                        </label>
                        <input
                          type="text"
                          name="transactionId"
                          value={formData.transactionId}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          placeholder="Enter transaction reference"
                        />
                      </div>
                    )}
                  </div>
                </FormSection>
              </div>
              
              {/* Date Fields */}
              <div className="mt-6 md:mt-8">
                <div className="hidden md:block">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b pb-2 mb-3 sm:mb-4">
                    Payment Dates
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Monthly Payment Date *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaCalendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          name="monthlyPaymentDate"
                          value={formData.monthlyPaymentDate}
                          onChange={handleChange}
                          required
                          className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Paid Date *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaCalendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          name="paidDate"
                          value={formData.paidDate}
                          onChange={handleChange}
                          required
                          className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Collapsible Section */}
                <div className="md:hidden">
                  <FormSection 
                    title="Payment Dates" 
                    icon={<FaCalendar />}
                    sectionKey="dates"
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monthly Payment Date *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaCalendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            name="monthlyPaymentDate"
                            value={formData.monthlyPaymentDate}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Paid Date *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaCalendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            name="paidDate"
                            value={formData.paidDate}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          />
                        </div>
                      </div>
                    </div>
                  </FormSection>
                </div>
              </div>
              
              {/* Additional Charges */}
              <div className="mt-6 md:mt-8">
                <div className="hidden md:block">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b pb-2 mb-3 sm:mb-4">
                    Additional Charges (Optional)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Security Deposit
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaRupeeSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="securityDeposit"
                          value={formData.securityDeposit}
                          onChange={handleChange}
                          className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Electricity
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaRupeeSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="electricityCharges"
                          value={formData.electricityCharges}
                          onChange={handleChange}
                          className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Water Charges
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaRupeeSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="waterCharges"
                          value={formData.waterCharges}
                          onChange={handleChange}
                          className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Other Charges
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaRupeeSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="otherCharges"
                          value={formData.otherCharges}
                          onChange={handleChange}
                          className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Collapsible Section */}
                <div className="md:hidden">
                  <FormSection 
                    title="Additional Charges" 
                    icon={<FaPlus />}
                    sectionKey="charges"
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Security Deposit
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="number"
                            name="securityDeposit"
                            value={formData.securityDeposit}
                            onChange={handleChange}
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="number"
                            name="electricityCharges"
                            value={formData.electricityCharges}
                            onChange={handleChange}
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="number"
                            name="waterCharges"
                            value={formData.waterCharges}
                            onChange={handleChange}
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="number"
                            name="otherCharges"
                            value={formData.otherCharges}
                            onChange={handleChange}
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  </FormSection>
                </div>
              </div>
              
              {/* Balance Details */}
              <div className="mt-6 md:mt-8">
                <div className="hidden md:block">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b pb-2 mb-3 sm:mb-4">
                    Balance Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Previous Balance
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaRupeeSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="previousBalance"
                          value={formData.previousBalance}
                          onChange={handleChange}
                          className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Amount Paid *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaRupeeSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="amountPaid"
                          value={formData.amountPaid}
                          onChange={handleChange}
                          required
                          className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Balance Due
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaRupeeSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={totals.balanceDue.toFixed(2)}
                          readOnly
                          className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Collapsible Section */}
                <div className="md:hidden">
                  <FormSection 
                    title="Balance & Payment" 
                    icon={<FaCalculator />}
                    sectionKey="balance"
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Previous Balance
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="number"
                            name="previousBalance"
                            value={formData.previousBalance}
                            onChange={handleChange}
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="number"
                            name="amountPaid"
                            value={formData.amountPaid}
                            onChange={handleChange}
                            required
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="text"
                            value={totals.balanceDue.toFixed(2)}
                            readOnly
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </FormSection>
                </div>
              </div>
              
              {/* Notes */}
              <div className="mt-6 md:mt-8">
                <div className="hidden md:block">
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="block w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                    placeholder="Any additional notes or remarks..."
                  />
                </div>
                
                {/* Mobile Collapsible Section */}
                <div className="md:hidden">
                  <FormSection 
                    title="Additional Notes" 
                    icon={<FaStickyNote />}
                    sectionKey="notes"
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                  >
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="3"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                      placeholder="Any additional notes or remarks..."
                    />
                  </FormSection>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      tenantName: '',
                      tenantEmail: '',
                      tenantPhone: '',
                      roomNumber: '',
                      month: months[new Date().getMonth()],
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
                      forMonth: `${months[new Date().getMonth()]} ${currentYear}`,
                      notes: '',
                      monthlyPaymentDate: today,
                      paidDate: today
                    });
                    toast.success('Form cleared');
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base order-2 sm:order-1"
                >
                  Clear Form
                </button>
                <button
                  type="button"
                  onClick={handlePreview}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base order-1 sm:order-2"
                >
                  Preview Receipt
                </button>
              </div>
            </div>
          </div>
          
          {/* Summary Card - Always visible on desktop */}
          <div className="hidden md:block">
            <div className="bg-white rounded-xl shadow p-4 sm:p-6 sticky top-4 md:top-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b pb-2 mb-3 sm:mb-4">
                Receipt Summary
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Monthly Rent:</span>
                  <span className="font-medium text-sm">₹{parseFloat(formData.amount || 0).toFixed(2)}</span>
                </div>
                
                {formData.securityDeposit > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Security Deposit:</span>
                    <span className="font-medium text-sm">₹{parseFloat(formData.securityDeposit).toFixed(2)}</span>
                  </div>
                )}
                
                {formData.electricityCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Electricity:</span>
                    <span className="font-medium text-sm">₹{parseFloat(formData.electricityCharges).toFixed(2)}</span>
                  </div>
                )}
                
                {formData.waterCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Water Charges:</span>
                    <span className="font-medium text-sm">₹{parseFloat(formData.waterCharges).toFixed(2)}</span>
                  </div>
                )}
                
                {formData.otherCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Other Charges:</span>
                    <span className="font-medium text-sm">₹{parseFloat(formData.otherCharges).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span className="text-sm">Total Amount:</span>
                    <span className="text-green-600 text-sm">₹{totals.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                {formData.previousBalance > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Previous Balance:</span>
                    <span className="font-medium text-sm">₹{parseFloat(formData.previousBalance).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-semibold text-blue-600">
                  <span className="text-sm">Amount Paid:</span>
                  <span className="text-sm">₹{totals.amountPaid.toFixed(2)}</span>
                </div>
                
                {totals.balanceDue > 0 && (
                  <div className="flex justify-between font-semibold text-red-600">
                    <span className="text-sm">Balance Due:</span>
                    <span className="text-sm">₹{totals.balanceDue.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <FaInfoCircle className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2 text-sm">Quick Tips:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• All fields marked with * are required</li>
                      <li>• Preview before saving</li>
                      <li>• Email receipt after saving</li>
                      <li>• Download PDF for printing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Summary Button */}
      <button
        onClick={() => setShowMobileSummary(!showMobileSummary)}
        className="md:hidden fixed bottom-20 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition z-40"
      >
        <FaCalculator className="text-xl" />
      </button>

      {/* Mobile Summary Sheet */}
      {showMobileSummary && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMobileSummary(false)}
          ></div>
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Receipt Summary</h3>
                <button
                  onClick={() => setShowMobileSummary(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Monthly Rent:</span>
                  <span className="font-medium">₹{parseFloat(formData.amount || 0).toFixed(2)}</span>
                </div>
                
                {formData.securityDeposit > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Security Deposit:</span>
                    <span className="font-medium">₹{parseFloat(formData.securityDeposit).toFixed(2)}</span>
                  </div>
                )}
                
                {formData.electricityCharges > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Electricity:</span>
                    <span className="font-medium">₹{parseFloat(formData.electricityCharges).toFixed(2)}</span>
                  </div>
                )}
                
                {formData.waterCharges > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Water Charges:</span>
                    <span className="font-medium">₹{parseFloat(formData.waterCharges).toFixed(2)}</span>
                  </div>
                )}
                
                {formData.otherCharges > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Other Charges:</span>
                    <span className="font-medium">₹{parseFloat(formData.otherCharges).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="py-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₹{totals.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                {formData.previousBalance > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Previous Balance:</span>
                    <span className="font-medium">₹{parseFloat(formData.previousBalance).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold text-blue-600">Amount Paid:</span>
                  <span className="font-semibold">₹{totals.amountPaid.toFixed(2)}</span>
                </div>
                
                {totals.balanceDue > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-red-600">Balance Due:</span>
                    <span className="font-semibold">₹{totals.balanceDue.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Quick Tips:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• All fields marked with * are required</li>
                  <li>• Preview before saving</li>
                  <li>• Email receipt after saving</li>
                  <li>• Download PDF for printing</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReceiptGenerator;