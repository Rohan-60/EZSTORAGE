/**
 * Request Validator Middleware
 * Validates incoming WhatsApp webhook requests
 */

const logger = require('../utils/logger');
const { badRequest } = require('./errorHandler');

/**
 * Validate WhatsApp webhook GET request (verification)
 */
function validateWebhookVerification(req, res, next) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (!mode || !token) {
        logger.warn('Webhook verification failed: missing parameters');
        return next(badRequest('Missing verification parameters'));
    }

    if (mode !== 'subscribe') {
        logger.warn('Webhook verification failed: invalid mode');
        return next(badRequest('Invalid mode'));
    }

    if (token !== process.env.WEBHOOK_VERIFY_TOKEN) {
        logger.warn('Webhook verification failed: token mismatch');
        return next(badRequest('Invalid verify token'));
    }

    // Validation successful - attach challenge to request
    req.challenge = challenge;
    next();
}

/**
 * Validate WhatsApp webhook POST request (incoming messages)
 */
function validateWebhookMessage(req, res, next) {
    const body = req.body;

    // Basic structure validation
    if (!body || !body.object) {
        logger.warn('Invalid webhook payload: missing object');
        return next(badRequest('Invalid webhook payload'));
    }

    if (body.object !== 'whatsapp_business_account') {
        logger.warn('Invalid webhook payload: wrong object type');
        return next(badRequest('Invalid object type'));
    }

    if (!body.entry || !Array.isArray(body.entry)) {
        logger.warn('Invalid webhook payload: missing entry array');
        return next(badRequest('Invalid entry structure'));
    }

    // Optional: Verify webhook signature (recommended for production)
    // This requires the App Secret from Meta
    // if (!verifyWebhookSignature(req)) {
    //   logger.warn('Webhook signature verification failed');
    //   return next(unauthorized('Invalid signature'));
    // }

    next();
}

/**
 * Verify webhook signature (optional but recommended)
 * Requires WHATSAPP_APP_SECRET in environment variables
 * 
 * @param {object} req - Express request object
 * @returns {boolean} - Whether signature is valid
 */
function verifyWebhookSignature(req) {
    const signature = req.headers['x-hub-signature-256'];

    if (!signature) {
        return false;
    }

    // Only verify if app secret is configured
    if (!process.env.WHATSAPP_APP_SECRET) {
        logger.warn('WHATSAPP_APP_SECRET not configured, skipping signature verification');
        return true; // Skip verification if not configured
    }

    const crypto = require('crypto');
    const expectedSignature = crypto
        .createHmac('sha256', process.env.WHATSAPP_APP_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');

    const signatureHash = signature.split('sha256=')[1];

    return crypto.timingSafeEqual(
        Buffer.from(signatureHash, 'hex'),
        Buffer.from(expectedSignature, 'hex')
    );
}

/**
 * Rate limiting configuration for webhook endpoint
 * This is exported for use in server.js
 */
const rateLimitConfig = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
};

module.exports = {
    validateWebhookVerification,
    validateWebhookMessage,
    verifyWebhookSignature,
    rateLimitConfig,
};
