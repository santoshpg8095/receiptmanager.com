import React from 'react';
import { 
  FaArrowUp, 
  FaArrowDown, 
  FaReceipt, 
  FaRupeeSign, 
  FaUsers, 
  FaCheckCircle,
  FaChartLine,
  FaInfoCircle
} from 'react-icons/fa';

const StatsCard = ({ title, value, change, icon, type = 'default', description, loading = false }) => {
  const getIcon = () => {
    const iconProps = { className: "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" };
    
    switch (icon) {
      case 'receipts':
        return <FaReceipt {...iconProps} />;
      case 'revenue':
        return <FaRupeeSign {...iconProps} />;
      case 'users':
        return <FaUsers {...iconProps} />;
      case 'verified':
        return <FaCheckCircle {...iconProps} />;
      case 'trend':
        return <FaChartLine {...iconProps} />;
      default:
        return <FaReceipt {...iconProps} />;
    }
  };

  const getCardStyles = () => {
    const baseStyles = "relative border rounded-xl p-4 sm:p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300`;
      case 'warning':
        return `${baseStyles} bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300`;
      case 'danger':
        return `${baseStyles} bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:border-red-300`;
      case 'info':
        return `${baseStyles} bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300`;
      case 'premium':
        return `${baseStyles} bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:border-purple-300`;
      default:
        return `${baseStyles} bg-white border-gray-200 hover:border-gray-300`;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-700';
      case 'warning':
        return 'text-amber-700';
      case 'danger':
        return 'text-red-700';
      case 'info':
        return 'text-blue-700';
      case 'premium':
        return 'text-purple-700';
      default:
        return 'text-gray-700';
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-br from-green-500 to-emerald-600';
      case 'warning':
        return 'bg-gradient-to-br from-amber-500 to-orange-600';
      case 'danger':
        return 'bg-gradient-to-br from-red-500 to-rose-600';
      case 'info':
        return 'bg-gradient-to-br from-blue-500 to-indigo-600';
      case 'premium':
        return 'bg-gradient-to-br from-purple-500 to-violet-600';
      default:
        return 'bg-gradient-to-br from-gray-600 to-gray-700';
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-br from-green-100 to-emerald-100';
      case 'warning':
        return 'bg-gradient-to-br from-amber-100 to-orange-100';
      case 'danger':
        return 'bg-gradient-to-br from-red-100 to-rose-100';
      case 'info':
        return 'bg-gradient-to-br from-blue-100 to-indigo-100';
      case 'premium':
        return 'bg-gradient-to-br from-purple-100 to-violet-100';
      default:
        return 'bg-gradient-to-br from-gray-100 to-gray-200';
    }
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (icon === 'revenue') {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          notation: 'compact',
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        }).format(val);
      }
      
      // Format large numbers with K/M suffixes
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
      
      return val.toLocaleString('en-IN');
    }
    return val;
  };

  const getChangeIcon = () => {
    if (change === undefined) return null;
    
    const iconClass = "w-3 h-3 sm:w-4 sm:h-4";
    
    if (change > 20) {
      return <FaChartLine className={`${iconClass} text-green-500 rotate-45`} />;
    } else if (change > 0) {
      return <FaArrowUp className={`${iconClass} text-green-500`} />;
    } else if (change < -20) {
      return <FaChartLine className={`${iconClass} text-red-500 -rotate-45`} />;
    } else if (change < 0) {
      return <FaArrowDown className={`${iconClass} text-red-500`} />;
    }
    return <FaChartLine className={`${iconClass} text-gray-500`} />;
  };

  const getChangeText = () => {
    if (change === undefined) return '';
    
    let text = `${Math.abs(change)}%`;
    if (change > 20) text += ' 📈';
    else if (change < -20) text += ' 📉';
    
    return text;
  };

  if (loading) {
    return (
      <div className={`${getCardStyles()} animate-pulse`}>
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={getCardStyles()}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 truncate flex items-center">
            {title}
            {description && (
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                title={description}
              >
                <FaInfoCircle className="w-3 h-3" />
              </button>
            )}
          </p>
          
          {/* Main Value - Responsive font sizes */}
          <div className="flex items-baseline mt-2">
            <p className={`text-2xl sm:text-3xl md:text-4xl font-bold ${getTextColor()} truncate`}>
              {formatValue(value)}
            </p>
            
            {/* Change Indicator */}
            {change !== undefined && (
              <div className="ml-3 flex items-center">
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  change >= 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getChangeIcon()}
                  <span className="ml-1 hidden xs:inline">
                    {getChangeText()}
                  </span>
                  <span className="ml-1 xs:hidden">
                    {Math.abs(change)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Icon Container - Responsive sizing */}
        <div className={`ml-4 p-3 sm:p-4 rounded-xl ${getIconBgColor()} flex-shrink-0`}>
          <div className={`p-2 sm:p-3 rounded-lg ${getAccentColor()} text-white`}>
            {getIcon()}
          </div>
        </div>
      </div>
      
      {/* Footer with trend line */}
      {change !== undefined && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <span className="hidden sm:inline">From last month</span>
              <span className="sm:hidden">vs last month</span>
            </div>
            
            {/* Trend visualization */}
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => {
                let barHeight = 'h-1';
                if (change >= 0) {
                  barHeight = i < 4 ? 'h-2' : 'h-3';
                } else {
                  barHeight = i > 0 ? 'h-2' : 'h-3';
                }
                
                return (
                  <div
                    key={i}
                    className={`w-1 ${barHeight} rounded-full ${
                      change >= 0 
                        ? 'bg-gradient-to-t from-green-400 to-green-500' 
                        : 'bg-gradient-to-t from-red-400 to-red-500'
                    }`}
                  ></div>
                );
              })}
            </div>
          </div>
          
          {/* Detailed change info - Hidden on mobile, shown on tablet+ */}
          <div className="hidden sm:block mt-2">
            <p className="text-xs text-gray-600">
              {change >= 0 ? (
                <>
                  <span className="font-medium text-green-600">+{change}% increase</span> compared to previous period
                </>
              ) : (
                <>
                  <span className="font-medium text-red-600">{change}% decrease</span> compared to previous period
                </>
              )}
            </p>
          </div>
        </div>
      )}
      
      {/* Additional info for premium/important cards */}
      {type === 'premium' && (
        <div className="absolute top-2 right-2">
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
            Premium
          </span>
        </div>
      )}
      
      {/* Interactive overlay for hover effects */}
      <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none">
        <div className={`w-full h-full ${getAccentColor()}`}></div>
      </div>
    </div>
  );
};

