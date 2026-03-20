import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Added
import api from '../api/api';
import Loader from '../components/Loader';
import { FaPlus, FaReceipt, FaRupeeSign, FaUsers, FaChartLine, FaEnvelope, FaDownload, FaEye, FaChartBar, FaHistory, FaQrcode, FaPrint, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme(); // Added
  const [stats, setStats] = useState(null);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('month');

  useEffect(() => {
    fetchDashboardData();
  }, [filterPeriod]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, recentRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/receipts?limit=5')
      ]);
      
      console.log('🚀 DASHBOARD API RESPONSE:', statsRes.data);
      console.log('📊 Yearly Stats:', statsRes.data.yearlyStats);
      console.log('💰 Current Month Amount:', statsRes.data.stats.currentMonthAmount);
      
      setStats(statsRes.data);
      setRecentReceipts(recentRes.data.receipts || []);
    } catch (error) {
      console.error('❌ Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  console.log('📈 Preparing chart data from stats:', stats);
  
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: stats?.yearlyStats?.map(stat => stat.totalAmount) || Array(12).fill(0),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  // Prepare payment mode data
  const paymentModeData = {
    labels: stats?.paymentModeStats?.map(p => {
      const mode = p._id;
      return mode === 'cash' ? 'Cash' : 
             mode === 'bank_transfer' ? 'Bank Transfer' : 
             mode === 'upi' ? 'UPI' : 
             mode === 'cheque' ? 'Cheque' : 'Other';
    }) || [],
    datasets: [
      {
        label: 'Payment Distribution',
        data: stats?.paymentModeStats?.map(p => p.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.9)',
          'rgba(16, 185, 129, 0.9)',
          'rgba(245, 158, 11, 0.9)',
          'rgba(239, 68, 68, 0.9)',
          'rgba(139, 92, 246, 0.9)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
        hoverOffset: 20,
      },
    ],
  };

  // Calculate stats with fallback values
  const totalRevenue = stats?.stats?.currentMonthAmount || 0;
  const totalReceipts = stats?.stats?.totalReceipts || 0;
  const monthReceipts = stats?.stats?.currentMonthReceipts || 0;
  const revenueChange = stats?.stats?.amountChange || 0;
  const receiptChange = stats?.stats?.receiptChange || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6 lg:p-8 transition-colors duration-300">
      {/* Header with Welcome */}
      <div className="mb-6 md:mb-8 lg:mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base">
              Here's what's happening with your PG receipts today.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs md:text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
              {new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 md:mb-8 lg:mb-10">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <FaPlus className="mr-2 text-blue-600 dark:text-blue-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'New Receipt',
              description: 'Create receipt',
              icon: FaReceipt,
              color: 'from-blue-500 to-blue-600',
              link: '/receipts',
              bgColor: 'bg-gradient-to-br'
            },
            {
              title: 'View History',
              description: 'All receipts',
              icon: FaHistory,
              color: 'from-emerald-500 to-green-500',
              link: '/history',
              bgColor: 'bg-gradient-to-br'
            },
            {
              title: 'Send Email',
              description: 'Share receipts',
              icon: FaEnvelope,
              color: 'from-purple-500 to-violet-500',
              link: '/email',
              bgColor: 'bg-gradient-to-br'
            },
            {
              title: 'Try Demo',
              description: 'Test features',
              icon: FaChartLine,
              color: 'from-amber-500 to-orange-500',
              onClick: async () => {
                try {
                  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
                  const currentYear = new Date().getFullYear();
                  
                  const testData = {
                    tenantName: 'Test Tenant',
                    tenantEmail: 'test@example.com',
                    tenantPhone: '9876543210',
                    roomNumber: '102',
                    month: currentMonth,
                    year: currentYear,
                    amount: 6000,
                    paymentMode: 'upi',
                    receivedFrom: 'Test Tenant',
                    forMonth: `${currentMonth} ${currentYear}`,
                    amountPaid: 6000,
                    totalAmount: 6000
                  };

                  await api.post('/receipts', testData);
                  toast.success('Test receipt created successfully!');
                  fetchDashboardData();
                } catch (error) {
                  toast.error('Failed to create test receipt');
                }
              },
              bgColor: 'bg-gradient-to-br'
            }
          ].map((action, index) => (
            action.link ? (
              <Link
                key={index}
                to={action.link}
                className={`${action.bgColor} ${action.color} text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center text-center`}
              >
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl mb-3">
                  <action.icon className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="font-bold text-lg md:text-xl mb-1">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </Link>
            ) : (
              <button
                key={index}
                onClick={action.onClick}
                className={`${action.bgColor} ${action.color} text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center text-center`}
              >
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl mb-3">
                  <action.icon className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="font-bold text-lg md:text-xl mb-1">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </button>
            )
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-6 md:mb-8 lg:mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <FaChartBar className="mr-2 text-blue-600 dark:text-blue-400" />
            Performance Overview
          </h2>
          
          {/* Timeframe Selector */}
          <div className="flex items-center gap-2 mt-3 sm:mt-0 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700 shadow-sm">
            {['week', 'month', 'quarter', 'year'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setFilterPeriod(timeframe)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterPeriod === timeframe
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              title: 'Total Revenue',
              value: `₹${totalRevenue.toLocaleString('en-IN')}`,
              change: revenueChange,
              icon: FaRupeeSign,
              iconBg: 'from-emerald-500 to-green-500',
              cardBg: 'bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20',
              trendIcon: FaChartLine,
              period: 'this month'
            },
            {
              title: 'Total Receipts',
              value: totalReceipts,
              change: receiptChange,
              icon: FaReceipt,
              iconBg: 'from-blue-500 to-cyan-500',
              cardBg: 'bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20',
              trendIcon: FaChartLine,
              period: 'all time'
            },
            {
              title: 'This Month Receipts',
              value: monthReceipts,
              change: receiptChange,
              icon: FaReceipt,
              iconBg: 'from-amber-500 to-orange-500',
              cardBg: 'bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20',
              trendIcon: FaChartLine,
              period: 'this month'
            },
            {
              title: 'Active Tenants',
              value: recentReceipts.length,
              icon: FaUsers,
              iconBg: 'from-purple-500 to-violet-500',
              cardBg: 'bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20',
              trendIcon: null,
              period: 'recent'
            }
          ].map((card, index) => (
            <div key={index} className={`${card.cardBg} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 md:p-6 border border-gray-100 dark:border-gray-700`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.iconBg} shadow-md`}>
                  <card.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                {card.change !== undefined && card.change !== null ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-1 rounded-md ${
                        card.change >= 0 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}>
                        <FaChartLine className="h-3 w-3" />
                      </div>
                      <span className={`text-sm font-semibold ml-2 ${
                        card.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {card.change >= 0 ? '+' : ''}{card.change}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{card.period}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        <card.icon className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">Active users</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{card.period}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8 lg:mb-10">
        {/* Monthly Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <FaChartLine className="mr-2 text-blue-600 dark:text-blue-400" />
                  Monthly Revenue Trend
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Revenue overview for {new Date().getFullYear()}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Revenue</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-5 md:p-6">
            <div className="h-64 md:h-72 lg:h-80">
              {stats?.yearlyStats ? (
                <Line 
                  data={monthlyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          font: {
                            size: 11,
                            family: "'Inter', sans-serif"
                          },
                          usePointStyle: true,
                          padding: 15,
                          color: theme === 'dark' ? '#f3f4f6' : '#374151',
                        }
                      },
                      tooltip: {
                        backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(17, 24, 39, 0.9)',
                        titleColor: '#f3f4f6',
                        bodyColor: '#f3f4f6',
                        padding: 10,
                        cornerRadius: 6,
                        callbacks: {
                          label: (context) => `₹${context.parsed.y.toLocaleString('en-IN')}`
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'
                        },
                        ticks: {
                          callback: (value) => `₹${value.toLocaleString('en-IN')}`,
                          font: {
                            size: 10
                          },
                          color: theme === 'dark' ? '#9ca3af' : '#374151'
                        }
                      },
                      x: {
                        grid: {
                          color: theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.3)'
                        },
                        ticks: {
                          font: {
                            size: 10
                          },
                          color: theme === 'dark' ? '#9ca3af' : '#374151'
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400 dark:text-gray-600 mb-4">
                      <FaChartLine className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">No revenue data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Mode Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <FaQrcode className="mr-2 text-purple-600 dark:text-purple-400" />
                  Payment Methods
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Distribution across payment modes</p>
              </div>
              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                {stats?.paymentModeStats?.reduce((sum, p) => sum + p.count, 0) || 0} transactions
              </span>
            </div>
          </div>
          <div className="p-5 md:p-6">
            <div className="h-64 md:h-72 lg:h-80">
              {stats?.paymentModeStats?.length > 0 ? (
                <Doughnut 
                  data={paymentModeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          font: {
                            size: 11,
                            family: "'Inter', sans-serif"
                          },
                          usePointStyle: true,
                          padding: 15,
                          color: theme === 'dark' ? '#f3f4f6' : '#374151',
                        }
                      },
                      tooltip: {
                        backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(17, 24, 39, 0.9)',
                        titleColor: '#f3f4f6',
                        bodyColor: '#f3f4f6',
                        padding: 10,
                        cornerRadius: 6,
                        callbacks: {
                          label: (context) => `${context.label}: ${context.parsed} receipts`
                        }
                      }
                    },
                    cutout: '60%',
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400 dark:text-gray-600 mb-4">
                      <FaQrcode className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">No payment data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Receipts */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 mb-6 md:mb-8 lg:mb-10">
        <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <FaReceipt className="mr-2 text-green-600 dark:text-green-400" />
                Recent Receipts
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Latest receipts generated</p>
            </div>
            <Link
              to="/history"
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-4 py-2 rounded-lg transition-all"
            >
              View All
              <FaArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Receipt No</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Tenant</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Room</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Amount</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Date</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentReceipts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <FaReceipt className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h4 className="text-gray-700 dark:text-gray-300 font-medium mb-2">No receipts yet</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Create your first receipt to get started</p>
                      <Link
                        to="/receipts"
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                      >
                        Create Receipt
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                recentReceipts.map((receipt, index) => (
                  <tr 
                    key={receipt._id} 
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors duration-150 group"
                  >
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 flex items-center justify-center mr-3">
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">{receipt.receiptNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{receipt.tenantName}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{receipt.tenantPhone}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        Room {receipt.roomNumber}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-green-600 dark:text-green-400 text-sm">
                        ₹{receipt.amountPaid?.toLocaleString('en-IN') || '0'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(receipt.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        receipt.sentViaEmail 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          receipt.sentViaEmail ? 'bg-green-500' : 'bg-amber-500'
                        }`}></div>
                        {receipt.sentViaEmail ? 'Emailed' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Link
                          to={`/receipts/${receipt._id}`}
                          className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          title="View"
                        >
                          <FaEye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={async () => {
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
                              
                              toast.success('Receipt downloaded successfully');
                            } catch (error) {
                              toast.error('Failed to download receipt');
                            }
                          }}
                          className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                          title="Download"
                        >
                          <FaDownload className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                          title="Print"
                        >
                          <FaPrint className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[
          {
            title: 'Total Revenue',
            value: `₹${totalRevenue.toLocaleString('en-IN')}`,
            description: 'Revenue this month',
            icon: FaRupeeSign,
            color: 'from-blue-500 to-indigo-600',
            iconBg: 'bg-white/20'
          },
          {
            title: 'Receipts This Month',
            value: monthReceipts,
            description: 'Generated this month',
            icon: FaReceipt,
            color: 'from-emerald-500 to-green-600',
            iconBg: 'bg-white/20'
          },
          {
            title: 'Total Receipts',
            value: totalReceipts,
            description: 'All generated receipts',
            icon: FaChartLine,
            color: 'from-purple-500 to-violet-600',
            iconBg: 'bg-white/20'
          }
        ].map((card, index) => (
          <div 
            key={index} 
            className={`bg-gradient-to-br ${card.color} text-white rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">{card.title}</p>
                <p className="text-2xl md:text-3xl font-bold mb-2">{card.value}</p>
                <p className="text-sm opacity-80">{card.description}</p>
              </div>
              <div className={`p-4 rounded-xl ${card.iconBg} backdrop-blur-sm`}>
                <card.icon className="h-6 w-6 md:h-8 md:w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Dashboard last updated • {new Date().toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p className="mt-1">Need help? Visit our <a href="/help" className="text-blue-600 dark:text-blue-400 hover:underline">help center</a></p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;