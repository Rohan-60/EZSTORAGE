/**
 * Webhook Routes
 * Defines routes for WhatsApp webhook
 */

const express = require('express');
const router = express.Router();
const { handleWebhookVerification, handleIncomingMessage } = require('../controllers/webhookController');
const { validateWebhookVerification, validateWebhookMessage } = require('../middleware/validator');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /webhook
 * Webhook verification endpoint
 * Meta calls this to verify the webhook URL when you set it up
 */
router.get(
    '/',
    validateWebhookVerification,
    asyncHandler(handleWebhookVerification)
);

/**
 * POST /webhook
 * Incoming message endpoint
 * Meta sends messages here
 */
router.post(
    '/',
    validateWebhookMessage,
    asyncHandler(handleIncomingMessage)
);

module.exports = router;
