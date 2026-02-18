# Quick Setup Guide - WhatsApp Bot

Step-by-step instructions to get your WhatsApp customer service bot running locally.

---

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Node.js (version 18 or higher) installed
- [ ] npm (version 9 or higher) installed
- [ ] A Meta Developer account
- [ ] WhatsApp Business API access approved
- [ ] An Anthropic account with Claude API access
- [ ] ngrok installed (for local testing)

---

## Part 1: Get Your API Credentials

### Step 1.1: WhatsApp Business API Setup

1. **Create Meta Developer Account**
   - Go to https://developers.facebook.com/
   - Click "Get Started" and create an account
   - Verify your email

2. **Create a New App**
   - In Meta Developer Dashboard, click "Create App"
   - Select "Business" as app type
   - Fill in app details and create

3. **Add WhatsApp Product**
   - In your app dashboard, click "Add Product"
   - Find "WhatsApp" and click "Set Up"
   - Follow the setup wizard

4. **Get Your Credentials**
   - In WhatsApp → Getting Started:
     - Copy your **Phone Number ID** (looks like: `123456789012345`)
     - Copy your **Temporary Access Token** (you'll replace this later)
     - Note your **Test Phone Number**

5. **Generate Permanent Access Token** (recommended)
   - Go to Settings → Basic
   - Copy your **App ID** and **App Secret**
   - Go to WhatsApp → Getting Started
   - Click "Generate Token" for a permanent token
   - Save this token securely

### Step 1.2: Claude API Setup

1. **Create Anthropic Account**
   - Go to https://console.anthropic.com/
   - Sign up for an account
   - Add billing information (required for API access)

2. **Generate API Key**
   - In Anthropic Console, go to "API Keys"
   - Click "Create Key"
   - Give it a name like "WhatsApp Bot"
   - Copy the key (starts with `sk-ant-`)
   - ⚠️ **Important**: Save this immediately - you can't view it again!

### Step 1.3: Install ngrok

1. **Download ngrok**
   - Go to https://ngrok.com/
   - Create a free account
   - Download ngrok for Windows

2. **Install ngrok**
   - Extract the downloaded file
   - Move `ngrok.exe` to a location in your PATH, or:
   - Run from the extracted folder

3. **Authenticate ngrok** (optional but recommended)
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN
   ```
   (Get the authtoken from your ngrok dashboard)

---

## Part 2: Configure the Bot

### Step 2.1: Navigate to Project Directory

Open PowerShell or Command Prompt:

```powershell
cd "d:\react project\EZSTORAGE\whatsapp-bot"
```

### Step 2.2: Install Dependencies

```powershell
npm install
```

Wait for installation to complete. You should see:
```
found 0 vulnerabilities
```

### Step 2.3: Create Environment File

Create your `.env` file:

```powershell
copy .env.example .env
```

### Step 2.4: Edit Environment Variables

Open `.env` in your text editor and fill in your credentials:

```env
# ============================================
# REQUIRED: WhatsApp Business Cloud API
# Get these from Meta Developer Console
# ============================================
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# REQUIRED: Webhook Verification Token
# Create your own random string (e.g., "mySecret123!")
# ============================================
WEBHOOK_VERIFY_TOKEN=mySecret123!

# ============================================
# REQUIRED: Claude API
# Get this from console.anthropic.com
# ============================================
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx

# ============================================
# OPTIONAL: Can leave these as default
# ============================================
NODE_ENV=development
PORT=3000
CONFIDENCE_THRESHOLD=70
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# ============================================
# OPTIONAL: Business Information
# Update with your actual details
# ============================================
BUSINESS_NAME=ezstorage.sg
BUSINESS_HOURS=Mon-Fri: 9AM-6PM, Sat: 9AM-1PM, Sun: Closed
BUSINESS_LOCATION=123 Storage Street, Singapore 123456
BUSINESS_PHONE=+65 1234 5678
BUSINESS_EMAIL=hello@ezstorage.sg
```

**Save the file** when done.

### Step 2.5: Update Pricing Configuration (Optional)

If you want to use real pricing data:

1. Open `src/config/pricing.js`
2. Update the `baseRates` array with your actual pricing
3. Modify `durationDiscounts` as needed
4. Add your promotional codes to `promoCodes`
5. Verify `gstRate` is correct (default: 9%)

---

## Part 3: Start the Bot

### Step 3.1: Start the Development Server

In your PowerShell/Command Prompt:

```powershell
npm run dev
```

You should see:
```
🚀 WhatsApp Bot Server started successfully
📱 Environment: development
🌐 Port: 3000
✅ Health check: http://localhost:3000/health
📞 Webhook endpoint: http://localhost:3000/webhook
🤖 AI Model: claude-3-5-sonnet-20241022
🎯 Confidence threshold: 70%
```

✅ **Server is running!** Keep this terminal window open.

### Step 3.2: Test the Server

Open a **new** PowerShell/Command Prompt window:

```powershell
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-18T00:09:19.000Z",
  "uptime": 3.456,
  "environment": "development"
}
```

✅ **Server is healthy!**

---

## Part 4: Expose with ngrok

### Step 4.1: Start ngrok

Open a **third** PowerShell/Command Prompt window:

```powershell
ngrok http 3000
```

You'll see output like:
```
ngrok

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok.io -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy the HTTPS URL**: `https://abc123def456.ngrok.io`

