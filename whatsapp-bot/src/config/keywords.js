/**
 * Intent Keywords Configuration
 * Keywords for intent detection engine
 */

/**
 * Keyword mappings for different intents
 * Each keyword has a weight that contributes to confidence score
 */
const intentKeywords = {
    // Pricing intent keywords
    pricing: {
        primary: [
            { keyword: 'price', weight: 60 },
            { keyword: 'cost', weight: 60 },
            { keyword: 'rate', weight: 60 },
            { keyword: 'how much', weight: 60 },
            { keyword: 'pricing', weight: 60 },
            { keyword: 'quote', weight: 60 },
            { keyword: 'expensive', weight: 50 },
            { keyword: 'cheap', weight: 50 },
            { keyword: 'afford', weight: 50 },
            { keyword: 'budget', weight: 50 },
        ],
        secondary: [
            { keyword: 'sqft', weight: 20 },
            { keyword: 'square feet', weight: 20 },
            { keyword: 'square foot', weight: 20 },
            { keyword: 'month', weight: 20 },
            { keyword: 'months', weight: 20 },
            { keyword: 'year', weight: 20 },
            { keyword: 'duration', weight: 15 },
            { keyword: 'rent', weight: 15 },
        ],
        promo: [
            { keyword: 'promo', weight: 15 },
            { keyword: 'discount', weight: 15 },
            { keyword: 'code', weight: 10 },
            { keyword: 'promotion', weight: 15 },
            { keyword: 'deal', weight: 15 },
            { keyword: 'offer', weight: 15 },
        ],
    },

    // Unit sizes intent keywords
    unit_sizes: {
        primary: [
            { keyword: 'size', weight: 70 },
            { keyword: 'unit', weight: 60 },
            { keyword: 'space', weight: 60 },
            { keyword: 'big', weight: 50 },
            { keyword: 'small', weight: 50 },
            { keyword: 'large', weight: 50 },
            { keyword: 'medium', weight: 50 },
            { keyword: 'available', weight: 40 },
            { keyword: 'dimensions', weight: 60 },
        ],
    },

    // Promotions intent keywords
    promotions: {
        primary: [
            { keyword: 'promotion', weight: 70 },
            { keyword: 'promo', weight: 70 },
            { keyword: 'discount', weight: 70 },
            { keyword: 'deal', weight: 70 },
            { keyword: 'offer', weight: 70 },
            { keyword: 'special', weight: 50 },
            { keyword: 'sale', weight: 60 },
        ],
    },

    // Business hours intent keywords
    business_hours: {
        primary: [
            { keyword: 'hours', weight: 70 },
            { keyword: 'open', weight: 70 },
            { keyword: 'close', weight: 70 },
            { keyword: 'when', weight: 50 },
            { keyword: 'time', weight: 50 },
            { keyword: 'operating', weight: 60 },
            { keyword: 'business hours', weight: 80 },
            { keyword: 'working hours', weight: 80 },
        ],
    },

    // Location intent keywords
    location: {
        primary: [
            { keyword: 'location', weight: 80 },
            { keyword: 'where', weight: 70 },
            { keyword: 'address', weight: 80 },
            { keyword: 'direction', weight: 70 },
            { keyword: 'find', weight: 50 },
            { keyword: 'map', weight: 60 },
            { keyword: 'navigate', weight: 60 },
        ],
    },

    // Human escalation intent keywords
    human: {
        primary: [
            { keyword: 'human', weight: 90 },
            { keyword: 'person', weight: 80 },
            { keyword: 'agent', weight: 80 },
            { keyword: 'staff', weight: 70 },
            { keyword: 'representative', weight: 80 },
            { keyword: 'speak', weight: 60 },
            { keyword: 'talk', weight: 60 },
            { keyword: 'call', weight: 50 },
            { keyword: 'contact', weight: 50 },
        ],
    },

    // Menu/help intent keywords
    menu: {
        primary: [
            { keyword: 'menu', weight: 90 },
            { keyword: 'help', weight: 80 },
            { keyword: 'options', weight: 70 },
            { keyword: 'start', weight: 60 },
            { keyword: 'begin', weight: 60 },
            { keyword: 'hi', weight: 40 },
            { keyword: 'hello', weight: 40 },
        ],
    },
};

/**
 * Greeting keywords (trigger welcome message)
 */
const greetingKeywords = [
    'hi',
    'hello',
    'hey',
    'good morning',
    'good afternoon',
    'good evening',
    'greetings',
    'start',
    'begin',
];

/**
 * Affirmative keywords (yes responses)
 */
const affirmativeKeywords = [
    'yes',
    'yeah',
    'yep',
    'sure',
    'ok',
    'okay',
    'correct',
    'right',
    'confirm',
    'agreed',
];

/**
 * Negative keywords (no responses)
 */
const negativeKeywords = [
    'no',
    'nope',
    'nah',
    'not',
    'never',
    'cancel',
    'stop',
];

module.exports = {
    intentKeywords,
    greetingKeywords,
    affirmativeKeywords,
    negativeKeywords,
};
