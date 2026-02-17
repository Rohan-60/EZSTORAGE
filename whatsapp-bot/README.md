# WhatsApp Customer Service Bot - ezstorage.sg

Production-grade WhatsApp automation system with hybrid deterministic + AI architecture.

## 🎯 Overview

This is **NOT** a simple chatbot. This is an enterprise-grade customer service bot designed for:
- ✅ **100% deterministic pricing** - No AI involved in calculations
- ✅ **Keyword-based intent detection** with confidence scoring
- ✅ **AI fallback** (Claude) for complex or ambiguous queries
- ✅ **Interactive menus** for easy navigation
- ✅ **Human escalation** option
- ✅ **Production-ready** with security, logging, and error handling

## 🏗️ Architecture

```
User (WhatsApp) → WhatsApp Business Cloud API → Express Webhook
    ↓
Message Router
    ├── Intent Engine (keyword-based)
    ├── Confidence Scorer (0-100%)
    ├── Deterministic Handlers (confidence >= 70%)
    │   ├── Pricing Calculator (NO AI)
    │   ├── Unit Sizes
    │   ├── Promotions
    │   ├── Business Info
    │   └── Human Escalation
    └── AI Fallback (Claude) (confidence < 70%)
```

## 📋 Prerequisites

1. **Node.js** >= 18.0.0
2. **npm** >= 9.0.0
3. **WhatsApp Business Cloud API** credentials:
   - Meta Developer Account
   - WhatsApp Business Account
   - Phone Number ID
   - Access Token
   - Webhook Verify Token (you create this)
4. **Claude API Key** from Anthropic
5. **Public HTTPS endpoint** for webhook (use ngrok for local development)

## 🚀 Quick Start

### 1. Installation

```bash
cd whatsapp-bot
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# WhatsApp Business Cloud API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token

# Webhook verification token (choose any random string)
WEBHOOK_VERIFY_TOKEN=your_secret_verification_token

# Claude API
CLAUDE_API_KEY=your_claude_api_key

# Optional: adjust these as needed
CONFIDENCE_THRESHOLD=70
PORT=3000
```

### 3. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will start on `http://localhost:3000`

### 4. Expose Webhook (Local Development)

Use ngrok to expose your local server:

```bash
ngrok http 3000
```

You'll get a public URL like: `https://abc123.ngrok.io`

### 5. Configure WhatsApp Webhook

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Navigate to your app → WhatsApp → Configuration
3. Edit webhook settings:
   - **Callback URL**: `https://your-ngrok-url.ngrok.io/webhook`
   - **Verify Token**: The same value you set in `WEBHOOK_VERIFY_TOKEN`
4. Subscribe to `messages` webhook field
5. Click "Verify and Save"

### 6. Test the Bot

Send a WhatsApp message to your test number:
- "Hello" → Main menu
- "How much for 50 sqft for 6 months?" → Pricing quote
- "What sizes do you have?" → Unit sizes
- "Promotions" → Current deals
- "Speak to human" → Escalation

## 📁 Project Structure

```
whatsapp-bot/
├── src/
│   ├── config/           # Configuration files
│   │   ├── pricing.js    # Pricing tiers, promos (deterministic)
│   │   ├── keywords.js   # Intent keywords with weights
│   │   └── prompts.js    # Claude AI system prompts
│   ├── controllers/      # Request handlers
│   │   ├── webhookController.js    # Webhook verification & routing
│   │   └── messageController.js    # Main orchestration
│   ├── engines/          # Core logic engines
│   │   ├── pricingEngine.js   # Deterministic pricing (NO AI)
│   │   ├── intentEngine.js    # Keyword-based intent detection
│   │   └── routingEngine.js   # Message routing logic
│   ├── services/         # External API integrations
│   │   ├── whatsappService.js  # WhatsApp Cloud API
│   │   ├── claudeService.js    # Claude AI API
│   │   └── menuService.js      # Interactive menus
│   ├── middleware/       # Express middleware
│   │   ├── errorHandler.js    # Global error handling
│   │   └── validator.js       # Request validation
│   ├── utils/            # Utilities
│   │   ├── logger.js          # Winston logger
│   │   ├── sanitizer.js       # Input sanitization
│   │   └── formatter.js       # Message formatting
│   └── routes/           # Express routes
│       └── webhook.js         # Webhook routes
├── server.js              # Express server entry point
├── package.json           # Dependencies
├── .env.example           # Environment template
└── README.md              # This file
```

