/**
 * Main Server Entry Point
 * Production-grade Express server for WhatsApp Business Cloud API integration
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const webhookRoutes = require('./src/routes/webhook');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// ENVIRONMENT VALIDATION
// ============================================
const requiredEnvVars = [
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_ACCESS_TOKEN',
    'WEBHOOK_VERIFY_TOKEN',
    'CLAUDE_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    logger.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
}

// ============================================
// SECURITY MIDDLEWARE
// ============================================
// Helmet adds various HTTP headers for security
app.use(helmet());

// Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute default
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 30, // 30 requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/webhook', limiter); // Apply rate limiting to webhook endpoint

// ============================================
// BODY PARSING MIDDLEWARE
// ============================================
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ============================================
// REQUEST LOGGING MIDDLEWARE
// ============================================
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// ============================================
// ROUTES
// ============================================
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        service: 'WhatsApp Bot - ezstorage.sg',
        status: 'running',
        version: '1.0.0'
    });
});

// WhatsApp webhook routes
app.use('/webhook', webhookRoutes);

// 404 handler - must be after all routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// ============================================
// ERROR HANDLING MIDDLEWARE (must be last)
// ============================================
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================
const server = app.listen(PORT, () => {
    logger.info(`🚀 WhatsApp Bot Server started successfully`);
    logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🌐 Port: ${PORT}`);
    logger.info(`✅ Health check: http://localhost:${PORT}/health`);
    logger.info(`📞 Webhook endpoint: http://localhost:${PORT}/webhook`);
    logger.info(`🤖 AI Model: ${process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022'}`);
    logger.info(`🎯 Confidence threshold: ${process.env.CONFIDENCE_THRESHOLD || 70}%`);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server gracefully');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server gracefully');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit in production, just log
    if (process.env.NODE_ENV === 'development') {
        process.exit(1);
    }
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    // Don't exit in production, just log
    if (process.env.NODE_ENV === 'development') {
        process.exit(1);
    }
});

module.exports = app; // Export for testing