// Responsive grid container for multiple stats cards
export const StatsGrid = ({ children, cols = 1 }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  return (
    <div className={`grid ${gridCols[cols]} gap-4 sm:gap-6`}>
      {children}
    </div>
  );
};

// Example usage component
export const StatsDashboard = () => {
  const statsData = [
    {
      title: "Total Revenue",
      value: 1250000,
      change: 12.5,
      icon: "revenue",
      type: "success",
      description: "Total revenue generated this month"
    },
    {
      title: "Active Tenants",
      value: 42,
      change: 5.2,
      icon: "users",
      type: "info",
      description: "Currently active tenants"
    },
    {
      title: "Receipts Generated",
      value: 156,
      change: 8.3,
      icon: "receipts",
      type: "default",
      description: "Receipts created this month"
    },
    {
      title: "Verified Receipts",
      value: 148,
      change: -2.1,
      icon: "verified",
      type: "premium",
      description: "Receipts verified by tenants"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Real-time statistics and insights</p>
        </div>
        <div className="mt-3 sm:mt-0">
          <span className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
            Updated just now
          </span>
        </div>
      </div>
      
      {/* Stats Grid - Responsive layout */}
      <StatsGrid cols={4}>
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </StatsGrid>
    </div>
  );
};

export default StatsCard;