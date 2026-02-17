/**
 * WhatsApp Business Cloud API Service
 * Handles all WhatsApp API interactions
 */

const axios = require('axios');
const logger = require('../utils/logger');

// WhatsApp API configuration
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Send a text message to a WhatsApp user
 * 
 * @param {string} to - Recipient phone number
 * @param {string} message - Message text
 * @returns {Promise<object>} API response
 */
async function sendTextMessage(to, message) {
    try {
        const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;

        const data = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'text',
            text: {
                preview_url: false,
                body: message,
            },
        };

        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
            },
        });

        logger.info('Text message sent successfully:', {
            to,
            messageId: response.data.messages[0].id,
        });

        return response.data;
    } catch (error) {
        logger.error('Failed to send text message:', {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}

/**
 * Send an interactive button message
 * 
 * @param {string} to - Recipient phone number
 * @param {string} bodyText - Message body
 * @param {array} buttons - Array of button objects { id, title }
 * @param {string} [headerText] - Optional header text
 * @param {string} [footerText] - Optional footer text
 * @returns {Promise<object>} API response
 */
async function sendInteractiveButtons(to, bodyText, buttons, headerText = null, footerText = null) {
    try {
        const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;

        // WhatsApp limits to max 3 buttons
        if (buttons.length > 3) {
            throw new Error('WhatsApp supports maximum 3 buttons');
        }

        const interactive = {
            type: 'button',
            body: {
                text: bodyText,
            },
            action: {
                buttons: buttons.map((btn, index) => ({
                    type: 'reply',
                    reply: {
                        id: btn.id || `btn_${index}`,
                        title: btn.title.substring(0, 20), // Max 20 chars
                    },
                })),
            },
        };

        // Add optional header
        if (headerText) {
            interactive.header = {
                type: 'text',
                text: headerText,
            };
        }

        // Add optional footer
        if (footerText) {
            interactive.footer = {
                text: footerText,
            };
        }

        const data = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'interactive',
            interactive: interactive,
        };

        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
            },
        });

        logger.info('Interactive button message sent successfully:', {
            to,
            messageId: response.data.messages[0].id,
        });

        return response.data;
    } catch (error) {
        logger.error('Failed to send interactive buttons:', {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}

/**
 * Send an interactive list message
 * 
 * @param {string} to - Recipient phone number
 * @param {string} bodyText - Message body
 * @param {string} buttonText - Button text (what user clicks to see list)
 * @param {array} sections - Array of section objects { title, rows: [{ id, title, description }] }
 * @param {string} [headerText] - Optional header text
 * @param {string} [footerText] - Optional footer text
 * @returns {Promise<object>} API response
 */
async function sendInteractiveList(to, bodyText, buttonText, sections, headerText = null, footerText = null) {
    try {
        const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;

        const interactive = {
            type: 'list',
            body: {
                text: bodyText,
            },
            action: {
                button: buttonText.substring(0, 20), // Max 20 chars
                sections: sections.map((section) => ({
                    title: section.title,
                    rows: section.rows.map((row) => ({
                        id: row.id,
                        title: row.title.substring(0, 24), // Max 24 chars
                        description: row.description ? row.description.substring(0, 72) : undefined, // Max 72 chars
                    })),
                })),
            },
        };

        // Add optional header
        if (headerText) {
            interactive.header = {
                type: 'text',
                text: headerText,
            };
        }

        // Add optional footer
        if (footerText) {
            interactive.footer = {
                text: footerText,
            };
        }

        const data = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'interactive',
            interactive: interactive,
        };

        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
            },
        });

        logger.info('Interactive list message sent successfully:', {
            to,
            messageId: response.data.messages[0].id,
        });

        return response.data;
    } catch (error) {
        logger.error('Failed to send interactive list:', {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}

/**
 * Mark a message as read
 * 
 * @param {string} messageId - Message ID to mark as read
 * @returns {Promise<object>} API response
 */
async function markMessageAsRead(messageId) {
    try {
        const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;

        const data = {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
        };

        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
            },
        });

        logger.debug('Message marked as read:', { messageId });

        return response.data;
    } catch (error) {
        logger.error('Failed to mark message as read:', {
            error: error.message,
            messageId,
        });
        // Don't throw - this is not critical
    }
}

/**
 * Send a reaction to a message
 * 
 * @param {string} to - Recipient phone number
 * @param {string} messageId - Message ID to react to
 * @param {string} emoji - Emoji to react with
 * @returns {Promise<object>} API response
 */
async function sendReaction(to, messageId, emoji) {
    try {
        const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;

        const data = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'reaction',
            reaction: {
                message_id: messageId,
                emoji: emoji,
            },
        };

        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
            },
        });

        logger.debug('Reaction sent:', { to, emoji });

        return response.data;
    } catch (error) {
        logger.error('Failed to send reaction:', {
            error: error.message,
        });
        // Don't throw - this is not critical
    }
}

module.exports = {
    sendTextMessage,
    sendInteractiveButtons,
    sendInteractiveList,
    markMessageAsRead,
    sendReaction,
};
