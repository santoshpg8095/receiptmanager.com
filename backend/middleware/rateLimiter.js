const rateLimit = require('express-rate-limit');

// Create a simple in-memory store rate limiter
const createLimiter = (windowMs, max, message, skipSuccessful = false) => {
    return rateLimit({
        windowMs,
        max,
        message,
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: skipSuccessful
    });
};

// General API rate limiter
const apiLimiter = createLimiter(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per 15 minutes
    'Too many requests from this IP, please try again after 15 minutes'
);

// Receipt generation limiter
const receiptLimiter = createLimiter(
    60 * 60 * 1000, // 1 hour
    50, // 50 receipts per hour
    'Too many receipt generation attempts, please try again later'
);

// Login attempt limiter
const loginLimiter = createLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // 5 login attempts per 15 minutes
    'Too many login attempts, please try again after 15 minutes',
    true // Skip counting successful requests
);

module.exports = { apiLimiter, receiptLimiter, loginLimiter };