⚠️ **Important**: This URL will be different each time you run ngrok (unless you have a paid plan)

✅ **ngrok is exposing your local server!** Keep this window open.

### Step 4.2: Test ngrok URL

In another terminal:

```powershell
curl https://abc123def456.ngrok.io/health
```

Should return the same health check response.

✅ **Public URL is working!**

---

## Part 5: Configure WhatsApp Webhook

### Step 5.1: Go to Meta Developer Console

1. Open https://developers.facebook.com/apps/
2. Select your app
3. Click **WhatsApp** in the left sidebar
4. Click **Configuration**

### Step 5.2: Edit Webhook

1. Find the **Webhook** section
2. Click **Edit**

3. Fill in the form:
   - **Callback URL**: `https://abc123def456.ngrok.io/webhook`
     (Use YOUR ngrok URL from Step 4.1)
   - **Verify Token**: `mySecret123!`
     (Use the EXACT value from your `.env` WEBHOOK_VERIFY_TOKEN)

4. Click **Verify and Save**

✅ You should see: "Webhook verified successfully"

❌ If verification fails:
   - Check that your server is running (`npm run dev`)
   - Check that ngrok is running
   - Verify the URL is correct (must end with `/webhook`)
   - Verify the token matches EXACTLY what's in `.env`
   - Check server logs for errors

### Step 5.3: Subscribe to Webhooks

1. Still in the Webhook section, scroll down
2. Find **Webhook fields**
3. Click **Manage** next to your Phone Number
4. Check the box for **messages**
5. Click **Done**

✅ **Webhook is configured!**

---

## Part 6: Test with WhatsApp

### Step 6.1: Get Test Number Ready

1. In Meta Developer Console → WhatsApp → Getting Started
2. Find "To" section
3. Add your phone number (must have WhatsApp installed)
4. Verify the number via code sent to WhatsApp

### Step 6.2: Send Test Messages

From **your phone** (the one you verified), send WhatsApp messages to the **test number** shown in Meta console:

**Test 1: Greeting**
```
Hello
```
Expected: Bot sends main menu with buttons

**Test 2: Pricing Query**
```
I need 50 sqft for 6 months
```
Expected: Bot calculates and sends pricing quote

**Test 3: Unit Sizes**
```
What sizes do you have?
```
Expected: Bot lists available unit sizes

**Test 4: Promotions**
```
Any promotions?
```
Expected: Bot shows current promotional codes

**Test 5: Business Hours**
```
When are you open?
```
Expected: Bot shows business hours

**Test 6: Human Escalation**
```
I want to speak to a human
```
Expected: Bot shows contact information

**Test 7: Low Confidence (AI Fallback)**
```
Tell me about your security
```
Expected: Bot uses Claude AI to respond

