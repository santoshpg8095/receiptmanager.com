import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import toast from 'react-hot-toast';
import { FaSearch, FaFilter, FaDownload, FaEnvelope, FaEye, FaTrash, FaCalendar, FaFilePdf, FaChartBar, FaRupeeSign, FaUsers, FaHistory, FaChevronLeft, FaChevronRight, FaPrint, FaQrcode, FaCheckCircle, FaTimesCircle, FaRegClock, FaEdit } from 'react-icons/fa';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReceipts, setTotalReceipts] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const itemsPerPage = 10;

  useEffect(() => {
    fetchDashboardStats();
    fetchReceipts();
  }, [currentPage, selectedMonth, selectedYear, selectedStatus]);

  const fetchDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const response = await api.get('/dashboard/stats');
      setDashboardStats(response.data);
      console.log('📊 Dashboard stats loaded:', response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error('Failed to load dashboard statistics', {
        icon: '📊',
        style: {
          borderRadius: '10px',
          background: '#EF4444',
          color: '#fff',
        },
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedMonth && { month: selectedMonth }),
        ...(selectedYear && { year: selectedYear }),
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      }).toString();

      const response = await api.get(`/receipts?${params}`);
      setReceipts(response.data.receipts);
      setTotalPages(response.data.totalPages);
      setTotalReceipts(response.data.totalReceipts);
      console.log('📄 Receipts loaded:', {
        currentPage,
        itemsOnPage: response.data.receipts.length,
        totalReceipts: response.data.totalReceipts,
        totalPages: response.data.totalPages
      });
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReceipts();
  };

  const handleFilterReset = () => {
    setSearchTerm('');
    setSelectedMonth('');
    setSelectedYear('');
    setSelectedStatus('all');
    setCurrentPage(1);
    fetchReceipts();
  };

  const handleDelete = async (receiptId) => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) {
      return;
    }

    try {
      await api.delete(`/receipts/${receiptId}`);
      toast.success('Receipt deleted successfully', {
        icon: '🗑️',
        style: {
          borderRadius: '10px',
          background: '#10B981',
          color: '#fff',
        },
      });
      fetchReceipts();
      fetchDashboardStats();
    } catch (error) {
      toast.error('Failed to delete receipt', {
        icon: '❌',
      });
    }
  };

  const handleEdit = (receiptId) => {
    navigate(`/receipts/edit/${receiptId}`);
  };

  const handleDownload = async (receiptId, receiptNumber) => {
    try {
      const response = await api.get(`/receipts/${receiptId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${receiptNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Receipt downloaded successfully', {
        icon: '📥',
        style: {
          borderRadius: '10px',
          background: '#3B82F6',
          color: '#fff',
        },
      });
    } catch (error) {
      toast.error('Failed to download receipt', {
        icon: '❌',
      });
    }
  };

  const handleEmail = async (receiptId, tenantEmail) => {
    if (!tenantEmail) {
      toast.error('No email address available for this tenant', {
        icon: '📧',
      });
      return;
    }

    try {
      await api.post('/email/send', {
        receiptId,
        recipientEmail: tenantEmail
      });
      toast.success('Receipt sent via email successfully', {
        icon: '✉️',
        style: {
          borderRadius: '10px',
          background: '#10B981',
          color: '#fff',
        },
      });
      fetchReceipts();
      fetchDashboardStats();
    } catch (error) {
      toast.error('Failed to send email', {
        icon: '❌',
      });
    }
  };

  const handleViewDetails = (receiptId) => {
    navigate(`/receipts/${receiptId}`);
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/receipts?limit=1000');
      const allReceipts = response.data.receipts;
      
      const headers = [
        'Receipt Number',
        'Tenant Name',
        'Tenant Email',
        'Tenant Phone',
        'Room Number',
        'Month',
        'Year',
        'Amount (₹)',
        'Payment Mode',
        'Transaction ID',
        'For Month',
        'Created Date',
        'Emailed Status',
        'Verification Count'
      ];
      
      const rows = allReceipts.map(receipt => [
        `"${receipt.receiptNumber || ''}"`,
        `"${receipt.tenantName || ''}"`,
        `"${receipt.tenantEmail || ''}"`,
        `"${receipt.tenantPhone || ''}"`,
        `"${receipt.roomNumber || ''}"`,
        `"${receipt.month || ''}"`,
        `"${receipt.year || ''}"`,
        `"${receipt.amountPaid || 0}"`,
        `"${receipt.paymentMode || ''}"`,
        `"${receipt.transactionId || ''}"`,
        `"${receipt.forMonth || ''}"`,
        `"${new Date(receipt.createdAt).toLocaleDateString('en-IN')}"`,
        `"${receipt.sentViaEmail ? 'Yes' : 'No'}"`,
        `"${receipt.verificationCount || 0}"`
      ]);
      
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipts_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV exported successfully', {
        icon: '📊',
        style: {
          borderRadius: '10px',
          background: '#10B981',
          color: '#fff',
        },
      });
    } catch (error) {
      toast.error('Failed to export CSV', {
        icon: '❌',
      });
      console.error('Export error:', error);
    }
  };

  const handlePrintReport = () => {
    const stats = calculateStats();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipts Report - ${user?.pgName || 'PG Receipts'}</title>
        <style>
          @media print {
            body { font-family: Arial, sans-serif; margin: 20px; background: white; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #2563eb; }
            .header p { margin: 5px 0; color: #666; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
            .stat-label { color: #666; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #ddd; }
            td { padding: 10px; border: 1px solid #ddd; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
            .status-emailed { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; }
            .status-pending { background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${user?.pgName || 'PG Receipts'} - Receipts Report</h1>
          <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
          <p>Total Receipts: ${stats.total}</p>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Total Receipts</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.thisMonth}</div>
            <div class="stat-label">This Month</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">₹${stats.totalRevenue.toLocaleString('en-IN')}</div>
            <div class="stat-label">Total Revenue</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.emailed}</div>
            <div class="stat-label">Emailed</div>
          </div>
        </div>
        
        <h2>Receipts List</h2>
        <table>
          <thead>
            <tr>
              <th>Receipt No</th>
              <th>Tenant</th>
              <th>Room</th>
              <th>Amount</th>
              <th>Month</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${receipts.map(receipt => `
              <tr>
                <td>${receipt.receiptNumber}</td>
                <td>${receipt.tenantName}</td>
                <td>${receipt.roomNumber}</td>
                <td>₹${receipt.amountPaid?.toLocaleString('en-IN') || '0'}</td>
                <td>${receipt.forMonth}</td>
                <td>${new Date(receipt.createdAt).toLocaleDateString('en-IN')}</td>
                <td>
                  <span class="${receipt.sentViaEmail ? 'status-emailed' : 'status-pending'}">
                    ${receipt.sentViaEmail ? 'Emailed' : 'Not Emailed'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Report generated by PG Receipts System</p>
          <p>Page 1 of 1</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }, 500);
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

  const calculateStats = () => {
    if (dashboardStats) {
      const stats = dashboardStats.stats;
      const currentDate = new Date();
      const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
      
      const emailed = receipts.filter(r => r.sentViaEmail === true).length;
      const pending = receipts.filter(r => 
        r.sentViaEmail === false && 
        r.tenantEmail && 
        r.tenantEmail.trim() !== ''
      ).length;
      
      const emailedPercentage = receipts.length > 0 ? Math.round((emailed / receipts.length) * 100) : 0;
      
      return {
        total: stats.totalReceipts,
        thisMonth: stats.currentMonthReceipts,
        totalRevenue: stats.currentMonthAmount,
        thisMonthRevenue: stats.currentMonthAmount,
        emailed,
        pending,
        emailedPercentage,
        receiptChange: stats.receiptChange ? `${stats.receiptChange >= 0 ? '+' : ''}${stats.receiptChange}%` : '+12% this month',
        revenueChange: stats.amountChange ? `${stats.amountChange >= 0 ? '+' : ''}${stats.amountChange}%` : '+8% from last month'
      };
    }

    const currentDate = new Date();
    const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
    
    const thisMonthReceipts = receipts.filter(receipt => 
      receipt.month === currentMonthName && 
      receipt.year === currentYear
    );

    const total = totalReceipts;
    const thisMonth = thisMonthReceipts.length;
    const totalRevenue = receipts.reduce((sum, r) => sum + (parseFloat(r.amountPaid) || 0), 0);
    const thisMonthRevenue = thisMonthReceipts.reduce((sum, r) => sum + (parseFloat(r.amountPaid) || 0), 0);
    const emailed = receipts.filter(r => r.sentViaEmail === true).length;
    const pending = receipts.filter(r => 
      r.sentViaEmail === false && 
      r.tenantEmail && 
      r.tenantEmail.trim() !== ''
    ).length;
    const emailedPercentage = receipts.length > 0 ? Math.round((emailed / receipts.length) * 100) : 0;

    return { 
      total,
      thisMonth,
      totalRevenue,
      thisMonthRevenue,
      emailed,
      pending,
      emailedPercentage,
      receiptChange: '+12% this month',
      revenueChange: '+8% from last month'
    };
  };

  const stats = calculateStats();
  const isOverallLoading = loading || loadingStats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6 lg:p-8 transition-colors duration-300">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <FaHistory className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Receipt History
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">View and manage all your generated receipts</p>
            {dashboardStats && (
              <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full inline-flex">
                <span>📊</span>
                <span>Live stats loaded from dashboard</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/receipts')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center gap-2"
          >
            <FaFilePdf className="h-4 w-4" />
            <span className="text-sm font-medium">New Receipt</span>
          </button>
        </div>
      </div>

      {/* Stats Overview - Updated with accurate dashboard data */}
      {isOverallLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-white rounded-2xl shadow-lg p-5 md:p-6 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-500 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-500 rounded w-16"></div>
                </div>
                <div className="p-3 bg-gray-400/20 backdrop-blur-sm rounded-xl">
                  <div className="h-6 w-6 bg-gray-300 dark:bg-gray-500 rounded"></div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-300/20">
                <div className="h-4 bg-gray-300 dark:bg-gray-500 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
          {[
            {
              title: 'Total Receipts',
              value: stats.total || 0,
              icon: FaFilePdf,
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-gradient-to-br',
              change: stats.receiptChange
            },
            {
              title: 'This Month',
              value: stats.thisMonth || 0,
              icon: FaCalendar,
              color: 'from-emerald-500 to-green-500',
              bgColor: 'bg-gradient-to-br',
              description: `${stats.thisMonth || 0} receipts`
            },
            {
              title: 'Total Revenue',
              value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`,
              icon: FaRupeeSign,
              color: 'from-amber-500 to-orange-500',
              bgColor: 'bg-gradient-to-br',
              change: stats.revenueChange
            },
            {
              title: 'Emailed',
              value: stats.emailed || 0,
              icon: FaEnvelope,
              color: 'from-purple-500 to-violet-500',
              bgColor: 'bg-gradient-to-br',
              percentage: `${stats.emailedPercentage || 0}% sent`
            },
            {
              title: 'Pending',
              value: stats.pending || 0,
              icon: FaRegClock,
              color: 'from-rose-500 to-pink-500',
              bgColor: 'bg-gradient-to-br',
              description: 'Need email'
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
                {stat.change && (
                  <span className="text-sm opacity-90">{stat.change}</span>
                )}
                {stat.description && (
                  <span className="text-sm opacity-90">{stat.description}</span>
                )}
                {stat.percentage && (
                  <span className="text-sm opacity-90">{stat.percentage}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 mb-6 md:mb-8">
        <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Search by tenant name, phone, or receipt number..."
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">Search</span>
                </button>
              </div>
            </form>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <FaFilter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 p-5 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Month
                  </label>
                  <div className="relative">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">All Months</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <FaCalendar className="text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Year
                  </label>
                  <div className="relative">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">All Years</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="emailed">Emailed</option>
                    <option value="pending">Not Emailed</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={handleFilterReset}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 mb-6 md:mb-8">
        <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">All Receipts</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalReceipts)} of {totalReceipts} receipts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-3 border-2 border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all"
              >
                <FaDownload className="h-4 w-4" />
                <span className="text-sm font-medium">Export CSV</span>
              </button>
              <button
                onClick={handlePrintReport}
                className="flex items-center gap-2 px-4 py-3 border-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
              >
                <FaPrint className="h-4 w-4" />
                <span className="text-sm font-medium">Print Report</span>
              </button>
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
        ) : receipts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
              <FaFilePdf className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {searchTerm || selectedMonth || selectedYear || selectedStatus !== 'all' 
                ? 'No matching receipts found' 
                : 'No receipts generated yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              {searchTerm || selectedMonth || selectedYear || selectedStatus !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for'
                : 'Create your first receipt to start managing payments'
              }
            </p>
            <div className="flex gap-3 justify-center">
              {(searchTerm || selectedMonth || selectedYear || selectedStatus !== 'all') && (
                <button
                  onClick={handleFilterReset}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => navigate('/receipts')}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Create First Receipt
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Receipt Details</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Tenant Information</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Payment</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Date & Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt) => (
                    <tr 
                      key={receipt._id} 
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors duration-150 group"
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center mr-3">
                            <FaFilePdf className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">{receipt.receiptNumber}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Room {receipt.roomNumber}
                            </p>
                          </div>
                        </div>
                       </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{receipt.tenantName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{receipt.tenantPhone}</p>
                          {receipt.tenantEmail && (
                            <p className="text-sm text-blue-600 dark:text-blue-400 truncate max-w-xs">{receipt.tenantEmail}</p>
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
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <FaCalendar className="mr-2 text-gray-400 dark:text-gray-500" />
                            <span>{formatDate(receipt.createdAt)}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {receipt.sentViaEmail ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                <FaCheckCircle className="h-3 w-3 mr-1" />
                                Emailed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                                <FaTimesCircle className="h-3 w-3 mr-1" />
                                Not Emailed
                              </span>
                            )}
                            {receipt.verificationCount > 0 && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                <FaQrcode className="h-3 w-3 mr-1" />
                                Verified {receipt.verificationCount}x
                              </span>
                            )}
                          </div>
                        </div>
                        </td>
                      <td className="p-4">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleEdit(receipt._id)}
                            className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors"
                            title="Edit Receipt"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleViewDetails(receipt._id)}
                            className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors"
                            title="View Details"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDownload(receipt._id, receipt.receiptNumber)}
                            className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                            title="Download PDF"
                          >
                            <FaDownload className="h-4 w-4" />
                          </button>
                          
                          {receipt.tenantEmail && (
                            <button
                              onClick={() => handleEmail(receipt._id, receipt.tenantEmail)}
                              className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
                              title="Email Receipt"
                            >
                              <FaEnvelope className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDelete(receipt._id)}
                            className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                            title="Delete Receipt"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-5 md:p-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Page {currentPage} of {totalPages}</span>
                  <span className="mx-2">•</span>
                  <span>{totalReceipts} total receipts</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FaChevronLeft className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                              : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FaChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Summary Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <FaChartBar className="mr-2 text-blue-600 dark:text-blue-400" />
            Quick Summary
          </h3>
        </div>
        <div className="p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-blue-800 dark:text-blue-400">Recent Activity</h4>
                <FaHistory className="text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {stats.thisMonth || 0} receipts created this month
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {stats.emailed || 0} emails sent successfully (from current page)
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-emerald-800 dark:text-emerald-400">Revenue Insights</h4>
                <FaRupeeSign className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Total: ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                Average per receipt: ₹{Math.round((stats.totalRevenue || 0) / Math.max(stats.total || 1, 1)).toLocaleString('en-IN')}
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-amber-800 dark:text-amber-400">Action Required</h4>
                <FaRegClock className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {stats.pending || 0} receipts pending email (from current page)
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {(stats.total || 0) - (stats.emailed || 0)} can be edited
                </p>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => navigate('/email')}
                  className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
                >
                  Send Emails
                </button>
                <button
                  onClick={fetchDashboardStats}
                  className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  Refresh Stats
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>History dashboard last updated • {new Date().toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p className="mt-1">
            Need help with receipts? 
            <a href="/help" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">View documentation</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default History;