import React from 'react';
import { ThreeDots, Oval, Rings, TailSpin, Grid } from 'react-loader-spinner';
import { FaSync, FaSpinner, FaHourglassHalf } from 'react-icons/fa';

const Loader = ({ 
  size = 'medium', 
  color = '#3B82F6', 
  text = 'Loading...',
  type = 'dots',
  fullScreen = false,
  showBackground = false,
  textColor = 'text-gray-600',
  className = ''
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'xs':
        return { loader: 20, text: 'text-xs', spacing: 'mt-1', container: 'h-16' };
      case 'small':
        return { loader: 30, text: 'text-sm', spacing: 'mt-2', container: 'h-24' };
      case 'medium':
        return { loader: 50, text: 'text-base', spacing: 'mt-3', container: 'h-32' };
      case 'large':
        return { loader: 70, text: 'text-lg', spacing: 'mt-4', container: 'h-40' };
      case 'xl':
        return { loader: 90, text: 'text-xl', spacing: 'mt-5', container: 'h-48' };
      default:
        return { loader: 50, text: 'text-base', spacing: 'mt-3', container: 'h-32' };
    }
  };

  const getLoaderComponent = () => {
    const { loader: loaderSize } = getSizeConfig();
    
    const loaderProps = {
      color,
      height: loaderSize,
      width: loaderSize,
      ariaLabel: 'loading',
    };

    switch (type) {
      case 'dots':
        return <ThreeDots {...loaderProps} />;
      case 'oval':
        return <Oval {...loaderProps} strokeWidth={5} />;
      case 'rings':
        return <Rings {...loaderProps} />;
      case 'tailspin':
        return <TailSpin {...loaderProps} />;
      case 'grid':
        return <Grid {...loaderProps} />;
      case 'spin':
        return <FaSpinner className="animate-spin" style={{ color, fontSize: loaderSize }} />;
      case 'sync':
        return <FaSync className="animate-spin" style={{ color, fontSize: loaderSize }} />;
      case 'hourglass':
        return <FaHourglassHalf className="animate-pulse" style={{ color, fontSize: loaderSize }} />;
      default:
        return <ThreeDots {...loaderProps} />;
    }
  };

  const getWrapperClass = () => {
    if (fullScreen) {
      return 'min-h-screen';
    }
    return getSizeConfig().container;
  };

  const loaderContent = (
    <div className={`flex flex-col items-center justify-center ${getWrapperClass()} ${className}`}>
      <div className={`${showBackground ? 'p-6 bg-white rounded-2xl shadow-lg border border-gray-100' : ''}`}>
        <div className="relative">
          {getLoaderComponent()}
          
          {/* Pulsing effect for certain loaders */}
          {(type === 'rings' || type === 'grid') && (
            <div className="absolute inset-0 animate-ping opacity-20">
              {getLoaderComponent()}
            </div>
          )}
        </div>
        
        {text && (
          <div className={`${getSizeConfig().spacing} text-center`}>
            <p className={`${getSizeConfig().text} ${textColor} font-medium`}>
              {text}
              <span className="inline-block ml-2 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <span 
                    key={i} 
                    className="animate-bounce inline-block"
                    style={{ 
                      animationDelay: `${i * 0.1}s`,
                      color 
                    }}
                  >
                    .
                  </span>
                ))}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // For fullscreen mode, add background overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50/95 to-gray-100/95 backdrop-blur-sm">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export const PageLoader = ({ 
  text = 'Loading content...',
  type = 'rings',
  showLogo = false,
  subtext = 'Please wait a moment'
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
    <div className="w-full max-w-md">
      <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200">
        {showLogo && (
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center">
              <span className="text-white text-2xl font-bold">R</span>
            </div>
          </div>
        )}
        
        <Loader 
          size="large" 
          type={type}
          color="#3B82F6"
          text={text}
          textColor="text-gray-700"
        />
        
        {subtext && (
          <p className="mt-4 text-sm text-gray-500 animate-pulse">
            {subtext}
          </p>
        )}
        
        {/* Loading progress simulation */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full animate-loading-progress"
              style={{ width: '75%' }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Loading</span>
            <span>Almost there...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ButtonLoader = ({ 
  color = 'white', 
  size = 'small',
  type = 'oval',
  showText = false,
  text = 'Processing...'
}) => {
  const getButtonLoaderSize = () => {
    switch (size) {
      case 'xs': return 16;
      case 'small': return 20;
      case 'medium': return 24;
      case 'large': return 28;
      default: return 20;
    }
  };

  const loaderSize = getButtonLoaderSize();
  
  const loaderProps = {
    color,
    height: loaderSize,
    width: loaderSize,
    ariaLabel: 'button-loading',
  };

  const getLoader = () => {
    switch (type) {
      case 'dots':
        return <ThreeDots {...loaderProps} />;
      case 'oval':
        return <Oval {...loaderProps} strokeWidth={4} />;
      case 'tailspin':
        return <TailSpin {...loaderProps} />;
      case 'spin':
        return <FaSpinner className="animate-spin" style={{ color, fontSize: loaderSize }} />;
      default:
        return <Oval {...loaderProps} strokeWidth={4} />;
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="flex-shrink-0">
        {getLoader()}
      </div>
      {showText && text && (
        <span className="text-sm font-medium" style={{ color }}>
          {text}
        </span>
      )}
    </div>
  );
};

export const InlineLoader = ({ size = 'small', color = '#6B7280' }) => {
  const sizeMap = {
    xs: 12,
    small: 16,
    medium: 20,
    large: 24,
  };

  return (
    <div className="inline-flex items-center">
      <Oval
        color={color}
        height={sizeMap[size] || sizeMap.small}
        width={sizeMap[size] || sizeMap.small}
        strokeWidth={4}
        ariaLabel="inline-loading"
      />
    </div>
  );
};

export const SkeletonLoader = ({ 
  type = 'card',
  count = 1,
  className = ''
}) => {
  const CardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="h-12 w-12 bg-gray-200 rounded-lg ml-4"></div>
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3 animate-pulse">
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const TableSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex space-x-4 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
        ))}
      </div>
      {[...Array(5)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 mb-3">
          {[...Array(4)].map((_, colIndex) => (
            <div key={colIndex} className="h-3 bg-gray-100 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <CardSkeleton />;
      case 'list':
        return <ListSkeleton />;
      case 'table':
        return <TableSkeleton />;
      default:
        return <CardSkeleton />;
    }
  };

  if (count > 1) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(count)].map((_, i) => (
          <div key={i}>
            {renderSkeleton()}
          </div>
        ))}
      </div>
    );
  }

  return <div className={className}>{renderSkeleton()}</div>;
};

export const ProgressLoader = ({ 
  progress = 0, 
  size = 'medium',
  showPercentage = true,
  label = 'Loading',
  color = 'blue'
}) => {
  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3',
  };

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    red: 'from-red-500 to-rose-600',
    purple: 'from-purple-500 to-violet-600',
    yellow: 'from-amber-500 to-orange-600',
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-bold text-gray-900">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size] || sizeClasses.medium}`}>
        <div 
          className={`bg-gradient-to-r ${colorClasses[color] || colorClasses.blue} ${
            sizeClasses[size] || sizeClasses.medium
          } rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

// Responsive loader with adaptive sizing
export const ResponsiveLoader = ({ breakpoint = 'md', ...props }) => {
  const isMobile = window.innerWidth < 768; // Example breakpoint
  
  return (
    <Loader 
      size={isMobile ? 'medium' : 'large'}
      {...props}
    />
  );
};

export default Loader;

// Add custom animation for progress bar
const styles = `
  @keyframes loading-progress {
    0% { width: 0%; }
    50% { width: 75%; }
    100% { width: 100%; }
  }
  
  .animate-loading-progress {
    animation: loading-progress 2s ease-in-out infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}