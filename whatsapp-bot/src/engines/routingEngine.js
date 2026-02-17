/**
 * Routing Engine
 * Routes messages to appropriate handlers based on intent and confidence
 */

const { meetsConfidenceThreshold } = require('./intentEngine');
const logger = require('../utils/logger');

/**
 * Determine routing decision for a message
 * 
 * @param {object} intentResult - Result from intent detection engine
 * @param {string} intentResult.intent - Detected intent
 * @param {number} intentResult.confidence - Confidence score
 * @returns {object} { route, handler, reason }
 */
function determineRoute(intentResult) {
    const { intent, confidence } = intentResult;

    logger.info('Determining route:', { intent, confidence });

    // Special case: Always handle greetings deterministically
    if (intent === 'greeting') {
        return {
            route: 'deterministic',
            handler: 'greeting',
            reason: 'Greeting detected',
        };
    }

    // Special case: Always handle menu requests deterministically
    if (intent === 'menu') {
        return {
            route: 'deterministic',
            handler: 'menu',
            reason: 'Menu request detected',
        };
    }

    // Special case: Always handle human escalation deterministically
    if (intent === 'human') {
        return {
            route: 'deterministic',
            handler: 'human_escalation',
            reason: 'Human escalation requested',
        };
    }

    // Check confidence threshold
    if (meetsConfidenceThreshold(confidence)) {
        // High confidence - use deterministic handler
        return {
            route: 'deterministic',
            handler: intent,
            reason: `High confidence (${confidence}%) for intent: ${intent}`,
        };
    } else {
        // Low confidence - send to AI fallback
        return {
            route: 'ai_fallback',
            handler: 'claude',
            reason: `Low confidence (${confidence}%) - using AI fallback`,
            originalIntent: intent,
        };
    }
}

/**
 * Map intent to specific handler function name
 * 
 * @param {string} intent - Intent name
 * @returns {string} Handler function name
 */
function getHandlerName(intent) {
    const handlerMap = {
        greeting: 'handleGreeting',
        menu: 'handleMenu',
        pricing: 'handlePricing',
        unit_sizes: 'handleUnitSizes',
        promotions: 'handlePromotions',
        business_hours: 'handleBusinessHours',
        location: 'handleLocation',
        human: 'handleHumanEscalation',
        unknown: 'handleUnknown',
    };

    return handlerMap[intent] || 'handleUnknown';
}

/**
 * Validate routing decision
 * Ensures routing decision is valid
 * 
 * @param {object} routingDecision
 * @returns {boolean}
 */
function validateRoutingDecision(routingDecision) {
    if (!routingDecision || typeof routingDecision !== 'object') {
        return false;
    }

    if (!routingDecision.route || !routingDecision.handler) {
        return false;
    }

    const validRoutes = ['deterministic', 'ai_fallback'];
    if (!validRoutes.includes(routingDecision.route)) {
        return false;
    }

    return true;
}

/**
 * Check if intent requires additional parameters
 * Some intents (like pricing) need specific data to provide response
 * 
 * @param {string} intent - Intent name
 * @returns {object} { requiresParams, params }
 */
function getRequiredParams(intent) {
    const paramRequirements = {
        pricing: {
            requiresParams: true,
            params: ['sqft', 'months'],
            optionalParams: ['promoCode'],
        },
        greeting: {
            requiresParams: false,
            params: [],
        },
        menu: {
            requiresParams: false,
            params: [],
        },
        unit_sizes: {
            requiresParams: false,
            params: [],
        },
        promotions: {
            requiresParams: false,
            params: [],
        },
        business_hours: {
            requiresParams: false,
            params: [],
        },
        location: {
            requiresParams: false,
            params: [],
        },
        human: {
            requiresParams: false,
            params: [],
        },
    };

    return paramRequirements[intent] || {
        requiresParams: false,
        params: [],
    };
}

/**
 * Determine if message is a callback from interactive button
 * 
 * @param {object} message - WhatsApp message object
 * @returns {boolean}
 */
function isInteractiveCallback(message) {
    return !!(
        message.interactive ||
        message.button ||
        message.list_reply
    );
}

/**
 * Extract callback payload from interactive message
 * 
 * @param {object} message - WhatsApp message object
 * @returns {string|null} Callback payload
 */
function extractCallbackPayload(message) {
    if (message.interactive && message.interactive.button_reply) {
        return message.interactive.button_reply.id;
    }

    if (message.interactive && message.interactive.list_reply) {
        return message.interactive.list_reply.id;
    }

    if (message.button && message.button.payload) {
        return message.button.payload;
    }

    return null;
}

module.exports = {
    determineRoute,
    getHandlerName,
    validateRoutingDecision,
    getRequiredParams,
    isInteractiveCallback,
    extractCallbackPayload,
};
