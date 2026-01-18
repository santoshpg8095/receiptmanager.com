const Receipt = require('../models/Receipt');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonthNumber = now.getMonth() + 1;
        
        console.log('=== DASHBOARD STATS START ===');
        console.log('User ID:', req.user.id);
        console.log('Current year:', currentYear, 'Current month:', currentMonthNumber);
        
        // Get ALL receipts for this user FIRST
        const allReceipts = await Receipt.find({ user: req.user.id });
        console.log('Total receipts found:', allReceipts.length);
        
        if (allReceipts.length === 0) {
            console.log('No receipts found for user');
            return res.json({
                stats: {
                    totalReceipts: 0,
                    currentMonthReceipts: 0,
                    prevMonthReceipts: 0,
                    receiptChange: 0,
                    currentMonthAmount: 0,
                    prevMonthAmount: 0,
                    amountChange: 0
                },
                yearlyStats: [],
                paymentModeStats: [],
                recentReceipts: []
            });
        }
        
        // Log first receipt details for debugging
        const firstReceipt = allReceipts[0];
        console.log('First receipt details:', {
            _id: firstReceipt._id,
            month: firstReceipt.month,
            year: firstReceipt.year,
            amountPaid: firstReceipt.amountPaid,
            paymentMode: firstReceipt.paymentMode,
            createdAt: firstReceipt.createdAt
        });
        
        // Total receipts count
        const totalReceipts = allReceipts.length;
        
        // Get month names for conversion
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Calculate current month stats
        const currentMonthName = monthNames[currentMonthNumber - 1];
        const currentMonthReceipts = allReceipts.filter(receipt => 
            receipt.month === currentMonthName && receipt.year === currentYear
        );
        
        const currentMonthAmount = currentMonthReceipts.reduce((sum, r) => sum + (r.amountPaid || 0), 0);
        
        // Calculate previous month stats
        const prevMonthNumber = currentMonthNumber === 1 ? 12 : currentMonthNumber - 1;
        const prevMonthYear = currentMonthNumber === 1 ? currentYear - 1 : currentYear;
        const prevMonthName = monthNames[prevMonthNumber - 1];
        
        const prevMonthReceipts = allReceipts.filter(receipt => 
            receipt.month === prevMonthName && receipt.year === prevMonthYear
        );
        
        const prevMonthAmount = prevMonthReceipts.reduce((sum, r) => sum + (r.amountPaid || 0), 0);
        
        // Calculate percentage changes
        const receiptChange = prevMonthReceipts.length > 0 
            ? ((currentMonthReceipts.length - prevMonthReceipts.length) / prevMonthReceipts.length * 100).toFixed(1)
            : currentMonthReceipts.length > 0 ? 100 : 0;
        
        let amountChange = 0;
        if (prevMonthAmount > 0) {
            amountChange = ((currentMonthAmount - prevMonthAmount) / prevMonthAmount * 100).toFixed(1);
        } else if (currentMonthAmount > 0) {
            amountChange = 100;
        }
        
        // YEARLY STATS - SIMPLE JAVASCRIPT VERSION
        console.log('Calculating yearly stats from all receipts...');
        
        // Get current year receipts
        const currentYearReceipts = allReceipts.filter(receipt => 
            receipt.year === currentYear || (receipt.year && receipt.year.toString() === currentYear.toString())
        );
        
        console.log(`Current year (${currentYear}) receipts:`, currentYearReceipts.length);
        
        // Group by month for current year
        const monthlyData = {};
        currentYearReceipts.forEach(receipt => {
            const month = receipt.month;
            if (month) {
                if (!monthlyData[month]) {
                    monthlyData[month] = {
                        totalAmount: 0,
                        receiptCount: 0
                    };
                }
                monthlyData[month].totalAmount += receipt.amountPaid || 0;
                monthlyData[month].receiptCount += 1;
            }
        });
        
        console.log('Monthly data grouped:', monthlyData);
        
        // Create complete yearly stats array
        const yearlyStats = monthNames.map(monthName => {
            const data = monthlyData[monthName];
            return {
                month: monthName,
                totalAmount: data ? data.totalAmount : 0,
                receiptCount: data ? data.receiptCount : 0
            };
        });
        
        // PAYMENT MODE STATS
        const paymentModeData = {};
        allReceipts.forEach(receipt => {
            const mode = receipt.paymentMode || 'other';
            if (!paymentModeData[mode]) {
                paymentModeData[mode] = {
                    count: 0,
                    totalAmount: 0
                };
            }
            paymentModeData[mode].count += 1;
            paymentModeData[mode].totalAmount += receipt.amountPaid || 0;
        });
        
        const paymentModeStats = Object.entries(paymentModeData).map(([mode, data]) => ({
            _id: mode,
            count: data.count,
            totalAmount: data.totalAmount
        }));
        
        // Recent receipts
        const recentReceipts = allReceipts
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(receipt => ({
                _id: receipt._id,
                receiptNumber: receipt.receiptNumber,
                tenantName: receipt.tenantName,
                amountPaid: receipt.amountPaid,
                createdAt: receipt.createdAt,
                forMonth: receipt.forMonth,
                sentViaEmail: receipt.sentViaEmail,
                roomNumber: receipt.roomNumber,
                tenantPhone: receipt.tenantPhone
            }));
        
        // Prepare response
        const statsData = {
            stats: {
                totalReceipts,
                currentMonthReceipts: currentMonthReceipts.length,
                prevMonthReceipts: prevMonthReceipts.length,
                receiptChange: parseFloat(receiptChange),
                currentMonthAmount,
                prevMonthAmount,
                amountChange: parseFloat(amountChange)
            },
            yearlyStats,
            paymentModeStats,
            recentReceipts
        };
        
        console.log('=== DASHBOARD STATS RESPONSE ===');
        console.log('Stats:', statsData.stats);
        console.log('Yearly stats (first 3 months):', yearlyStats.slice(0, 3));
        console.log('Payment modes:', paymentModeStats);
        console.log('Recent receipts count:', recentReceipts.length);
        console.log('=== DASHBOARD STATS END ===');
        
        res.json(statsData);
        
    } catch (error) {
        console.error('=== DASHBOARD STATS ERROR ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        console.error('=== DASHBOARD STATS ERROR END ===');
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Get monthly analytics
// @route   GET /api/dashboard/analytics
// @access  Private
const getMonthlyAnalytics = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;
        console.log('=== ANALYTICS REQUEST ===');
        console.log('User ID:', req.user.id);
        console.log('Requested year:', year);
        
        // Get all receipts for the user
        const allReceipts = await Receipt.find({ user: req.user.id });
        console.log('Total receipts found:', allReceipts.length);
        
        if (allReceipts.length === 0) {
            console.log('No receipts found, returning empty analytics');
            return res.json([]);
        }
        
        // Filter receipts for the requested year
        const yearReceipts = allReceipts.filter(receipt => {
            const receiptYear = receipt.year;
            return receiptYear && receiptYear.toString() === year.toString();
        });
        
        console.log(`Receipts for year ${year}:`, yearReceipts.length);
        
        if (yearReceipts.length === 0) {
            console.log(`No receipts for year ${year}, returning empty array`);
            return res.json([]);
        }
        
        // Group receipts by month
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const monthlyData = {};
        
        // Initialize all months with zeros
        monthNames.forEach(month => {
            monthlyData[month] = {
                totalAmount: 0,
                receiptCount: 0,
                averageAmount: 0
            };
        });
        
        // Fill with actual data
        yearReceipts.forEach(receipt => {
            const month = receipt.month;
            if (month && monthlyData[month]) {
                monthlyData[month].totalAmount += receipt.amountPaid || 0;
                monthlyData[month].receiptCount += 1;
            }
        });
        
        // Calculate average and prepare response
        const completeAnalytics = monthNames.map(monthName => {
            const data = monthlyData[monthName];
            const average = data.receiptCount > 0 ? data.totalAmount / data.receiptCount : 0;
            
            return {
                month: monthName,
                totalAmount: data.totalAmount,
                receiptCount: data.receiptCount,
                averageAmount: average
            };
        });
        
        console.log('Analytics response (first 3 months):', completeAnalytics.slice(0, 3));
        console.log('=== ANALYTICS END ===');
        
        res.json(completeAnalytics);
        
    } catch (error) {
        console.error('=== ANALYTICS ERROR ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        console.error('=== ANALYTICS ERROR END ===');
        res.status(500).json({ 
            message: 'Server error in analytics',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Get tenant statistics
// @route   GET /api/dashboard/tenants
// @access  Private
const getTenantStats = async (req, res) => {
    try {
        console.log('=== TENANT STATS START ===');
        console.log('User ID:', req.user.id);
        
        // Get all receipts for the user
        const allReceipts = await Receipt.find({ user: req.user.id });
        console.log('Total receipts found:', allReceipts.length);
        
        if (allReceipts.length === 0) {
            console.log('No receipts found, returning empty tenant stats');
            return res.json([]);
        }
        
        // Group receipts by tenant
        const tenantData = {};
        
        allReceipts.forEach(receipt => {
            const tenantName = receipt.tenantName;
            if (!tenantName) return;
            
            if (!tenantData[tenantName]) {
                tenantData[tenantName] = {
                    totalPaid: 0,
                    receiptCount: 0,
                    firstPayment: new Date(receipt.createdAt),
                    lastPayment: new Date(receipt.createdAt)
                };
            }
            
            tenantData[tenantName].totalPaid += receipt.amountPaid || 0;
            tenantData[tenantName].receiptCount += 1;
            
            const receiptDate = new Date(receipt.createdAt);
            if (receiptDate < tenantData[tenantName].firstPayment) {
                tenantData[tenantName].firstPayment = receiptDate;
            }
            if (receiptDate > tenantData[tenantName].lastPayment) {
                tenantData[tenantName].lastPayment = receiptDate;
            }
        });
        
        // Convert to array and sort by total paid
        const tenantStats = Object.entries(tenantData)
            .map(([tenantName, data]) => ({
                _id: tenantName,
                totalPaid: data.totalPaid,
                receiptCount: data.receiptCount,
                firstPayment: data.firstPayment,
                lastPayment: data.lastPayment
            }))
            .sort((a, b) => b.totalPaid - a.totalPaid)
            .slice(0, 10); // Limit to top 10
        
        console.log('Tenant stats generated:', tenantStats.length);
        if (tenantStats.length > 0) {
            console.log('Top tenant:', tenantStats[0]);
        }
        console.log('=== TENANT STATS END ===');
        
        res.json(tenantStats);
        
    } catch (error) {
        console.error('=== TENANT STATS ERROR ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        console.error('=== TENANT STATS ERROR END ===');
        res.status(500).json({ 
            message: 'Server error in tenant stats',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

module.exports = {
    getDashboardStats,
    getMonthlyAnalytics,
    getTenantStats
};