## 🎨 Features

### ✅ Deterministic Pricing
- NO AI involvement in calculations
- Tiered pricing by square footage
- Duration-based discounts
- Promotional code stacking
- GST calculation (9%)
- Natural language parameter extraction

### ✅ Intent Detection
- Keyword-based matching
- Weighted confidence scoring (0-100%)
- Multi-intent detection
- Configurable confidence threshold

### ✅ Interactive Menus
- Main menu with buttons
- List menus for comprehensive options
- Follow-up prompts
- Guided conversations

### ✅ AI Fallback
- Claude 3.5 Sonnet integration
- Activates when confidence < 70%
- Instructed to NEVER invent pricing
- Graceful error handling

### ✅ Production Security
- Input sanitization
- Rate limiting
- Error handling
- Request validation
- Signature verification (optional)

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/health
```

### Webhook Verification
```bash
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=test"
```

### Send Test Message
Use WhatsApp to send messages to your test number.

## 📊 Monitoring & Logs

Logs are outputted to:
- **Console** (development)
- **Files** (production):
  - `logs/error.log` - Errors only
  - `logs/combined.log` - All logs

Configure log level in `.env`:
```env
LOG_LEVEL=info  # error | warn | info | debug
```

## 🔧 Customization

### Update Pricing
Edit `src/config/pricing.js`:
- Base rates per sqft tiers
- Duration discounts
- Promo codes
- GST rate

### Add New Intents
1. Add keywords to `src/config/keywords.js`
2. Add handler in `src/controllers/messageController.js`
3. Add response formatter in `src/utils/formatter.js`

### Modify AI Behavior
Edit Claude system prompt in `src/config/prompts.js`

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick deploy options:**
- Railway (recommended for startups)
- Render
- AWS EC2
- DigitalOcean

**Requirements:**
- Public HTTPS endpoint
- Environment variables configured
- WhatsApp webhook pointed to your domain

## 📈 Scaling

See [ARCHITECTURE.md](./ARCHITECTURE.md) for scaling strategies.

**Database migration:**
- Move pricing to PostgreSQL/Supabase
- Add Redis for caching quotes
- Store conversation history
- Track analytics

**Horizontal scaling:**
- Stateless design supports multiple instances
- Use load balancer
- Shared Redis for session state
- Database connection pooling

## 🛡️ Security Best Practices

1. **Never commit `.env`** to version control
2. **Use strong verification tokens**
3. **Enable webhook signature verification** (set `WHATSAPP_APP_SECRET`)
4. **Keep dependencies updated**: `npm audit`
5. **Use HTTPS only** in production
6. **Rotate API keys** regularly
7. **Monitor API usage** for anomalies
8. **Set rate limits** appropriately

## 🐛 Troubleshooting

### Webhook verification fails
- Check `WEBHOOK_VERIFY_TOKEN` matches in both .env and Meta console
- Ensure webhook URL is publicly accessible (HTTPS required)
- Check server logs for errors

### Messages not received
- Verify webhook is subscribed to `messages` field
- Check WhatsApp phone number is approved
- Review request logs in Meta Developer Console

### AI responses not working
- Verify `CLAUDE_API_KEY` is valid
- Check Anthropic API credits/limits
- Review Claude service logs

### Pricing calculations wrong
- Verify pricing configuration in `src/config/pricing.js`
- Check parameter extraction logic
- Test with logger in debug mode

## 📞 Support

For issues or questions:
- Check logs: `logs/combined.log`
- Enable debug mode: `LOG_LEVEL=debug`
- Review WhatsApp API docs: https://developers.facebook.com/docs/whatsapp
- Review Claude API docs: https://docs.anthropic.com/

## 📄 License

MIT

## 🙏 Acknowledgments

Built for ezstorage.sg with enterprise-grade standards.

---

**Built with ❤️ for production use**
