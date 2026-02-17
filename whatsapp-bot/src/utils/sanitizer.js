/**
 * Input Sanitizer Utility
 * Prevents injection attacks and cleans user input
 */

/**
 * Sanitize text input by removing potentially dangerous characters
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized input
 */
function sanitizeText(input) {
    if (!input || typeof input !== 'string') {
        return '';
    }

    // Remove null bytes
    let sanitized = input.replace(/\0/g, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    // Limit length to prevent DoS
    const MAX_LENGTH = 5000;
    if (sanitized.length > MAX_LENGTH) {
        sanitized = sanitized.substring(0, MAX_LENGTH);
    }

    return sanitized;
}

/**
 * Sanitize phone number format
 * @param {string} phone - Phone number
 * @returns {string} - Sanitized phone number
 */
function sanitizePhoneNumber(phone) {
    if (!phone || typeof phone !== 'string') {
        return '';
    }

    // Remove all non-digit characters except +
    return phone.replace(/[^\d+]/g, '');
}

/**
 * Sanitize numeric input
 * @param {string|number} input - Numeric input
 * @returns {number|null} - Parsed number or null if invalid
 */
function sanitizeNumber(input) {
    if (input === null || input === undefined || input === '') {
        return null;
    }

    const parsed = parseFloat(input);
    return isNaN(parsed) ? null : parsed;
}

/**
 * Sanitize promo code (alphanumeric only)
 * @param {string} code - Promo code
 * @returns {string} - Sanitized promo code
 */
function sanitizePromoCode(code) {
    if (!code || typeof code !== 'string') {
        return '';
    }

    // Only allow alphanumeric characters
    return code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/**
 * Escape HTML to prevent XSS (though not typically needed for WhatsApp)
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };

    return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Validate and sanitize WhatsApp message object
 * @param {object} message - WhatsApp message object
 * @returns {object|null} - Sanitized message or null if invalid
 */
function sanitizeWhatsAppMessage(message) {
    if (!message || typeof message !== 'object') {
        return null;
    }

    const sanitized = {
        from: sanitizePhoneNumber(message.from),
        id: sanitizeText(message.id),
        timestamp: sanitizeText(message.timestamp),
        type: sanitizeText(message.type),
    };

    // Sanitize text message
    if (message.text && message.text.body) {
        sanitized.text = {
            body: sanitizeText(message.text.body),
        };
    }

    // Sanitize button response
    if (message.button && message.button.payload) {
        sanitized.button = {
            text: sanitizeText(message.button.text),
            payload: sanitizeText(message.button.payload),
        };
    }

    // Sanitize interactive list response
    if (message.interactive) {
        sanitized.interactive = {
            type: sanitizeText(message.interactive.type),
        };

        if (message.interactive.button_reply) {
            sanitized.interactive.button_reply = {
                id: sanitizeText(message.interactive.button_reply.id),
                title: sanitizeText(message.interactive.button_reply.title),
            };
        }

        if (message.interactive.list_reply) {
            sanitized.interactive.list_reply = {
                id: sanitizeText(message.interactive.list_reply.id),
                title: sanitizeText(message.interactive.list_reply.title),
            };
        }
    }

    return sanitized;
}

module.exports = {
    sanitizeText,
    sanitizePhoneNumber,
    sanitizeNumber,
    sanitizePromoCode,
    escapeHtml,
    sanitizeWhatsAppMessage,
};
