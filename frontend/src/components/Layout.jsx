import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar - Fixed position for mobile */}
      {user && <Sidebar />}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden md:ml-0">
        {/* Navbar */}
        <Navbar />

        {/* Main Content Area - Add padding for mobile to account for fixed sidebar button */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 pt-0 md:pt-0">
          <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 md:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;