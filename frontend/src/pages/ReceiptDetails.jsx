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
    // Navigate to edit page or open edit modal
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
      <div className="p-8">
        <Loader size="large" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Receipt not found</h2>
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/history')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <FaArrowLeft className="mr-2" />
              Back to History
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Receipt Details</h1>
            <p className="text-gray-600 mt-2">
              Receipt #{receipt.receiptNumber} • {receipt.tenantName}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
            >
              <FaEdit className="mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
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
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Dates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Monthly Payment Date</label>
            <p className="text-lg font-medium text-gray-900 mt-1">
              {receipt.monthlyPaymentDate ? new Date(receipt.monthlyPaymentDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) : 'Not specified'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Paid Date</label>
            <p className="text-lg font-medium text-gray-900 mt-1">
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
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Additional Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Verification Hash</label>
              <p className="text-sm font-mono bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                {receipt.verificationHash}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Verification Count</label>
              <p className="text-lg font-medium text-gray-900">
                {receipt.verificationCount || 0} times
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Created Date</label>
              <p className="text-lg font-medium text-gray-900">
                {new Date(receipt.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
            
            {receipt.emailSentAt && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Emailed Date</label>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(receipt.emailSentAt).toLocaleString('en-IN')}
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Payment Status</label>
              <div className="flex items-center mt-1">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  receipt.balanceDue > 0 ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <span className="font-medium">
                  {receipt.balanceDue > 0 ? 'Partially Paid' : 'Fully Paid'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Email Status</label>
              <div className="flex items-center mt-1">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  receipt.sentViaEmail ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className="font-medium">
                  {receipt.sentViaEmail ? 'Sent' : 'Not Sent'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDetails;