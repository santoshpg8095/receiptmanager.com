import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Loader from '../components/Loader';
import { 
  FaChartLine, 
  FaRupeeSign, 
  FaReceipt, 
  FaUsers, 
  FaCalendar,
  FaArrowUp,
  FaArrowDown,
  FaChartBar,
  FaChartPie,
  FaDownload,
  FaFilter,
  FaCalendarAlt,
  FaLightbulb,
  FaUserCheck,
  FaWallet,
  FaPercentage,
  FaAngleUp,
  FaAngleDown
} from 'react-icons/fa';

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
import { Line, Bar, Doughnut } from 'react-chartjs-2';

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

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    stats: {
      totalReceipts: 0,
      currentMonthAmount: 0,
      currentMonthReceipts: 0,
      previousMonthAmount: 0,
      previousMonthReceipts: 0,
      amountChange: 0,
      receiptChange: 0
    },
    paymentModeStats: []
  });
  const [analytics, setAnalytics] = useState([]);
  const [tenantStats, setTenantStats] = useState([]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeInsight, setActiveInsight] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedYear]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes, tenantRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get(`/dashboard/analytics?year=${selectedYear}`),
        api.get('/dashboard/tenants')
      ]);
      
      console.log('Analytics API Response:', {
        stats: statsRes.data,
        analytics: analyticsRes.data,
        tenantStats: tenantRes.data
      });
      
      // Set data with proper defaults
      setStats(statsRes.data || {
        stats: {
          totalReceipts: 0,
          currentMonthAmount: 0,
          currentMonthReceipts: 0,
          previousMonthAmount: 0,
          previousMonthReceipts: 0,
          amountChange: 0,
          receiptChange: 0
        },
        paymentModeStats: []
      });
      setAnalytics(analyticsRes.data || []);
      setTenantStats(tenantRes.data || []);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      // Set comprehensive default data structure
      setStats({
        stats: {
          totalReceipts: 0,
          currentMonthAmount: 0,
          currentMonthReceipts: 0,
          previousMonthAmount: 0,
          previousMonthReceipts: 0,
          amountChange: 0,
          receiptChange: 0
        },
        paymentModeStats: []
      });
      setAnalytics([]);
      setTenantStats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const exportData = (format) => {
    // Simple export functionality
    const data = {
      stats,
      analytics,
      tenantStats,
      exportedAt: new Date().toISOString()
    };
    
    if (format === 'json') {
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = `pg-analytics-${selectedYear}.json`;
      link.click();
    } else if (format === 'csv') {
      // Convert analytics to CSV
      let csv = 'Month,Receipt Count,Total Amount,Average Amount\n';
      analytics.forEach(item => {
        csv += `${item.month},${item.receiptCount || 0},${item.totalAmount || 0},${item.averageAmount || 0}\n`;
      });
      
      const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csv);
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = `pg-analytics-${selectedYear}.csv`;
      link.click();
    }
  };

  // Calculate insights
  const insights = useMemo(() => {
    if (!analytics.length || !tenantStats.length) {
      return [
        {
          id: 1,
          title: 'Revenue Peak',
          value: '₹0',
          description: 'No data available',
          icon: FaChartLine,
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
          textColor: 'text-gray-700'
        },
        {
          id: 2,
          title: 'Avg Receipt Value',
          value: '₹0',
          description: 'No data available',
          icon: FaAngleUp,
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
          textColor: 'text-gray-700'
        },
        {
          id: 3,
          title: 'Top Tenant Contribution',
          value: '0%',
          description: 'No data available',
          icon: FaUserCheck,
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
          textColor: 'text-gray-700'
        },
        {
          id: 4,
          title: 'Growth Rate',
          value: '0%',
          description: 'No data available',
          icon: FaPercentage,
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
          textColor: 'text-gray-700'
        }
      ];
    }
    
    const highestMonth = analytics.reduce((max, curr) => 
      (curr.totalAmount || 0) > (max.totalAmount || 0) ? curr : max, analytics[0]
    );
    
    const averageReceiptValue = (stats?.stats?.currentMonthAmount || 0) / Math.max(stats?.stats?.currentMonthReceipts || 1, 1);
    const previousAverage = (stats?.stats?.previousMonthAmount || 0) / Math.max(stats?.stats?.previousMonthReceipts || 1, 1);
    const avgChange = previousAverage > 0 ? ((averageReceiptValue - previousAverage) / previousAverage) * 100 : 0;
    
    const topTenant = tenantStats[0];
    const totalRevenue = analytics.reduce((sum, month) => sum + (month.totalAmount || 0), 0);
    const topTenantContribution = topTenant && totalRevenue > 0 ? (topTenant.totalPaid / totalRevenue) * 100 : 0;
    
    return [
      {
        id: 1,
        title: 'Revenue Peak',
        value: `₹${(highestMonth.totalAmount || 0).toLocaleString('en-IN')}`,
        description: `Highest revenue in ${highestMonth.month || 'No data'}`,
        icon: FaChartLine,
        color: 'from-emerald-500 to-green-500',
        bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50',
        textColor: 'text-emerald-700'
      },
      {
        id: 2,
        title: 'Avg Receipt Value',
        value: `₹${averageReceiptValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        description: avgChange >= 0 ? `Up ${avgChange.toFixed(1)}% from last month` : `Down ${Math.abs(avgChange).toFixed(1)}% from last month`,
        icon: avgChange >= 0 ? FaAngleUp : FaAngleDown,
        color: avgChange >= 0 ? 'from-blue-500 to-cyan-500' : 'from-orange-500 to-amber-500',
        bgColor: avgChange >= 0 ? 'bg-gradient-to-br from-blue-50 to-cyan-50' : 'bg-gradient-to-br from-orange-50 to-amber-50',
        textColor: avgChange >= 0 ? 'text-blue-700' : 'text-amber-700'
      },
      {
        id: 3,
        title: 'Top Tenant Contribution',
        value: `${topTenantContribution.toFixed(1)}%`,
        description: `${topTenant?._id?.substring(0, 15) || 'N/A'} contributes most`,
        icon: FaUserCheck,
        color: 'from-purple-500 to-violet-500',
        bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
        textColor: 'text-purple-700'
      },
      {
        id: 4,
        title: 'Growth Rate',
        value: `${Math.abs(stats?.stats?.amountChange || 0)}%`,
        description: (stats?.stats?.amountChange || 0) >= 0 ? 'Revenue increased' : 'Revenue decreased',
        icon: (stats?.stats?.amountChange || 0) >= 0 ? FaPercentage : FaAngleDown,
        color: (stats?.stats?.amountChange || 0) >= 0 ? 'from-green-500 to-teal-500' : 'from-rose-500 to-pink-500',
        bgColor: (stats?.stats?.amountChange || 0) >= 0 ? 'bg-gradient-to-br from-green-50 to-teal-50' : 'bg-gradient-to-br from-rose-50 to-pink-50',
        textColor: (stats?.stats?.amountChange || 0) >= 0 ? 'text-green-700' : 'text-rose-700'
      }
    ];
  }, [analytics, tenantStats, stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size="large" />
          <p className="mt-4 text-gray-600">Loading your analytics dashboard...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const revenueChartData = {
    labels: analytics.length > 0 
      ? analytics.map(a => a.month?.substring(0, 3) || '')
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Total Revenue (₹)',
        data: analytics.length > 0 
          ? analytics.map(a => a.totalAmount || 0)
          : Array(12).fill(0),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Receipt Count',
        data: analytics.length > 0 
          ? analytics.map(a => a.receiptCount || 0)
          : Array(12).fill(0),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const receiptTrendData = {
    labels: analytics.length > 0 
      ? analytics.map(a => a.month?.substring(0, 3) || '')
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Receipts Generated',
        data: analytics.length > 0 
          ? analytics.map(a => a.receiptCount || 0)
          : Array(12).fill(0),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const topTenantsData = {
    labels: tenantStats.length > 0 
      ? tenantStats.slice(0, 5).map(t => t._id?.substring(0, 12) + (t._id?.length > 12 ? '...' : '') || 'Unknown')
      : ['No Data'],
    datasets: [
      {
        label: 'Total Paid (₹)',
        data: tenantStats.length > 0 
          ? tenantStats.slice(0, 5).map(t => t.totalPaid || 0)
          : [0],
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

  const paymentMethodData = {
    labels: stats?.paymentModeStats?.length > 0 
      ? stats.paymentModeStats.map(p => p._id?.toUpperCase() || 'Unknown')
      : ['No Data'],
    datasets: [
      {
        label: 'Payment Methods',
        data: stats?.paymentModeStats?.length > 0 
          ? stats.paymentModeStats.map(p => p.count || 0)
          : [0],
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#f3f4f6',
        bodyColor: '#f3f4f6',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            if (isNaN(value)) return 'No data';
            
            if (context.dataset.label.includes('Revenue') || context.dataset.label.includes('Paid')) {
              return `₹${value.toLocaleString('en-IN')}`;
            }
            return `${context.dataset.label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.5)'
        },
        ticks: {
          callback: (value) => {
            if (isNaN(value)) return '₹0';
            return `₹${value.toLocaleString('en-IN')}`;
          },
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(229, 231, 235, 0.3)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: {
            size: 11
          }
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <FaChartLine className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Analytics Dashboard
              </h1>
            </div>
            <p className="text-gray-600 ml-1">Deep insights into your PG revenue and performance metrics</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm px-4 py-3 border border-gray-200">
              <FaCalendarAlt className="text-gray-400" />
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className="bg-transparent border-none focus:ring-0 text-gray-700 font-medium"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => exportData('json')}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FaDownload className="text-gray-600" />
                <span className="font-medium text-gray-700 hidden sm:inline">JSON</span>
              </button>
              <button
                onClick={() => exportData('csv')}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <FaDownload />
                <span className="font-medium hidden sm:inline">CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: 'Total Revenue',
            value: `₹${(stats?.stats?.currentMonthAmount || 0).toLocaleString('en-IN')}`,
            change: stats?.stats?.amountChange || 0,
            icon: FaRupeeSign,
            iconBg: 'from-emerald-500 to-green-500',
            cardBg: 'bg-gradient-to-br from-white to-emerald-50',
            trendIcon: FaAngleUp,
            trendColor: 'text-emerald-600'
          },
          {
            title: 'Total Receipts',
            value: stats?.stats?.totalReceipts || 0,
            change: stats?.stats?.receiptChange || 0,
            icon: FaReceipt,
            iconBg: 'from-blue-500 to-cyan-500',
            cardBg: 'bg-gradient-to-br from-white to-blue-50',
            trendIcon: FaAngleUp,
            trendColor: 'text-blue-600'
          },
          {
            title: 'Active Tenants',
            value: tenantStats.length,
            icon: FaUsers,
            iconBg: 'from-purple-500 to-violet-500',
            cardBg: 'bg-gradient-to-br from-white to-purple-50',
            topTenant: tenantStats[0]?._id?.substring(0, 12) + (tenantStats[0]?._id?.length > 12 ? '...' : '')
          },
          {
            title: 'Avg. Receipt Value',
            value: `₹${(
              (stats?.stats?.currentMonthAmount || 0) / 
              Math.max(stats?.stats?.currentMonthReceipts || 1, 1)
            ).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
            icon: FaChartLine,
            iconBg: 'from-amber-500 to-orange-500',
            cardBg: 'bg-gradient-to-br from-white to-amber-50',
            month: `${months[new Date().getMonth()]} ${selectedYear}`
          }
        ].map((card, index) => (
          <div key={index} className={`${card.cardBg} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.iconBg} shadow-md`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              {card.change !== undefined ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <card.trendIcon className={`${card.trendColor} mr-2`} />
                    <span className={`text-sm font-semibold ${card.trendColor}`}>
                      {Math.abs(card.change)}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">from last month</span>
                </div>
              ) : card.topTenant ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaUserCheck className="text-purple-500 mr-2" />
                    <span className="text-sm text-gray-700">Top: {card.topTenant}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaCalendar className="text-amber-500 mr-2" />
                    <span className="text-sm text-gray-700">{card.month}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Insights */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FaLightbulb className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900">Quick Insights</h2>
          </div>
          <span className="text-sm text-gray-500">Real-time analytics</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`${insight.bgColor} rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
              onClick={() => setActiveInsight(activeInsight === insight.id ? null : insight.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{insight.title}</p>
                  <p className="text-xl font-bold text-gray-900">{insight.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${insight.color}`}>
                  <insight.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className={`text-sm ${insight.textColor} font-medium`}>
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue vs Receipts Chart */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Revenue vs Receipts Trend</h3>
                <p className="text-gray-600 text-sm mt-1">Monthly comparison for {selectedYear}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-sm text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-gray-600">Receipts</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-72 md:h-80">
              <Line 
                data={revenueChartData}
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        {/* Receipt Trends Chart */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Receipt Generation</h3>
                <p className="text-gray-600 text-sm mt-1">Monthly receipt count distribution</p>
              </div>
              <div className="text-sm px-3 py-1 bg-violet-100 text-violet-700 rounded-full font-medium">
                {analytics.reduce((sum, month) => sum + (month.receiptCount || 0), 0)} Total Receipts
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-72 md:h-80">
              <Bar 
                data={receiptTrendData}
                options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(229, 231, 235, 0.5)'
                      },
                      ticks: {
                        callback: (value) => isNaN(value) ? '0' : value
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(229, 231, 235, 0.3)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Tenants Distribution */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Top Tenants Distribution</h3>
                <p className="text-gray-600 text-sm mt-1">By total payment amount</p>
              </div>
              <div className="text-sm text-gray-500">
                Top 5 tenants
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-72 md:h-80">
              <Doughnut 
                data={topTenantsData}
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
                        padding: 20,
                        usePointStyle: true,
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      titleColor: '#f3f4f6',
                      bodyColor: '#f3f4f6',
                      padding: 12,
                      cornerRadius: 8,
                      displayColors: true,
                      callbacks: {
                        label: (context) => `₹${context.parsed.toLocaleString('en-IN')}`
                      }
                    }
                  },
                  cutout: '65%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Payment Methods</h3>
                <p className="text-gray-600 text-sm mt-1">Distribution across payment modes</p>
              </div>
              <div className="text-sm text-gray-500">
                {(stats?.paymentModeStats || []).reduce((sum, p) => sum + (p.count || 0), 0)} transactions
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-72 md:h-80">
              <Doughnut 
                data={paymentMethodData}
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
                        padding: 20,
                        usePointStyle: true,
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      titleColor: '#f3f4f6',
                      bodyColor: '#f3f4f6',
                      padding: 12,
                      cornerRadius: 8,
                      displayColors: true,
                      callbacks: {
                        label: (context) => `${context.label}: ${context.parsed} receipts`
                      }
                    }
                  },
                  cutout: '65%',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Breakdown */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-xl font-bold text-gray-900">Monthly Breakdown - {selectedYear}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Month</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Receipts</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Revenue</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Average</th>
                </tr>
              </thead>
              <tbody>
                {analytics.length > 0 ? (
                  analytics.map((monthData, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-150">
                      <td className="p-4 font-medium text-gray-900">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            (monthData.receiptCount || 0) > 10 ? 'bg-green-500' :
                            (monthData.receiptCount || 0) > 5 ? 'bg-blue-500' : 'bg-gray-300'
                          }`}></div>
                          {monthData.month || 'Unknown'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">{monthData.receiptCount || 0}</span>
                          {index > 0 && analytics[index - 1] && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              (monthData.receiptCount || 0) > (analytics[index - 1].receiptCount || 0) 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {(monthData.receiptCount || 0) > (analytics[index - 1].receiptCount || 0) ? '↗' : '↘'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-green-600">
                          ₹{(monthData.totalAmount || 0).toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-700 font-medium">
                          ₹{(monthData.averageAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      No analytics data available for {selectedYear}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Tenants Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-xl font-bold text-gray-900">Top Tenants</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Tenant</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Total Paid</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Receipts</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">First Payment</th>
                </tr>
              </thead>
              <tbody>
                {tenantStats.length > 0 ? (
                  tenantStats.slice(0, 8).map((tenant, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors duration-150">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm mr-3">
                            {(tenant._id?.charAt(0) || '?').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{tenant._id?.substring(0, 18) || 'Unknown'}{tenant._id?.length > 18 ? '...' : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-green-600">
                          ₹{(tenant.totalPaid || 0).toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {tenant.receiptCount || 0}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">
                          {tenant.firstPayment ? new Date(tenant.firstPayment).toLocaleDateString('en-IN', {
                            month: 'short',
                            year: 'numeric'
                          }) : 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      No tenant data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-gray-500 text-sm">
        <p>Analytics dashboard last updated • {new Date().toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>
    </div>
  );
};

export default Analytics;