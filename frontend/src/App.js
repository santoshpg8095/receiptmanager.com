import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReceiptGenerator from './pages/ReceiptGenerator';
import History from './pages/History';
import Profile from './pages/Profile';
import VerifyReceipt from './pages/VerifyReceipt';
import ReceiptDetails from './pages/ReceiptDetails';
import Email from './pages/Email'; 
import Analytics from './pages/Analytics';
import EditReceipt from './pages/EditReceipt'; 

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

// Layout with Sidebar for authenticated users - Updated for responsive design
const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-bg-secondary overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden md:ml-0">
                <Navbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-bg-secondary pt-0 md:pt-0">
                    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 md:py-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <ThemeProvider>
            <Router>
                <AuthProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: { background: 'var(--bg-surface)', color: 'var(--text-primary)' },
                            success: { duration: 3000, style: { background: 'var(--success)', color: 'var(--text-primary)' } },
                            error: { duration: 4000, style: { background: 'var(--error)', color: 'var(--text-primary)' } },
                        }}
                />

                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify" element={<VerifyReceipt />} />
                    <Route path="/verify/:hash" element={<VerifyReceipt />} />

                    {/* Protected Routes with Dashboard Layout */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Dashboard />
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/receipts" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <ReceiptGenerator />
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/receipts/:id" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <ReceiptDetails />
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/history" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <History />
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/email" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Email />
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/analytics" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Analytics />
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Profile />
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/receipts/edit/:id" element={
  <ProtectedRoute>
    <DashboardLayout>
      <EditReceipt />
    </DashboardLayout>
  </ProtectedRoute>
} />

                    {/* Fallback Route */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </Router>
        </ThemeProvider>
    );
};

export default App;
