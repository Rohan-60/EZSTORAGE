/**
 * Message Controller
 * Orchestrates message processing flow
 */

const { detectIntent } = require('../engines/intentEngine');
const { determineRoute, isInteractiveCallback, extractCallbackPayload } = require('../engines/routingEngine');
const { calculatePrice, extractPricingParams } = require('../engines/pricingEngine');
const { sendTextMessage, sendInteractiveButtons, sendInteractiveList, markMessageAsRead } = require('../services/whatsappService');
const { getAIResponse } = require('../services/claudeService');
const {
    getMainMenuButtons,
    getMainMenuList,
    getPricingPromptButtons,
    getUnitSizesFollowUpButtons,
    getPromotionsFollowUpButtons,
    getQuoteFollowUpButtons,
    parseMenuCallback
} = require('../services/menuService');
const {
    formatWelcomeMessage,
    formatPricingQuote,
    formatBusinessHours,
    formatLocation,
    formatUnitSizes,
    formatPromotions,
    formatHumanEscalation,
    formatErrorMessage,
} = require('../utils/formatter');
const { sanitizeWhatsAppMessage } = require('../utils/sanitizer');
const logger = require('../utils/logger');

/**
 * Process incoming WhatsApp message
 * This is the main orchestration function
 * 
 * @param {object} message - WhatsApp message object
 * @param {string} from - Sender phone number
 * @returns {Promise<void>}
 */
async function processMessage(message, from) {
    try {
        logger.info('Processing message from:', from);

        // Sanitize message
        const sanitizedMessage = sanitizeWhatsAppMessage(message);
        if (!sanitizedMessage) {
            logger.warn('Invalid message structure, skipping');
            return;
        }

        // Mark message as read
        if (message.id) {
            await markMessageAsRead(message.id);
        }

        // Extract message text
        let messageText = '';
        let isCallback = false;
        let callbackPayload = null;

        // Check if this is an interactive button/list callback
        if (isInteractiveCallback(sanitizedMessage)) {
            isCallback = true;
            callbackPayload = extractCallbackPayload(sanitizedMessage);

            // Convert callback to intent
            const intent = parseMenuCallback(callbackPayload);

            logger.info('Interactive callback received:', { callbackPayload, intent });

            // Handle callback as if it were an intent
            await handleDeterministicIntent(intent, from, messageText);
            return;
        }

        // Get text from message
        if (sanitizedMessage.text && sanitizedMessage.text.body) {
            messageText = sanitizedMessage.text.body;
        } else {
            // Unsupported message type
            await sendTextMessage(from, 'Sorry, I can only process text messages at the moment. Please type your question.');
            return;
        }

        logger.info('Message text:', messageText);

        // Step 1: Detect intent
        const intentResult = detectIntent(messageText);
        logger.info('Intent detection result:', intentResult);

        // Step 2: Determine routing
        const routingDecision = determineRoute(intentResult);
        logger.info('Routing decision:', routingDecision);

        // Step 3: Route to appropriate handler
        if (routingDecision.route === 'deterministic') {
            await handleDeterministicIntent(routingDecision.handler, from, messageText);
        } else if (routingDecision.route === 'ai_fallback') {
            await handleAIFallback(from, messageText, intentResult);
        } else {
            // Unknown route - should not happen
            logger.error('Unknown route:', routingDecision);
            await sendTextMessage(from, formatErrorMessage('general'));
        }

    } catch (error) {
        logger.error('Error processing message:', error);
        await sendTextMessage(from, formatErrorMessage('general'));
    }
}

/**
 * Handle deterministic intent
 * Routes to specific handler based on intent
 * 
 * @param {string} intent - Intent name
 * @param {string} from - Sender phone number
 * @param {string} messageText - Original message text
 * @returns {Promise<void>}
 */
