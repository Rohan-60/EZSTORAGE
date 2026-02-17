/**
 * Menu Service
 * Builds interactive menus for WhatsApp
 */

/**
 * Get main menu interactive buttons
 * 
 * @returns {object} { bodyText, buttons }
 */
function getMainMenuButtons() {
    return {
        bodyText: `🏢 *Welcome to ${process.env.BUSINESS_NAME || 'ezstorage.sg'}*\n\nWhat can I help you with today?`,
        buttons: [
            { id: 'get_pricing', title: '💵 Get Pricing' },
            { id: 'view_units', title: '📦 Unit Sizes' },
            { id: 'speak_human', title: '👤 Speak to Human' },
        ],
        footerText: 'Or just type your question!',
    };
}

/**
 * Get comprehensive main menu as interactive list
 * 
 * @returns {object} { bodyText, buttonText, sections }
 */
function getMainMenuList() {
    return {
        bodyText: `🏢 *Welcome to ${process.env.BUSINESS_NAME || 'ezstorage.sg'}*\n\nSelect what you'd like to know more about:`,
        buttonText: 'View Options',
        sections: [
            {
                title: 'Pricing & Units',
                rows: [
                    {
                        id: 'get_pricing',
                        title: '💵 Get Pricing',
                        description: 'Calculate your storage cost',
                    },
                    {
                        id: 'view_units',
                        title: '📦 Unit Sizes',
                        description: 'See available unit sizes',
                    },
                    {
                        id: 'promotions',
                        title: '🎉 Promotions',
                        description: 'View current deals',
                    },
                ],
            },
            {
                title: 'Information',
                rows: [
                    {
                        id: 'business_hours',
                        title: '🕒 Business Hours',
                        description: 'Our operating hours',
                    },
                    {
                        id: 'location',
                        title: '📍 Location',
                        description: 'Find us',
                    },
                ],
            },
            {
                title: 'Support',
                rows: [
                    {
                        id: 'speak_human',
                        title: '👤 Speak to Human',
                        description: 'Connect with our team',
                    },
                ],
            },
        ],
        footerText: 'Or just type your question!',
    };
}

/**
 * Get pricing prompt buttons
 * 
 * @returns {object} { bodyText, buttons }
 */
function getPricingPromptButtons() {
    return {
        bodyText: `💵 *Get Your Storage Quote*\n\nTo calculate pricing, I need:\n• Storage size (in sqft)\n• Duration (in months)\n• Promo code (optional)\n\nExample: "I need 50 sqft for 6 months with code FIRST10"`,
        buttons: [
            { id: 'view_units', title: '📦 See Unit Sizes' },
            { id: 'promotions', title: '🎉 View Promos' },
            { id: 'main_menu', title: '⬅️ Main Menu' },
        ],
    };
}

/**
 * Get unit sizes follow-up buttons
 * 
 * @returns {object} { bodyText, buttons }
 */
function getUnitSizesFollowUpButtons() {
    return {
        bodyText: `Would you like a pricing quote?`,
        buttons: [
            { id: 'get_pricing', title: '💵 Get Pricing' },
            { id: 'promotions', title: '🎉 View Promos' },
            { id: 'main_menu', title: '⬅️ Main Menu' },
        ],
    };
}

/**
 * Get promotions follow-up buttons
 * 
 * @returns {object} { bodyText, buttons }
 */
function getPromotionsFollowUpButtons() {
    return {
        bodyText: `Ready to get a quote with your promo code?`,
        buttons: [
            { id: 'get_pricing', title: '💵 Get Pricing' },
            { id: 'view_units', title: '📦 Unit Sizes' },
            { id: 'main_menu', title: '⬅️ Main Menu' },
        ],
    };
}

/**
 * Get quote follow-up buttons
 * 
 * @returns {object} { bodyText, buttons }
 */
function getQuoteFollowUpButtons() {
    return {
        bodyText: `What would you like to do next?`,
        buttons: [
            { id: 'speak_human', title: '👤 Book Now' },
            { id: 'get_pricing', title: '🔄 New Quote' },
            { id: 'main_menu', title: '⬅️ Main Menu' },
        ],
    };
}

/**
 * Parse callback payload from interactive menus
 * 
 * @param {string} payload - Callback payload
 * @returns {string} Intent to route to
 */
function parseMenuCallback(payload) {
    const callbackMap = {
        'get_pricing': 'pricing',
        'view_units': 'unit_sizes',
        'promotions': 'promotions',
        'business_hours': 'business_hours',
        'location': 'location',
        'speak_human': 'human',
        'main_menu': 'menu',
    };

    return callbackMap[payload] || 'unknown';
}

module.exports = {
    getMainMenuButtons,
    getMainMenuList,
    getPricingPromptButtons,
    getUnitSizesFollowUpButtons,
    getPromotionsFollowUpButtons,
    getQuoteFollowUpButtons,
    parseMenuCallback,
};