### Step 6.3: Monitor Logs

Watch your server terminal. You should see logs like:

```
INFO: Processing message from: +6512345678
INFO: Message text: Hello
INFO: Intent detected: greeting, confidence: 100
INFO: Routing decision: deterministic - greeting
INFO: Text message sent successfully: +6512345678
```

✅ **Bot is working!**

---

## Part 7: Troubleshooting

### Problem: Server won't start

**Error**: "Missing required environment variables"
- **Solution**: Check that `.env` exists and all required variables are filled in
  ```powershell
  # Check if .env exists
  Test-Path .env
  
  # If false, create it:
  copy .env.example .env
  ```

**Error**: "Port 3000 is already in use"
- **Solution**: Change PORT in `.env` to a different port (e.g., 3001)

### Problem: Webhook verification fails

- **Check 1**: Server is running (`npm run dev` should be active)
- **Check 2**: ngrok is running and shows "online" status
- **Check 3**: Callback URL is exactly: `https://YOUR-NGROK-URL.ngrok.io/webhook`
- **Check 4**: Verify token matches `.env` EXACTLY (case-sensitive, no extra spaces)
- **Check 5**: Look at server logs for error messages

### Problem: Messages not arriving

**Check WhatsApp Configuration**:
1. Go to Meta Console → WhatsApp → Configuration
2. Verify webhook is subscribed to "messages" field
3. Verify phone number is approved and added

**Check Server Logs**:
- Look for "Webhook payload received" in logs
- If not appearing, webhook isn't reaching your server

**Check ngrok**:
- Verify ngrok is still running (session expires after 2 hours on free plan)
- If ngrok restarted, you need to update webhook URL in Meta Console

### Problem: Bot responds slowly

**If using AI fallback (low confidence)**:
- Claude API can take 1-3 seconds
- This is normal behavior

**If all responses are slow**:
- Check your internet connection
- Check if WhatsApp API is having issues
- Look for errors in server logs

### Problem: Pricing calculations seem wrong

**Check pricing configuration**:
1. Open `src/config/pricing.js`
2. Verify `baseRates` are correct
3. Check `durationDiscounts` logic
4. Verify promo codes
5. Confirm `gstRate` (should be `0.09` for 9%)

---

## Part 8: Stopping the Bot

When you're done testing:

1. **Stop the server**: Press `Ctrl+C` in the terminal running `npm run dev`
2. **Stop ngrok**: Press `Ctrl+C` in the terminal running ngrok
3. **Close terminals**

---

## Part 9: Next Steps

### For Production Deployment

When ready to deploy for real users:

1. **Read DEPLOYMENT.md** for hosting options
2. **Get permanent WhatsApp access token** (temporary one expires)
3. **Choose hosting platform**: Railway ($5/mo), Render (free tier), AWS, etc.
4. **Set up monitoring**: Sentry for errors, UptimeRobot for uptime
5. **Update business information** in `.env`
6. **Add real pricing data** in `src/config/pricing.js`

### For Customization

- **Add new intents**: See ARCHITECTURE.md
- **Modify AI behavior**: Edit `src/config/prompts.js`
- **Change pricing logic**: Edit `src/config/pricing.js`
- **Add new menu options**: Edit `src/services/menuService.js`

---

## Quick Reference Commands

```powershell
# Navigate to project
cd "d:\react project\EZSTORAGE\whatsapp-bot"

# Install dependencies
npm install

# Start development server
npm run dev

# Start ngrok (in separate terminal)
ngrok http 3000

# Test health check
curl http://localhost:3000/health

# View logs (server terminal shows them automatically)
# Logs are also saved to logs/ folder in production
```

---

## Support

- **Setup Issues**: Check troubleshooting section above
- **WhatsApp API Docs**: https://developers.facebook.com/docs/whatsapp
- **Claude API Docs**: https://docs.anthropic.com/
- **ngrok Docs**: https://ngrok.com/docs

---

**You're all set! 🚀**

Your production-grade WhatsApp bot is now running and ready to serve customers!
