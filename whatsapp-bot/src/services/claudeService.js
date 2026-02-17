/**
 * Claude AI Service
 * Handles AI fallback using Anthropic's Claude API
 */

const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');
const { systemPrompt, fallbackPrompt, pricingPrompt } = require('../config/prompts');

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});

const MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';

/**
 * Get AI response from Claude
 * 
 * @param {string} userMessage - User's message
 * @param {object} [context] - Optional context
 * @param {string} [context.intent] - Detected intent (even if low confidence)
 * @param {number} [context.confidence] - Confidence score
 * @returns {Promise<string>} AI response
 */
async function getAIResponse(userMessage, context = {}) {
    try {
        logger.info('Requesting AI response from Claude:', {
            messageLength: userMessage.length,
            context,
        });

        // Select appropriate system prompt based on context
        let selectedSystemPrompt = systemPrompt;

        // If pricing-related but low confidence, use pricing prompt
        if (context.intent === 'pricing' && context.confidence < 70) {
            selectedSystemPrompt = systemPrompt + '\n\n' + pricingPrompt;
        }

        const message = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 500, // Keep responses concise for WhatsApp
            temperature: 0.7,
            system: selectedSystemPrompt,
            messages: [
                {
                    role: 'user',
                    content: userMessage,
                },
            ],
        });

        const response = message.content[0].text;

        logger.info('AI response received:', {
            responseLength: response.length,
            usage: message.usage,
        });

        return response;
    } catch (error) {
        logger.error('Claude API error:', {
            error: error.message,
            type: error.type,
            status: error.status,
        });

        // Return graceful fallback
        return getFallbackResponse();
    }
}

/**
 * Get AI response with conversation history
 * For more context-aware responses
 * 
 * @param {array} conversationHistory - Array of { role, content } objects
 * @returns {Promise<string>} AI response
 */
async function getAIResponseWithHistory(conversationHistory) {
    try {
        logger.info('Requesting AI response with conversation history:', {
            historyLength: conversationHistory.length,
        });

        const message = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 500,
            temperature: 0.7,
            system: systemPrompt,
            messages: conversationHistory,
        });

        const response = message.content[0].text;

        logger.info('AI response with history received:', {
            responseLength: response.length,
            usage: message.usage,
        });

        return response;
    } catch (error) {
        logger.error('Claude API error (with history):', {
            error: error.message,
        });

        return getFallbackResponse();
    }
}

/**
 * Get a streaming AI response (for future implementation)
 * This would allow real-time responses but requires more complex handling
 * 
 * @param {string} userMessage - User's message
 * @returns {Promise<AsyncGenerator>} Stream of text chunks
 */
async function* getStreamingAIResponse(userMessage) {
    try {
        const stream = await anthropic.messages.stream({
            model: MODEL,
            max_tokens: 500,
            temperature: 0.7,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: userMessage,
                },
            ],
        });

        for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                yield chunk.delta.text;
            }
        }
    } catch (error) {
        logger.error('Claude streaming error:', {
            error: error.message,
        });
        yield getFallbackResponse();
    }
}

/**
 * Get fallback response when AI fails
 * 
 * @returns {string} Fallback message
 */
function getFallbackResponse() {
    return `😔 I'm having trouble processing that right now.\n\n` +
        `Please try:\n` +
        `• Type *menu* to see what I can help with\n` +
        `• Type *human* to speak to our team\n` +
        `• Call us at ${process.env.BUSINESS_PHONE || '+65 1234 5678'}\n\n` +
        `Sorry for the inconvenience!`;
}

/**
 * Check Claude API health
 * Useful for monitoring/health checks
 * 
 * @returns {Promise<boolean>} Whether API is accessible
 */
async function checkAPIHealth() {
    try {
        const message = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 10,
            messages: [
                {
                    role: 'user',
                    content: 'Hello',
                },
            ],
        });

        return true;
    } catch (error) {
        logger.error('Claude API health check failed:', error.message);
        return false;
    }
}

module.exports = {
    getAIResponse,
    getAIResponseWithHistory,
    getStreamingAIResponse,
    getFallbackResponse,
    checkAPIHealth,
};
