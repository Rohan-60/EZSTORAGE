/**
 * Intent Detection Engine
 * Keyword-based intent detection with confidence scoring
 * NO AI INVOLVEMENT - Pure deterministic keyword matching
 */

const { intentKeywords, greetingKeywords } = require('../config/keywords');
const { hasPricingIndicators } = require('./pricingEngine');
const logger = require('../utils/logger');

/**
 * Detect intent from user message
 * Returns intent type and confidence score (0-100)
 * 
 * @param {string} message - User message
 * @returns {object} { intent, confidence, secondaryIntents }
 */
function detectIntent(message) {
    if (!message || typeof message !== 'string') {
        return {
            intent: 'unknown',
            confidence: 0,
            secondaryIntents: [],
        };
    }

    const lowerMessage = message.toLowerCase();
    const words = lowerMessage.split(/\s+/);

    // Check for greetings first
    if (isGreeting(lowerMessage)) {
        return {
            intent: 'greeting',
            confidence: 100,
            secondaryIntents: [],
        };
    }

    // Calculate scores for each intent
    const intentScores = {};

    Object.keys(intentKeywords).forEach((intentName) => {
        intentScores[intentName] = calculateIntentScore(
            lowerMessage,
            words,
            intentKeywords[intentName]
        );
    });

    // Add bonus for pricing if message contains numerical indicators
    if (hasPricingIndicators(message)) {
        intentScores.pricing = (intentScores.pricing || 0) + 25;
    }

    logger.debug('Intent scores:', intentScores);

    // Find the highest scoring intent
    let maxScore = 0;
    let primaryIntent = 'unknown';
    const secondaryIntents = [];

    Object.entries(intentScores).forEach(([intent, score]) => {
        if (score > maxScore) {
            if (primaryIntent !== 'unknown') {
                secondaryIntents.push({ intent: primaryIntent, confidence: maxScore });
            }
            maxScore = score;
            primaryIntent = intent;
        } else if (score > 30) {
            // Capture secondary intents with reasonable confidence
            secondaryIntents.push({ intent, confidence: score });
        }
    });

    // Cap confidence at 100
    const confidence = Math.min(maxScore, 100);

    logger.info('Intent detected:', {
        message: message.substring(0, 50),
        intent: primaryIntent,
        confidence,
    });

    return {
        intent: primaryIntent,
        confidence,
        secondaryIntents: secondaryIntents.sort((a, b) => b.confidence - a.confidence),
    };
}

/**
 * Calculate confidence score for a specific intent
 * 
 * @param {string} message - Full message (lowercase)
 * @param {array} words - Message split into words
 * @param {object} keywords - Keyword configuration for this intent
 * @returns {number} Confidence score
 */
function calculateIntentScore(message, words, keywords) {
    let score = 0;

    // Check primary keywords
    if (keywords.primary) {
        keywords.primary.forEach(({ keyword, weight }) => {
            if (containsKeyword(message, words, keyword)) {
                score += weight;
            }
        });
    }

    // Check secondary keywords
    if (keywords.secondary) {
        keywords.secondary.forEach(({ keyword, weight }) => {
            if (containsKeyword(message, words, keyword)) {
                score += weight;
            }
        });
    }

    // Check promo keywords (for pricing intent)
    if (keywords.promo) {
        keywords.promo.forEach(({ keyword, weight }) => {
            if (containsKeyword(message, words, keyword)) {
                score += weight;
            }
        });
    }

    return score;
}

/**
 * Check if message contains a keyword (word or phrase)
 * 
 * @param {string} message - Full message
 * @param {array} words - Message words
 * @param {string} keyword - Keyword to search for
 * @returns {boolean}
 */
function containsKeyword(message, words, keyword) {
    // If keyword is a phrase (contains space), search in full message
    if (keyword.includes(' ')) {
        return message.includes(keyword);
    }

    // Otherwise, search in words array for exact word match
    return words.includes(keyword);
}

/**
 * Check if message is a greeting
 * 
 * @param {string} message - Message (lowercase)
 * @returns {boolean}
 */
function isGreeting(message) {
    // Check if message starts with greeting or is just a greeting
    for (const greeting of greetingKeywords) {
        if (
            message === greeting ||
            message.startsWith(greeting + ' ') ||
            message.startsWith(greeting + ',')
        ) {
            return true;
        }
    }

    return false;
}

/**
 * Check if confidence meets threshold for deterministic handling
 * 
 * @param {number} confidence - Confidence score
 * @returns {boolean}
 */
function meetsConfidenceThreshold(confidence) {
    const threshold = parseInt(process.env.CONFIDENCE_THRESHOLD) || 70;
    return confidence >= threshold;
}

/**
 * Analyze message for specific entities
 * Helper function to extract additional context
 * 
 * @param {string} message - User message
 * @returns {object} Extracted entities
 */
function extractEntities(message) {
    const entities = {
        hasNumbers: /\d+/.test(message),
        hasEmail: /\S+@\S+\.\S+/.test(message),
        hasPhone: /\+?\d[\d\s-]{8,}/.test(message),
        hasUrl: /https?:\/\/\S+/.test(message),
        questionWords: [],
    };

    // Detect question words
    const questionPatterns = ['what', 'when', 'where', 'who', 'why', 'how', 'which'];
    questionPatterns.forEach((word) => {
        if (message.toLowerCase().includes(word)) {
            entities.questionWords.push(word);
        }
    });

    return entities;
}

module.exports = {
    detectIntent,
    meetsConfidenceThreshold,
    calculateIntentScore,
    isGreeting,
    extractEntities,
};
