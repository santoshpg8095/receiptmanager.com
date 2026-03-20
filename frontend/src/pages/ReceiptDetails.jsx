import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import ReceiptPreview from '../components/ReceiptPreview';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';

const ReceiptDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const fetchReceipt = async () => {
    try {
      const response = await api.get(`/receipts/${id}`);
      setReceipt(response.data);
    } catch (error) {
      toast.error('Failed to load receipt');
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) {
      return;
    }

    try {
      await api.delete(`/receipts/${id}`);
      toast.success('Receipt deleted successfully');
      navigate('/history');
    } catch (error) {
      toast.error('Failed to delete receipt');
    }
  };

  const handleEdit = () => {
    toast.success('Edit feature coming soon!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = async () => {
    if (!receipt.tenantEmail) {
      toast.error('No email address available for this tenant');
      return;
    }

    try {
      await api.post('/email/send', {
        receiptId: receipt._id,
        recipientEmail: receipt.tenantEmail
      });
      toast.success('Receipt sent via email successfully');
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader size="large" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="p-8 text-center min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Receipt not found</h2>
        <button
          onClick={() => navigate('/history')}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to History
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/history')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to History
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Receipt Details</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Receipt #{receipt.receiptNumber} • {receipt.tenantName}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
            >
              <FaEdit className="mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 border border-red-600 text-red-600 dark:text-red-400 dark:border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition"
            >
              <FaTrash className="mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Preview */}
      <div className="mb-8">
        <ReceiptPreview
          receipt={receipt}
          user={user}
          onPrint={handlePrint}
          onEmail={handleEmail}
        />
      </div>

      {/* Payment Dates Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Payment Dates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Payment Date</label>
            <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
              {receipt.monthlyPaymentDate ? new Date(receipt.monthlyPaymentDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) : 'Not specified'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Paid Date</label>
            <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
              {receipt.paidDate ? new Date(receipt.paidDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) : 'Not specified'}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Additional Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Verification Hash</label>
              <p className="text-sm font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded mt-1 overflow-x-auto text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                {receipt.verificationHash}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Verification Count</label>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {receipt.verificationCount || 0} times
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created Date</label>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {new Date(receipt.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
            
            {receipt.emailSentAt && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Emailed Date</label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {new Date(receipt.emailSentAt).toLocaleString('en-IN')}
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Status</label>
              <div className="flex items-center mt-1">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  receipt.balanceDue > 0 ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {receipt.balanceDue > 0 ? 'Partially Paid' : 'Fully Paid'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Status</label>
              <div className="flex items-center mt-1">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  receipt.sentViaEmail ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
                }`}></div>
                <span className={`font-medium ${
                  receipt.sentViaEmail ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {receipt.sentViaEmail ? 'Sent' : 'Not Sent'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info if any */}
        {receipt.notes && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</label>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{receipt.notes}</p>
            </div>
          </div>
        )}

        {/* Amount Breakdown */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Amount Breakdown</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Amount</label>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">₹{receipt.totalAmount?.toLocaleString('en-IN') || '0'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount Paid</label>
              <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">₹{receipt.amountPaid?.toLocaleString('en-IN') || '0'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance Due</label>
              <p className={`text-xl font-bold mt-1 ${receipt.balanceDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                ₹{receipt.balanceDue?.toLocaleString('en-IN') || '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Mode Details */}
        {receipt.paymentMode && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Mode</label>
                <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                  {receipt.paymentMode === 'bank_transfer' ? 'Bank Transfer' : receipt.paymentMode}
                </p>
              </div>
              {receipt.transactionId && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Transaction ID</label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white font-mono text-sm">
                    {receipt.transactionId}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition shadow-md hover:shadow-lg"
        >
          Print Receipt
        </button>
        {receipt.tenantEmail && (
          <button
            onClick={handleEmail}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition shadow-md hover:shadow-lg"
          >
            Send Email
          </button>
        )}
      </div>
    </div>
  );
};

export default ReceiptDetails;