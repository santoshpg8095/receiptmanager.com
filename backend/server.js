const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const emailRoutes = require('./routes/emailRoutes');
const profileRoutes = require('./routes/profileRoutes');
// ADD THIS NEW IMPORT
const passwordResetRoutes = require('./routes/passwordResetRoutes'); // 👈 Add this line

// Import middleware
const { apiLimiter } = require('./middleware/rateLimiter');

// Import database connection
const connectDB = require('./config/db');

// Initialize Express
const app = express();

// Connect to database
connectDB();

/* ==========================
   Security Middleware
========================== */

app.use(helmet());

// Allow multiple frontend URLs
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS Error: ${origin} is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

/* ==========================
   Body Parsers
========================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ==========================
   Rate Limiter
========================== */

app.use(apiLimiter);

/* ==========================
   API Routes
========================== */

app.use('/api/auth', authRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/profile', profileRoutes);
// ADD THIS NEW ROUTE
app.use('/api/password-reset', passwordResetRoutes); // 👈 Add this line

/* ==========================
   Health Check
========================== */

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/* ==========================
   404 Handler
========================== */

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API Route not found'
    });
});

/* ==========================
   Error Handler
========================== */

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development'
            ? err.stack
            : undefined
    });
});

/* ==========================
   Start Server
========================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

/* ==========================
   Handle Unhandled Rejections
========================== */

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});