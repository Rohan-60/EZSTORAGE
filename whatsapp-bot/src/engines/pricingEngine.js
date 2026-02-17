/**
 * Deterministic Pricing Engine
 * 100% deterministic price calculation - NO AI INVOLVEMENT
 * 
 * This is the core pricing logic for ezstorage.sg
 */

const {
    getBaseRate,
    getDurationDiscount,
    validatePromoCode,
    gstRate,
} = require('../config/pricing');
const logger = require('../utils/logger');

/**
 * Calculate storage pricing quote
 * 
 * @param {object} params - Pricing parameters
 * @param {number} params.sqft - Square footage needed
 * @param {number} params.months - Duration in months
 * @param {string} [params.promoCode] - Optional promotional code
 * @returns {object} Complete pricing breakdown
 */
function calculatePrice({ sqft, months, promoCode = null }) {
    // Validate inputs
    if (!sqft || sqft <= 0) {
        throw new Error('Invalid square footage. Must be greater than 0.');
    }

    if (!months || months <= 0) {
        throw new Error('Invalid duration. Must be at least 1 month.');
    }

    // Round to 2 decimal places for consistency
    sqft = Math.round(sqft * 100) / 100;
    months = Math.round(months);

    logger.info('Calculating pricing:', { sqft, months, promoCode });

    // Step 1: Get base rate
    const baseRate = getBaseRate(sqft);

    // Step 2: Apply duration discount
    const durationDiscountData = getDurationDiscount(months);
    const durationDiscountPercent = durationDiscountData.percent;
    const durationDiscount = baseRate * durationDiscountPercent;

    // Subtotal after duration discount
    let subtotal = baseRate - durationDiscount;

    // Step 3: Apply promotional code (if provided)
    let promoDiscountPercent = 0;
    let promoDiscount = 0;
    let promoDetails = null;

    if (promoCode) {
        promoDetails = validatePromoCode(promoCode);

        if (promoDetails) {
            if (promoDetails.stackable) {
                // Stackable promos apply to subtotal after duration discount
                if (promoDetails.type === 'percentage') {
                    promoDiscountPercent = promoDetails.value;
                    promoDiscount = subtotal * promoDiscountPercent;
                } else if (promoDetails.type === 'fixed') {
                    promoDiscount = promoDetails.value;
                    promoDiscountPercent = promoDiscount / subtotal; // For display
                }
            } else {
                // Non-stackable promos replace duration discount
                // Recalculate from base rate
                subtotal = baseRate; // Reset to base

                if (promoDetails.type === 'percentage') {
                    promoDiscountPercent = promoDetails.value;
                    promoDiscount = baseRate * promoDiscountPercent;
                } else if (promoDetails.type === 'fixed') {
                    promoDiscount = promoDetails.value;
                    promoDiscountPercent = promoDiscount / baseRate; // For display
                }

                // Clear duration discount since it's not stacking
                // durationDiscount is already calculated, we just override the subtotal
            }

            subtotal = subtotal - promoDiscount;
        } else {
            logger.warn(`Invalid promo code provided: ${promoCode}`);
            // Continue without promo - don't throw error
        }
    }

    // Ensure subtotal doesn't go negative
    if (subtotal < 0) {
        subtotal = 0;
    }

    // Step 4: Calculate GST
    const gst = subtotal * gstRate;

    // Step 5: Calculate total
    const total = subtotal + gst;

    // Build quote object
    const quote = {
        sqft,
        months,
        baseRate: parseFloat(baseRate.toFixed(2)),
        durationDiscountPercent: parseFloat(durationDiscountPercent.toFixed(4)),
        durationDiscount: parseFloat(durationDiscount.toFixed(2)),
        promoCode: promoDetails ? promoCode.toUpperCase() : null,
        promoDiscountPercent: parseFloat(promoDiscountPercent.toFixed(4)),
        promoDiscount: parseFloat(promoDiscount.toFixed(2)),
        subtotal: parseFloat(subtotal.toFixed(2)),
        gstRate: parseFloat(gstRate.toFixed(4)),
        gst: parseFloat(gst.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        totalForDuration: parseFloat((total * months).toFixed(2)),
        calculatedAt: new Date().toISOString(),
    };

    logger.info('Pricing calculated successfully:', quote);

    return quote;
}

/**
 * Extract pricing parameters from natural language message
 * Uses regex patterns to find sqft and months
 * 
 * @param {string} message - User message
 * @returns {object|null} { sqft, months, promoCode } or null if not found
 */
function extractPricingParams(message) {
    if (!message || typeof message !== 'string') {
        return null;
    }

    const lowerMessage = message.toLowerCase();
    let sqft = null;
    let months = null;
    let promoCode = null;

    // Pattern 1: Extract square footage
    // Matches: "50 sqft", "50 square feet", "50sq ft", "50 sq. ft."
    const sqftPatterns = [
        /(\d+\.?\d*)\s*(?:sqft|sq\.?\s*ft\.?|square\s*feet?)/i,
        /(\d+\.?\d*)\s*(?:sq|square)/i,
    ];

    for (const pattern of sqftPatterns) {
        const match = message.match(pattern);
        if (match) {
            sqft = parseFloat(match[1]);
            break;
        }
    }

    // Pattern 2: Extract months/duration
    // Matches: "6 months", "6 month", "for 6 months", "12mo"
    const monthPatterns = [
        /(\d+)\s*(?:months?|mo)/i,
        /for\s+(\d+)\s*(?:months?|mo)?/i,
        /(\d+)\s*(?:year|yr)s?/i, // Convert years to months
    ];

    for (const pattern of monthPatterns) {
        const match = message.match(pattern);
        if (match) {
            months = parseInt(match[1]);

            // If pattern matched "year", convert to months
            if (pattern.source.includes('year|yr')) {
                months = months * 12;
            }
            break;
        }
    }

    // Pattern 3: Extract promo code
    // Matches: "promo code FIRST10", "code: FIRST10", "FIRST10 promo"
    const promoPatterns = [
        /(?:promo\s*code|code|promo)[\s:]+([a-zA-Z0-9]+)/i,
        /([a-zA-Z0-9]+)\s*promo/i,
    ];

    for (const pattern of promoPatterns) {
        const match = message.match(pattern);
        if (match) {
            promoCode = match[1].toUpperCase();
            break;
        }
    }

    // Return null if we couldn't extract both sqft and months
    if (!sqft || !months) {
        return null;
    }

    return { sqft, months, promoCode };
}

/**
 * Check if message contains pricing-related numbers
 * @param {string} message
 * @returns {boolean}
 */
function hasPricingIndicators(message) {
    const lowerMessage = message.toLowerCase();

    // Check for sqft indicators
    const hasSqft = /\d+\s*(?:sqft|sq|square)/i.test(message);

    // Check for duration indicators
    const hasMonths = /\d+\s*(?:month|mo|year|yr)/i.test(message);

    return hasSqft || hasMonths;
}

module.exports = {
    calculatePrice,
    extractPricingParams,
    hasPricingIndicators,
};