async function handleDeterministicIntent(intent, from, messageText) {
    try {
        switch (intent) {
            case 'greeting':
            case 'menu':
                await handleMenu(from);
                break;

            case 'pricing':
                await handlePricing(from, messageText);
                break;

            case 'unit_sizes':
                await handleUnitSizes(from);
                break;

            case 'promotions':
                await handlePromotions(from);
                break;

            case 'business_hours':
                await handleBusinessHours(from);
                break;

            case 'location':
                await handleLocation(from);
                break;

            case 'human':
            case 'human_escalation':
                await handleHumanEscalation(from);
                break;

            default:
                // Unknown intent - show menu
                await handleMenu(from);
                break;
        }
    } catch (error) {
        logger.error('Error in deterministic handler:', error);
        await sendTextMessage(from, formatErrorMessage('general'));
    }
}

/**
 * Handle menu request - show main menu
 */
async function handleMenu(from) {
    const menu = getMainMenuButtons();
    await sendInteractiveButtons(
        from,
        menu.bodyText,
        menu.buttons,
        null,
        menu.footerText
    );
}

/**
 * Handle pricing request
 */
async function handlePricing(from, messageText) {
    // Try to extract pricing parameters from message
    const params = extractPricingParams(messageText);

    if (params) {
        // We have enough information to calculate
        try {
            const quote = calculatePrice(params);
            const formattedQuote = formatPricingQuote(quote);

            // Send quote
            await sendTextMessage(from, formattedQuote);

            // Send follow-up buttons
            const followUp = getQuoteFollowUpButtons();
            await sendInteractiveButtons(
                from,
                followUp.bodyText,
                followUp.buttons
            );
        } catch (error) {
            logger.error('Pricing calculation error:', error);
            await sendTextMessage(from, formatErrorMessage('pricing_error'));

            // Show prompt for correct input
            const prompt = getPricingPromptButtons();
            await sendInteractiveButtons(
                from,
                prompt.bodyText,
                prompt.buttons
            );
        }
    } else {
        // Not enough information - prompt for details
        const prompt = getPricingPromptButtons();
        await sendInteractiveButtons(
            from,
            prompt.bodyText,
            prompt.buttons
        );
    }
}

/**
 * Handle unit sizes request
 */
async function handleUnitSizes(from) {
    await sendTextMessage(from, formatUnitSizes());

    // Send follow-up buttons
    const followUp = getUnitSizesFollowUpButtons();
    await sendInteractiveButtons(
        from,
        followUp.bodyText,
        followUp.buttons
    );
}

/**
 * Handle promotions request
 */
async function handlePromotions(from) {
    await sendTextMessage(from, formatPromotions());

    // Send follow-up buttons
    const followUp = getPromotionsFollowUpButtons();
    await sendInteractiveButtons(
        from,
        followUp.bodyText,
        followUp.buttons
    );
}

/**
 * Handle business hours request
 */
async function handleBusinessHours(from) {
    await sendTextMessage(from, formatBusinessHours());
}

/**
 * Handle location request
 */
async function handleLocation(from) {
    await sendTextMessage(from, formatLocation());
}

/**
 * Handle human escalation request
 */
async function handleHumanEscalation(from) {
    await sendTextMessage(from, formatHumanEscalation());

    // Log escalation for follow-up
    logger.warn('Human escalation requested:', { from });

    // In production, you would:
    // 1. Create a ticket in your CRM
    // 2. Notify support team
    // 3. Store conversation history for context
}

/**
 * Handle AI fallback
 * When confidence is low, use Claude AI
 */
async function handleAIFallback(from, messageText, intentResult) {
    try {
        logger.info('Using AI fallback for message:', messageText);

        // Get AI response with context
        const aiResponse = await getAIResponse(messageText, {
            intent: intentResult.intent,
            confidence: intentResult.confidence,
        });

        // Send AI response
        await sendTextMessage(from, aiResponse);

        // Optionally send menu as follow-up
        // This helps guide the user if AI response isn't satisfactory
        setTimeout(async () => {
            const menu = getMainMenuButtons();
            await sendInteractiveButtons(
                from,
                'Need something else?',
                menu.buttons
            );
        }, 2000); // Delay 2 seconds

    } catch (error) {
        logger.error('AI fallback error:', error);
        await sendTextMessage(from, formatErrorMessage('ai_error'));

        // Show menu as fallback
        await handleMenu(from);
    }
}

module.exports = {
    processMessage,
    handleDeterministicIntent,
    handleAIFallback,
};
