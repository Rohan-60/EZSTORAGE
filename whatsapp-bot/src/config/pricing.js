/**
 * Pricing Configuration
 * Deterministic pricing rules for ezstorage.sg
 * 
 * CRITICAL: NO AI INVOLVEMENT
 * All pricing calculations are 100% deterministic
 */

/**
 * Base pricing tiers by square footage
 * This should be migrated to database for production
 */
const baseRates = [
    { minSqft: 0, maxSqft: 25, ratePerSqft: 10.0 },
    { minSqft: 26, maxSqft: 50, ratePerSqft: 9.0 },
    { minSqft: 51, maxSqft: 75, ratePerSqft: 8.5 },
    { minSqft: 76, maxSqft: 100, ratePerSqft: 8.0 },
    { minSqft: 101, maxSqft: 150, ratePerSqft: 7.5 },
    { minSqft: 151, maxSqft: 200, ratePerSqft: 7.0 },
    { minSqft: 201, maxSqft: Infinity, ratePerSqft: 6.5 },
];

/**
 * Duration-based discounts
 * Longer commitments get better rates
 */
const durationDiscounts = [
    { minMonths: 1, maxMonths: 2, discount: 0.0 },    // No discount
    { minMonths: 3, maxMonths: 5, discount: 0.03 },   // 3% off
    { minMonths: 6, maxMonths: 11, discount: 0.05 },  // 5% off
    { minMonths: 12, maxMonths: 23, discount: 0.10 }, // 10% off
    { minMonths: 24, maxMonths: Infinity, discount: 0.15 }, // 15% off
];

/**
 * Promotional codes
 * stackable: whether this promo can be combined with duration discounts
 */
const promoCodes = {
    'FIRST10': {
        type: 'percentage',
        value: 0.10,
        stackable: true,
        description: '10% off first month',
    },
    'SUMMER20': {
        type: 'percentage',
        value: 0.20,
        stackable: false,
        description: '20% off (cannot stack with other discounts)',
    },
    'WINTER15': {
        type: 'percentage',
        value: 0.15,
        stackable: true,
        description: '15% off',
    },
    'STORAGE50': {
        type: 'fixed',
        value: 50.0,
        stackable: true,
        description: '$50 flat discount',
    },
    'LONGTERM': {
        type: 'percentage',
        value: 0.08,
        stackable: true,
        description: '8% off for long-term storage',
    },
};

/**
 * GST rate (Singapore)
 */
const gstRate = 0.09; // 9%

/**
 * Get base rate for given square footage
 * @param {number} sqft
 * @returns {number}
 */
function getBaseRate(sqft) {
    const tier = baseRates.find(
        (tier) => sqft >= tier.minSqft && sqft <= tier.maxSqft
    );

    if (!tier) {
        throw new Error(`Invalid square footage: ${sqft}`);
    }

    return sqft * tier.ratePerSqft;
}

/**
 * Get duration discount for given months
 * @param {number} months
 * @returns {object} { discount, percent }
 */
function getDurationDiscount(months) {
    const tier = durationDiscounts.find(
        (tier) => months >= tier.minMonths && months <= tier.maxMonths
    );

    if (!tier) {
        return { discount: 0, percent: 0 };
    }

    return { discount: tier.discount, percent: tier.discount };
}

/**
 * Validate promo code
 * @param {string} code
 * @returns {object|null}
 */
function validatePromoCode(code) {
    if (!code) return null;

    const upperCode = code.toUpperCase();
    return promoCodes[upperCode] || null;
}

module.exports = {
    baseRates,
    durationDiscounts,
    promoCodes,
    gstRate,
    getBaseRate,
    getDurationDiscount,
    validatePromoCode,
};
