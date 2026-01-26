import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  FaPrint, 
  FaDownload, 
  FaEnvelope, 
  FaCopy, 
  FaCalendar, 
  FaCheckCircle,
  FaRupeeSign,
  FaReceipt,
  FaUser,
  FaPhone,
  FaHome,
  FaCreditCard,
  FaFileInvoiceDollar,
  FaShieldAlt,
  FaBolt,
  FaTint,
  FaFileAlt,
  FaShareAlt,
  FaLock,
  FaSignature,
  FaBuilding,
  FaMapMarkerAlt,
  FaQrcode
} from 'react-icons/fa';
import { GiMoneyStack, GiPayMoney } from 'react-icons/gi';
import toast from 'react-hot-toast';
import api from '../api/api';

const ReceiptPreview = ({ receipt, user, onPrint, onEmail }) => {
  // Helper function to safely parse numbers
  const parseAmount = (value) => {
    if (value === null || value === undefined) return 0;
    
    // If it's already a number, return it
    if (typeof value === 'number') return value;
    
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      // Remove any non-numeric characters except decimal point
      const cleaned = value.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Not specified';
      }
      
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Not specified';
    }
  };

  const formatCurrency = (amount) => {
    const parsedAmount = parseAmount(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parsedAmount);
  };

  // Calculate totals properly
  const getAmounts = () => {
    return {
      amount: parseAmount(receipt.amount),
      securityDeposit: parseAmount(receipt.securityDeposit),
      electricityCharges: parseAmount(receipt.electricityCharges),
      waterCharges: parseAmount(receipt.waterCharges),
      otherCharges: parseAmount(receipt.otherCharges),
      previousBalance: parseAmount(receipt.previousBalance),
      amountPaid: parseAmount(receipt.amountPaid),
      balanceDue: parseAmount(receipt.balanceDue),
      totalAmount: parseAmount(receipt.totalAmount)
    };
  };

  const copyVerificationLink = () => {
    const verificationUrl = `${window.location.origin}/verify/${receipt.verificationHash}`;
    navigator.clipboard.writeText(verificationUrl);
    toast.success('🔗 Verification link copied to clipboard');
  };

  const downloadPDF = async () => {
    try {
      const response = await api.get(`/receipts/${receipt._id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${receipt.receiptNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('📄 Receipt downloaded successfully');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const shareReceipt = () => {
    if (navigator.share) {
      navigator.share({
        title: `Receipt #${receipt.receiptNumber}`,
        text: `Payment receipt for ${receipt.tenantName}`,
        url: `${window.location.origin}/verify/${receipt.verificationHash}`,
      });
    } else {
      copyVerificationLink();
    }
  };

  const verificationUrl = `${window.location.origin}/verify/${receipt.verificationHash}`;
  const amounts = getAmounts();

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl">
                <FaFileInvoiceDollar className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">PAYMENT RECEIPT</h1>
            </div>
            <p className="text-blue-100">Official payment confirmation document</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center">
            <div className="text-sm text-blue-200">Receipt Number</div>
            <div className="text-xl sm:text-2xl font-bold tracking-wider">{receipt.receiptNumber}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* PG Info Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <FaBuilding className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.pgName}</h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-6 text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <FaMapMarkerAlt className="w-4 h-4" />
              <span className="text-sm sm:text-base">{user.pgAddress}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <FaPhone className="w-4 h-4" />
              <span className="text-sm sm:text-base">{user.pgContact}</span>
            </div>
          </div>
          {user.gstin && (
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <FaLock className="w-3 h-3" />
              GSTIN: {user.gstin}
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Receipt Details */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Tenant Info Card */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg">
                    <FaUser className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Tenant Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                    <div className="flex items-center p-3 bg-white border border-gray-300 rounded-lg">
                      <FaUser className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{receipt.receivedFrom || receipt.tenantName}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                    <div className="flex items-center p-3 bg-white border border-gray-300 rounded-lg">
                      <FaPhone className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{receipt.tenantPhone}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Room Number</label>
                    <div className="flex items-center p-3 bg-white border border-gray-300 rounded-lg">
                      <FaHome className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{receipt.roomNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info Card */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg">
                    <FaCreditCard className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Payment Mode</label>
                    <div className="flex items-center p-3 bg-white border border-gray-300 rounded-lg">
                      <FaCreditCard className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900 uppercase">{receipt.paymentMode?.replace('_', ' ') || 'cash'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Transaction ID</label>
                    <div className="p-3 bg-white border border-gray-300 rounded-lg font-mono text-sm">
                      {receipt.transactionId || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">For Month</label>
                      <div className="p-3 bg-white border border-gray-300 rounded-lg">
                        <span className="font-medium text-gray-900">{receipt.forMonth}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Receipt Date</label>
                      <div className="p-3 bg-white border border-gray-300 rounded-lg">
                        <span className="font-medium text-gray-900">{formatDate(receipt.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Information Section */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-lg">
                  <FaCalendar className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Date Information</h3>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 w-full sm:w-48">Monthly Payment Date:</span>
                    <span className="font-medium text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200 flex-1">
                      {formatShortDate(receipt.monthlyPaymentDate)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 w-full sm:w-48">Paid Date:</span>
                    <span className="font-medium text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200 flex-1">
                      {formatShortDate(receipt.paidDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount in Words */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-lg">
                  <FaFileAlt className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Amount in Words</h3>
              </div>
              <div className="p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-300 rounded-xl">
                <p className="text-gray-800 italic font-medium">{receipt.amountInWords || formatCurrency(amounts.amountPaid)}</p>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code & Actions */}
          <div className="space-y-6">
            {/* Verification Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg">
                  <FaQrcode className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Digital Verification</h3>
              </div>
              
              <div className="text-center mb-4">
                <div className="inline-block p-4 bg-white border border-gray-300 rounded-xl">
                  <QRCodeSVG 
                    value={verificationUrl}
                    size={140}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-3">Scan QR code to verify receipt authenticity</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={copyVerificationLink}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                >
                  <FaCopy className="w-4 h-4" />
                  Copy Verification Link
                </button>
                
                <button
                  onClick={shareReceipt}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-all duration-300"
                >
                  <FaShareAlt className="w-4 h-4" />
                  Share Receipt
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={onPrint}
                  className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <FaPrint className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Print Receipt</div>
                      <div className="text-xs text-gray-500">Get physical copy</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={downloadPDF}
                  className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <FaDownload className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Download PDF</div>
                      <div className="text-xs text-gray-500">Save digital copy</div>
                    </div>
                  </div>
                </button>
                
                {receipt.tenantEmail && (
                  <button
                    onClick={() => onEmail(receipt)}
                    className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <FaEnvelope className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Email Receipt</div>
                        <div className="text-xs text-gray-500">Send to {receipt.tenantEmail}</div>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Amount Breakdown Table */}
        <div className="mt-6 lg:mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-lg">
              <GiMoneyStack className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Payment Breakdown</h3>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-gray-300">
            <table className="w-full min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <th className="text-left p-4 font-semibold text-gray-700 border-b border-gray-300">Particulars</th>
                  <th className="text-right p-4 font-semibold text-gray-700 border-b border-gray-300">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <FaHome className="w-4 h-4 text-blue-500" />
                      Monthly Rent
                    </div>
                  </td>
                  <td className="p-4 text-right font-medium text-gray-900">{formatCurrency(amounts.amount)}</td>
                </tr>
                
                {amounts.securityDeposit > 0 && (
                  <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <FaShieldAlt className="w-4 h-4 text-green-500" />
                        Security Deposit
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium text-gray-900">{formatCurrency(amounts.securityDeposit)}</td>
                  </tr>
                )}
                
                {amounts.electricityCharges > 0 && (
                  <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <FaBolt className="w-4 h-4 text-yellow-500" />
                        Electricity Charges
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium text-gray-900">{formatCurrency(amounts.electricityCharges)}</td>
                  </tr>
                )}
                
                {amounts.waterCharges > 0 && (
                  <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <FaTint className="w-4 h-4 text-blue-400" />
                        Water Charges
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium text-gray-900">{formatCurrency(amounts.waterCharges)}</td>
                  </tr>
                )}
                
                {amounts.otherCharges > 0 && (
                  <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <FaFileAlt className="w-4 h-4 text-purple-500" />
                        Other Charges
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium text-gray-900">{formatCurrency(amounts.otherCharges)}</td>
                  </tr>
                )}
                
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <td className="p-4 font-bold text-gray-900 border-t border-gray-300">Total Amount</td>
                  <td className="p-4 text-right font-bold text-gray-900 border-t border-gray-300">{formatCurrency(amounts.totalAmount)}</td>
                </tr>
                
                {amounts.previousBalance > 0 && (
                  <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <GiPayMoney className="w-4 h-4 text-red-500" />
                        Previous Balance
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium text-gray-900">{formatCurrency(amounts.previousBalance)}</td>
                  </tr>
                )}
                
                <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <td className="p-4 font-bold text-blue-900 border-t border-gray-300">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="w-4 h-4 text-green-500" />
                      Amount Paid
                    </div>
                  </td>
                  <td className="p-4 text-right font-bold text-blue-900 border-t border-gray-300">{formatCurrency(amounts.amountPaid)}</td>
                </tr>
                
                {amounts.balanceDue > 0 && (
                  <tr>
                    <td className="p-4 font-bold text-red-700">
                      <div className="flex items-center gap-2">
                        <FaReceipt className="w-4 h-4 text-red-500" />
                        Balance Due
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-red-700">{formatCurrency(amounts.balanceDue)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes Section */}
        {receipt.notes && receipt.notes.trim() && (
          <div className="mt-6 lg:mt-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-lg">
                <FaFileAlt className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Additional Notes</h3>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-300 rounded-xl">
              <p className="text-gray-800">{receipt.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-300 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <FaLock className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-600">Secured Digital Receipt</p>
            </div>
            <p className="text-xs text-gray-500 truncate max-w-xs">Verification ID: {receipt.verificationHash}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <FaSignature className="w-4 h-4 text-gray-600" />
              <p className="text-sm font-medium text-gray-700">Digitally Signed & Verified</p>
            </div>
            <p className="text-xs text-gray-500">No physical signature required • Computer generated</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreview;