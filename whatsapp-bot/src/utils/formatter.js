/**
 * Message Formatter Utility
 * Formats messages for WhatsApp with proper styling and emojis
 */

/**
 * Format a welcome message
 * @returns {string}
 */
function formatWelcomeMessage() {
    return `👋 Welcome to *${process.env.BUSINESS_NAME || 'ezstorage.sg'}*!\n\nI'm here to help you with storage solutions. How can I assist you today?`;
}

/**
 * Format pricing quote response
 * @param {object} quote - Quote object from pricing engine
 * @returns {string}
 */
function formatPricingQuote(quote) {
    let message = `📦 *Storage Pricing Quote*\n\n`;
    message += `📏 Size: ${quote.sqft} sqft\n`;
    message += `📅 Duration: ${quote.months} month(s)\n\n`;
    message += `💵 *Pricing Breakdown:*\n`;
    message += `Base Rate: $${quote.baseRate.toFixed(2)}/month\n`;

    if (quote.durationDiscount > 0) {
        message += `Duration Discount: -${(quote.durationDiscountPercent * 100).toFixed(0)}%\n`;
    }

    if (quote.promoDiscount > 0) {
        message += `Promo Discount (${quote.promoCode}): -${(quote.promoDiscountPercent * 100).toFixed(0)}%\n`;
    }

    message += `\nSubtotal: $${quote.subtotal.toFixed(2)}/month\n`;
    message += `GST (9%): $${quote.gst.toFixed(2)}/month\n`;
    message += `\n*Total: $${quote.total.toFixed(2)}/month*\n\n`;

    if (quote.months > 1) {
        message += `📊 *${quote.months}-Month Total: $${(quote.total * quote.months).toFixed(2)}*\n\n`;
    }

    message += `✅ This quote is valid for 7 days.\n`;
    message += `📞 Ready to book? Contact us at ${process.env.BUSINESS_PHONE || '+65 1234 5678'}`;

    return message;
}

/**
 * Format business hours response
 * @returns {string}
 */
function formatBusinessHours() {
    return `🕒 *Business Hours*\n\n${process.env.BUSINESS_HOURS || 'Mon-Fri: 9AM-6PM, Sat: 9AM-1PM, Sun: Closed'}\n\n📞 Phone: ${process.env.BUSINESS_PHONE || '+65 1234 5678'}\n📧 Email: ${process.env.BUSINESS_EMAIL || 'hello@ezstorage.sg'}`;
}

/**
 * Format location information
 * @returns {string}
 */
function formatLocation() {
    return `📍 *Our Location*\n\n${process.env.BUSINESS_LOCATION || '123 Storage Street, Singapore 123456'}\n\n🚗 Free parking available\n🚇 Nearest MRT: [Station Name]\n\n📞 Call us for directions: ${process.env.BUSINESS_PHONE || '+65 1234 5678'}`;
}

/**
 * Format unit sizes information
 * @returns {string}
 */
function formatUnitSizes() {
    return `📦 *Available Unit Sizes*\n\n` +
        `🔹 *Small* (25-50 sqft)\n` +
        `Perfect for: Boxes, seasonal items, small furniture\n\n` +
        `🔹 *Medium* (51-100 sqft)\n` +
        `Perfect for: 1-bedroom apartment, sports equipment\n\n` +
        `🔹 *Large* (101-200 sqft)\n` +
        `Perfect for: 2-3 bedroom home, office equipment\n\n` +
        `🔹 *Extra Large* (200+ sqft)\n` +
        `Perfect for: Full house, commercial inventory\n\n` +
        `💬 Want a quote? Just tell me the size and duration!`;
}

/**
 * Format promotions information
 * @returns {string}
 */
function formatPromotions() {
    return `🎉 *Current Promotions*\n\n` +
        `🏷️ *FIRST10* - 10% off your first month\n` +
        `🏷️ *6MONTH5* - 5% off for 6+ month contracts\n` +
        `🏷️ *12MONTH10* - 10% off for 12+ month contracts\n\n` +
        `💡 *Tip:* Mention the promo code when requesting a quote!\n\n` +
        `📅 All promotions valid until end of month.`;
}

/**
 * Format human escalation message
 * @returns {string}
 */
function formatHumanEscalation() {
    return `👤 *Speak to Our Team*\n\n` +
        `I'll connect you with a human agent!\n\n` +
        `📞 Call us: ${process.env.BUSINESS_PHONE || '+65 1234 5678'}\n` +
        `📧 Email: ${process.env.ESCALATION_EMAIL || 'support@ezstorage.sg'}\n\n` +
        `⏰ Available during business hours:\n` +
        `${process.env.BUSINESS_HOURS || 'Mon-Fri: 9AM-6PM, Sat: 9AM-1PM'}\n\n` +
        `We'll get back to you as soon as possible! 🙏`;
}

/**
 * Format error message for users
 * @param {string} type - Error type
 * @returns {string}
 */
function formatErrorMessage(type = 'general') {
    const errorMessages = {
        general: `😔 Oops! Something went wrong on our end.\n\nPlease try again in a moment, or contact us at ${process.env.BUSINESS_PHONE || '+65 1234 5678'}`,
        invalid_input: `❌ I didn't quite understand that.\n\nCould you please rephrase? Or type *menu* to see available options.`,
        pricing_error: `😔 I couldn't calculate that price.\n\nPlease make sure to specify:\n• Storage size (in sqft)\n• Duration (in months)\n\nExample: "I need 50 sqft for 6 months"`,
        ai_error: `🤖 I'm having trouble processing that request.\n\nWould you like to speak to a human? Reply *human* to connect.`,
    };

    return errorMessages[type] || errorMessages.general;
}

/**
 * Format fallback message when confidence is low
 * @returns {string}
 */
function formatLowConfidenceMessage() {
    return `🤔 I want to make sure I understand you correctly.\n\nCould you provide more details? Or type *menu* to see what I can help with.`;
}

/**
 * Bold text for WhatsApp
 * @param {string} text
 * @returns {string}
 */
function bold(text) {
    return `*${text}*`;
}

/**
 * Italic text for WhatsApp
 * @param {string} text
 * @returns {string}
 */
function italic(text) {
    return `_${text}_`;
}

/**
 * Strikethrough text for WhatsApp
 * @param {string} text
 * @returns {string}
 */
function strikethrough(text) {
    return `~${text}~`;
}

/**
 * Monospace text for WhatsApp
 * @param {string} text
 * @returns {string}
 */
function monospace(text) {
    return `\`\`\`${text}\`\`\``;
}

module.exports = {
    formatWelcomeMessage,
    formatPricingQuote,
    formatBusinessHours,
    formatLocation,
    formatUnitSizes,
    formatPromotions,
    formatHumanEscalation,
    formatErrorMessage,
    formatLowConfidenceMessage,
    bold,
    italic,
    strikethrough,
    monospace,
};
