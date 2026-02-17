/**
 * Webhook Controller
 * Handles WhatsApp webhook verification and incoming messages
 */

const { processMessage } = require('./messageController');
const logger = require('../utils/logger');

/**
 * Handle webhook verification (GET request)
 * Meta sends this to verify the webhook URL
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function handleWebhookVerification(req, res) {
    try {
        // The challenge is already validated by middleware
        // and attached to req.challenge
        const challenge = req.challenge;

        logger.info('Webhook verification successful');

        // Respond with the challenge to complete verification
        res.status(200).send(challenge);
    } catch (error) {
        logger.error('Webhook verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
}

/**
 * Handle incoming webhook messages (POST request)
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
async function handleIncomingMessage(req, res) {
    try {
        const body = req.body;

        logger.debug('Webhook payload received:', JSON.stringify(body, null, 2));

        // Respond immediately to WhatsApp (required within 20 seconds)
        res.status(200).send('EVENT_RECEIVED');

        // Process the webhook payload
        // WhatsApp can send multiple entries in one webhook
        if (body.entry && Array.isArray(body.entry)) {
            for (const entry of body.entry) {
                // Each entry can have multiple changes
                if (entry.changes && Array.isArray(entry.changes)) {
                    for (const change of entry.changes) {
                        // We're interested in 'messages' field value
                        if (change.field === 'messages') {
                            await processWebhookChange(change.value);
                        }
                    }
                }
            }
        }
    } catch (error) {
        logger.error('Error handling incoming message:', error);
        // Note: We already sent 200 response, so we can't send error to WhatsApp
        // Errors are logged for monitoring
    }
}

/**
 * Process a webhook change
 * Extracts messages and passes to message controller
 * 
 * @param {object} value - Webhook change value
 */
async function processWebhookChange(value) {
    try {
        // Check if there are messages
        if (!value.messages || !Array.isArray(value.messages)) {
            logger.debug('No messages in webhook change');
            return;
        }

        // Get metadata
        const metadata = value.metadata;
        const phoneNumberId = metadata?.phone_number_id;

        logger.info('Processing webhook change:', {
            phoneNumberId,
            messageCount: value.messages.length,
        });

        // Process each message
        for (const message of value.messages) {
            const from = message.from; // Sender phone number
            const messageId = message.id;
            const timestamp = message.timestamp;

            logger.info('Incoming message:', {
                from,
                messageId,
                type: message.type,
                timestamp,
            });

            // Filter out status updates and other non-message types
            // We only want to process actual messages
            const validMessageTypes = ['text', 'interactive', 'button'];

            if (!validMessageTypes.includes(message.type)) {
                logger.info('Skipping non-text message type:', message.type);
                continue;
            }

            // Check if this is a message we sent (to avoid loops)
            // Messages from the business will have direction: 'outgoing'
            // But typically webhook only sends received messages
            // This is an extra safety check
            if (value.metadata?.display_phone_number === from) {
                logger.info('Skipping message from business phone');
                continue;
            }

            // Process the message
            await processMessage(message, from);
        }

        // Process statuses (read receipts, delivery confirmations, etc.)
        if (value.statuses && Array.isArray(value.statuses)) {
            for (const status of value.statuses) {
                logger.debug('Message status update:', {
                    id: status.id,
                    status: status.status,
                    timestamp: status.timestamp,
                });

                // In production, you might want to update delivery status in database
                // For now, we just log it
            }
        }

    } catch (error) {
        logger.error('Error processing webhook change:', error);
    }
}

module.exports = {
    handleWebhookVerification,
    handleIncomingMessage,
};
