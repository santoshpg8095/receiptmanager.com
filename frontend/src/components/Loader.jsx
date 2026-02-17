import React from 'react';
import { ThreeDots, Oval, Rings, TailSpin, Grid } from 'react-loader-spinner';
import { FaSpinner } from 'react-icons/fa';

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

  // -----------------------------
  // Lightsaber Loader Component
  // -----------------------------
  const LightsaberLoader = () => (
    <div id="loader">
      <div className="ls-particles ls-part-1"></div>
      <div className="ls-particles ls-part-2"></div>
      <div className="ls-particles ls-part-3"></div>
      <div className="ls-particles ls-part-4"></div>
      <div className="ls-particles ls-part-5"></div>

      <div className="lightsaber ls-left ls-green"></div>
      <div className="lightsaber ls-right ls-red"></div>

      {/* CSS injected here */}
      <style>{`
        #loader {
          position: relative;
          height: 100px;
          width: 100px;
        }

        .lightsaber {
          position: absolute;
          height: 10px;
          width: 100px;
          border-radius: 5px;
          top: 45px;
          animation: clash 1.2s infinite ease-in-out;
        }

        .ls-left {
          left: -10px;
          transform-origin: right;
          animation-delay: 0s;
        }

        .ls-right {
          right: -10px;
          transform-origin: left;
          animation-delay: 0.6s;
        }

        /* Colors */
        .ls-green {
          background: linear-gradient(90deg, #0f0, #7fff7f);
          box-shadow: 0 0 15px #0f0;
        }

        .ls-red {
          background: linear-gradient(270deg, #f00, #ff7f7f);
          box-shadow: 0 0 15px #f00;
        }

        @keyframes clash {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(25deg); }
          100% { transform: rotate(0deg); }
        }

        .ls-particles {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: yellow;
          opacity: 0;
          animation: spark 1s infinite ease-in-out;
        }

        .ls-part-1 { top: 40px; left: 45px; animation-delay: 0.1s; }
        .ls-part-2 { top: 50px; left: 55px; animation-delay: 0.2s; }
        .ls-part-3 { top: 45px; left: 65px; animation-delay: 0.3s; }
        .ls-part-4 { top: 55px; left: 50px; animation-delay: 0.4s; }
        .ls-part-5 { top: 48px; left: 60px; animation-delay: 0.5s; }

        @keyframes spark {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.3); }
          100% { opacity: 0; transform: scale(0.5); }
        }
      `}</style>
    </div>
  );

  // -----------------------------
  // Size Configuration
  // -----------------------------
  const getSizeConfig = () => {
    switch (size) {
      case 'xs': return { loader: 20, text: 'text-xs', spacing: 'mt-1' };
      case 'small': return { loader: 30, text: 'text-sm', spacing: 'mt-2' };
      case 'medium': return { loader: 50, text: 'text-base', spacing: 'mt-3' };
      case 'large': return { loader: 70, text: 'text-lg', spacing: 'mt-4' };
      case 'xl': return { loader: 90, text: 'text-xl', spacing: 'mt-5' };
      default: return { loader: 50, text: 'text-base', spacing: 'mt-3' };
    }
  };

  // -----------------------------
  // Loader Type Switch
  // -----------------------------
  const getLoaderComponent = () => {
    const { loader: loaderSize } = getSizeConfig();

    const loaderProps = {
      color,
      height: loaderSize,
      width: loaderSize,
      ariaLabel: 'loading',
    };

    switch (type) {
      case 'dots': return <ThreeDots {...loaderProps} />;
      case 'oval': return <Oval {...loaderProps} strokeWidth={5} />;
      case 'rings': return <Rings {...loaderProps} />;
      case 'tailspin': return <TailSpin {...loaderProps} />;
      case 'grid': return <Grid {...loaderProps} />;
      case 'spin': return <FaSpinner className="animate-spin" style={{ color, fontSize: loaderSize }} />;
      case 'lightsaber': return <LightsaberLoader />;
      default: return <ThreeDots {...loaderProps} />;
    }
  };

  // -----------------------------
  // Render Component
  // -----------------------------
  const { spacing, text: textSize } = getSizeConfig();

  return (
    <div
      className={`flex flex-col items-center justify-center ${fullScreen ? "fixed inset-0" : ""} 
      ${showBackground ? "bg-black/10 backdrop-blur-sm" : ""} ${className}`}
    >
      {getLoaderComponent()}
      {text && <p className={`${spacing} ${textSize} ${textColor}`}>{text}</p>}
    </div>
  );
};

export default Loader;
