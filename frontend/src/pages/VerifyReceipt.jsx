import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { FaQrcode, FaCheckCircle, FaTimesCircle, FaPrint, FaDownload, FaCopy, FaShieldAlt, FaClock, FaHome, FaUser, FaMoneyBillWave, FaSearch, FaExclamationTriangle, FaFileAlt, FaLock, FaHistory } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import Layout from '../components/Layout';

const VerifyReceipt = () => {
  const { hash } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualHash, setManualHash] = useState('');
  const [activeTab, setActiveTab] = useState('scan');

  useEffect(() => {
    if (hash) {
      verifyReceipt(hash);
    }
  }, [hash]);

  const verifyReceipt = async (verificationHash) => {
    setLoading(true);
    try {
      const response = await api.get(`/receipts/verify/${verificationHash}`);
      setVerificationResult(response.data);
      toast.success('Receipt verified successfully!', {
        icon: '✅',
        style: {
          borderRadius: '10px',
          background: '#10B981',
          color: '#fff',
        },
      });
    } catch (error) {
      setVerificationResult({
        isValid: false,
        message: error.response?.data?.message || 'Invalid receipt or verification failed'
      });
      if (error.response?.status !== 404) {
        toast.error('Receipt verification failed', {
          icon: '❌',
          style: {
            borderRadius: '10px',
            background: '#EF4444',
            color: '#fff',
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (manualHash.trim()) {
      navigate(`/verify/${manualHash}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const verificationUrl = `${window.location.origin}/verify/${verificationResult?.receipt?.verificationHash || hash}`;
    navigator.clipboard.writeText(verificationUrl);
    toast.success('Verification link copied!', {
      icon: '📋',
      style: {
        borderRadius: '10px',
        background: '#3B82F6',
        color: '#fff',
      },
    });
  };

  const handleDownload = async () => {
    if (!verificationResult?.receipt) return;
    
    try {
      const response = await api.get(`/receipts/${verificationResult.receipt._id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${verificationResult.receipt.receiptNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Receipt downloaded!', {
        icon: '📥',
        style: {
          borderRadius: '10px',
          background: '#10B981',
          color: '#fff',
        },
      });
    } catch (error) {
      toast.error('Download failed', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#EF4444',
          color: '#fff',
        },
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
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

  const content = (
    <div className="container mx-auto px-4 py-6 md:py-8 lg:py-12 max-w-7xl">
      {/* Animated Header */}
      <div className="text-center mb-8 md:mb-12 lg:mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4 md:mb-6 animate-pulse">
          <FaLock className="h-8 w-8 md:h-10 md:w-10 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">
          Receipt Verification
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Instantly verify the authenticity of PG receipts using QR codes or verification codes
        </p>
      </div>

      {/* Verification Input Section - Only show when no hash is present */}
      {!hash && (
        <div className="max-w-4xl mx-auto mb-12 md:mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('scan')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                  activeTab === 'scan'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <FaQrcode className="inline-block mr-2" />
                QR Code Scan
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                  activeTab === 'manual'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <FaSearch className="inline-block mr-2" />
                Manual Entry
              </button>
            </div>

            <div className="p-6 md:p-8">
              {activeTab === 'manual' ? (
                <form onSubmit={handleManualVerify} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <FaFileAlt className="inline-block mr-2" />
                      Verification Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={manualHash}
                        onChange={(e) => setManualHash(e.target.value)}
                        className="w-full px-4 py-3 pl-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Enter 64-character verification code"
                        required
                      />
                      <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Find this code at the bottom of your receipt
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Verify Receipt
                  </button>
                </form>
              ) : (
                <div className="text-center">
                  <div className="inline-block p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-inner mb-6">
                    <QRCodeSVG
                      value="demo"
                      size={180}
                      level="H"
                      includeMargin={true}
                      className="mx-auto"
                      bgColor={document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff'}
                      fgColor={document.documentElement.classList.contains('dark') ? '#60a5fa' : '#2563eb'}
                    />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Point your camera at the QR code on the receipt
                  </p>
                  <button className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg">
                    Scan QR Code
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Steps */}
          <div className="mt-8 md:mt-12">
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-6">
              How Verification Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { number: '01', title: 'Scan or Enter', desc: 'Use QR code or enter verification code', icon: FaQrcode },
                { number: '02', title: 'Instant Check', desc: 'System validates receipt authenticity', icon: FaShieldAlt },
                { number: '03', title: 'View Details', desc: 'See complete receipt information', icon: FaFileAlt }
              ].map((step, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{step.number}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{step.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Verification Result */}
      {hash && (
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
              <div className="inline-block">
                <Loader size="large" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">Verifying receipt authenticity...</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">This may take a few seconds</p>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8">
              {/* Result Card */}
              <div className={`rounded-2xl shadow-xl overflow-hidden border-2 ${
                verificationResult?.isValid 
                  ? 'border-green-200 dark:border-green-800' 
                  : 'border-red-200 dark:border-red-800'
              }`}>
                <div className={`p-6 md:p-8 text-white ${
                  verificationResult?.isValid 
                    ? 'bg-gradient-to-r from-green-500 via-green-600 to-green-700' 
                    : 'bg-gradient-to-r from-red-500 via-red-600 to-red-700'
                }`}>
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className={`mr-4 p-3 rounded-full ${verificationResult?.isValid ? 'bg-green-400' : 'bg-red-400'}`}>
                        {verificationResult?.isValid ? (
                          <FaCheckCircle className="h-8 w-8" />
                        ) : (
                          <FaTimesCircle className="h-8 w-8" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold">
                          {verificationResult?.isValid ? 'VALID RECEIPT' : 'INVALID RECEIPT'}
                        </h2>
                        <p className="text-lg opacity-90">
                          {verificationResult?.message}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/verify')}
                      className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all"
                    >
                      Verify Another
                    </button>
                  </div>
                </div>

                {/* Receipt Details */}
                {verificationResult?.isValid && verificationResult?.receipt && (
                  <div className="bg-white dark:bg-gray-800 p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                      {/* Main Details */}
                      <div className="lg:col-span-2">
                        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-xl p-6 shadow-inner mb-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                            <FaFileAlt className="mr-2" />
                            Receipt Information
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Receipt Number</label>
                                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                  #{verificationResult.receipt.receiptNumber}
                                </p>
                              </div>
                              
                              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tenant Details</label>
                                <div className="flex items-center mt-2">
                                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                                    <FaUser className="text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{verificationResult.receipt.tenantName}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Room {verificationResult.receipt.roomNumber}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">For Month</label>
                                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                                  {verificationResult.receipt.forMonth}
                                </p>
                              </div>
                            </div>
                            
                            {/* Right Column */}
                            <div className="space-y-4">
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 shadow-sm border border-green-100 dark:border-green-800">
                                <label className="block text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wider">Amount Paid</label>
                                <p className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-400 mt-1">
                                  {formatCurrency(verificationResult.receipt.amountPaid)}
                                </p>
                                <div className="flex items-center mt-2">
                                  <FaMoneyBillWave className="text-green-600 dark:text-green-500 mr-2" />
                                  <span className="text-sm text-green-700 dark:text-green-400">Payment Received</span>
                                </div>
                              </div>
                              
                              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Issued On</label>
                                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                                  {formatDate(verificationResult.receipt.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* PG Details */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <FaHome className="mr-2" />
                            Issued By
                          </h4>
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">{verificationResult.receipt.pgName}</p>
                              <p className="text-gray-600 dark:text-gray-400">{verificationResult.receipt.pgAddress}</p>
                              <p className="text-gray-500 dark:text-gray-500 mt-1">Contact: {verificationResult.receipt.pgContact}</p>
                            </div>
                            {verificationResult.receipt.verificationCount > 0 && (
                              <div className="mt-4 md:mt-0 bg-white dark:bg-gray-700 rounded-lg px-4 py-2 shadow-sm">
                                <div className="flex items-center">
                                  <FaHistory className="text-blue-600 dark:text-blue-400 mr-2" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Verified {verificationResult.receipt.verificationCount} times
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Sidebar - QR & Actions */}
                      <div className="space-y-6">
                        {/* QR Code Card */}
                        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-4">QR Code</h4>
                          <div className="text-center">
                            <div className="inline-block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner">
                              <QRCodeSVG 
                                value={`${window.location.origin}/verify/${hash}`}
                                size={140}
                                level="H"
                                includeMargin={true}
                                bgColor={document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff'}
                                fgColor={document.documentElement.classList.contains('dark') ? '#60a5fa' : '#2563eb'}
                              />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                              Scan to verify this receipt
                            </p>
                          </div>
                        </div>
                        
                        {/* Actions Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 shadow-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-4">Actions</h4>
                          <div className="space-y-3">
                            <button
                              onClick={handleCopyLink}
                              className="w-full flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 group"
                            >
                              <FaCopy className="mr-3 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                              <span className="font-medium">Copy Verification Link</span>
                            </button>
                            
                            <button
                              onClick={handleDownload}
                              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg group"
                            >
                              <FaDownload className="mr-3" />
                              <span className="font-medium">Download PDF</span>
                            </button>
                            
                            <button
                              onClick={handlePrint}
                              className="w-full flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 group"
                            >
                              <FaPrint className="mr-3" />
                              <span className="font-medium">Print This Page</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Security Badge */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                              <FaLock className="text-green-600 dark:text-green-400" />
                            </div>
                            <h4 className="font-bold text-green-800 dark:text-green-400">Secure Verification</h4>
                          </div>
                          <ul className="text-sm text-green-700 dark:text-green-400 space-y-2">
                            <li className="flex items-start">
                              <FaCheckCircle className="text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                              <span>Blockchain-secured verification</span>
                            </li>
                            <li className="flex items-start">
                              <FaCheckCircle className="text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                              <span>Tamper-proof digital signature</span>
                            </li>
                            <li className="flex items-start">
                              <FaCheckCircle className="text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                              <span>Full audit trail maintained</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    {/* Security Features */}
                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Security Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            title: 'End-to-End Encryption',
                            desc: 'All receipts are encrypted using AES-256',
                            icon: FaShieldAlt,
                            color: 'from-blue-500 to-blue-600'
                          },
                          {
                            title: 'Digital Watermark',
                            desc: 'Invisible watermark prevents forgery',
                            icon: FaQrcode,
                            color: 'from-green-500 to-green-600'
                          },
                          {
                            title: 'Real-time Validation',
                            desc: 'Instant verification against our database',
                            icon: FaClock,
                            color: 'from-purple-500 to-purple-600'
                          }
                        ].map((feature, index) => (
                          <div key={index} className="bg-white dark:bg-gray-700 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-600">
                            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                              <feature.icon className="h-6 w-6 text-white" />
                            </div>
                            <h5 className="font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Invalid Result */}
              {!verificationResult?.isValid && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-red-100 dark:border-red-800">
                  <div className="max-w-2xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
                      <FaExclamationTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-4">Verification Failed</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-8">
                      {verificationResult?.message || 'This receipt could not be verified. It may be invalid or tampered with.'}
                    </p>
                    
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-8">
                      <h4 className="font-bold text-red-800 dark:text-red-400 mb-4">Possible Reasons</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          'Invalid or expired verification code',
                          'Receipt has been altered or tampered',
                          'Not generated through our system',
                          'Verification code entered incorrectly'
                        ].map((reason, index) => (
                          <div key={index} className="flex items-start bg-white dark:bg-gray-700 rounded-lg p-4">
                            <FaTimesCircle className="text-red-500 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate('/verify')}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                    >
                      Try Another Verification
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Benefits Section */}
      {!hash && (
        <div className="max-w-6xl mx-auto mt-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Secure & Reliable Verification
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Trusted by PG owners and tenants nationwide for transparent payment records
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FaShieldAlt, title: 'Fraud Prevention', desc: 'Eliminate fake receipts with cryptographic verification' },
              { icon: FaClock, title: 'Instant Results', desc: 'Get verification results in under 2 seconds' },
              { icon: FaHistory, title: 'Audit Trail', desc: 'Complete history of all verifications' },
              { icon: FaPrint, title: 'Digital Records', desc: 'Access receipts anytime, anywhere' }
            ].map((benefit, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800">
                <div className={`inline-flex p-3 rounded-xl ${
                  index === 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                  index === 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  index === 2 ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                  'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                } mb-4`}>
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">{benefit.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="max-w-4xl mx-auto mt-12 md:mt-16">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Secure Your Payments?
            </h3>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of PG owners who trust our platform for secure, transparent receipt management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate('/demo')}
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all"
              >
                View Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      {content}
    </Layout>
  );
};

export default VerifyReceipt;