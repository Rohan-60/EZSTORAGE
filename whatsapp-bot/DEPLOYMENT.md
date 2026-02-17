# Deployment Guide

Production deployment instructions for WhatsApp Bot

## 🎯 Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] WhatsApp Business API approved
- [ ] Claude API key with sufficient credits
- [ ] HTTPS endpoint ready
- [ ] Logs configured
- [ ] Error monitoring set up
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Backup strategy in place

## 🚀 Deployment Options

### Option 1: Railway (Recommended for Startups)

**Cost**: $5/month for Starter plan

**Pros**:
- Simple deployment
- Auto-scaling
- Built-in HTTPS
- Easy environment variables
- Git-based deployments

**Steps**:

1. **Create Railway account**: https://railway.app

2. **Create new project** from GitHub repo

3. **Add environment variables** in Railway dashboard:
   ```
   WHATSAPP_PHONE_NUMBER_ID=...
   WHATSAPP_ACCESS_TOKEN=...
   WEBHOOK_VERIFY_TOKEN=...
   CLAUDE_API_KEY=...
   NODE_ENV=production
   PORT=3000
   ```

4. **Deploy**:
   - Railway auto-deploys on git push
   - Get your app URL: `https://your-app.up.railway.app`

5. **Configure WhatsApp webhook**:
   - URL: `https://your-app.up.railway.app/webhook`
   - Verify token: Your `WEBHOOK_VERIFY_TOKEN`

### Option 2: Render

**Cost**: Free tier available, Starter $7/month

**Pros**:
- Free tier for testing
- Auto-scaling
- Built-in HTTPS
- Easy setup

**Steps**:

1. **Create Render account**: https://render.com

2. **New Web Service** from GitHub

3. **Configure**:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

4. **Add environment variables** in Render dashboard

5. **Deploy**

6. **Get URL**: `https://your-app.onrender.com`

7. **Configure WhatsApp webhook**

### Option 3: AWS EC2

**Cost**: Variable ($15-50/month for small instance)

**Pros**:
- Full control
- Scalable
- Professional option

**Steps**:

1. **Launch EC2 instance**:
   - Ubuntu 22.04 LTS
   - t2.micro or t3.small
   - Security group: Allow ports 80, 443, 22

2. **SSH into instance**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

4. **Clone and setup**:
   ```bash
   git clone <your-repo>
   cd whatsapp-bot
   npm install
   ```

5. **Create .env file**:
   ```bash
   nano .env
   # Paste your environment variables
   ```

6. **Start with PM2**:
   ```bash
   pm2 start server.js --name whatsapp-bot
   pm2 save
   pm2 startup
   ```

7. **Set up Nginx reverse proxy**:
   ```bash
   sudo apt-get install nginx
   sudo nano /etc/nginx/sites-available/whatsapp-bot
   ```

   Nginx config:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/whatsapp-bot /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Set up SSL with Let's Encrypt**:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

9. **Configure WhatsApp webhook**:
   - URL: `https://your-domain.com/webhook`

### Option 4: DigitalOcean Droplet

**Cost**: $6/month for basic droplet

**Pros**:
- Simple pricing
- Good documentation
- Professional option

**Steps**: Similar to AWS EC2 above

### Option 5: Heroku (Alternative)

**Cost**: $7/month for Eco plan

**Note**: Heroku discontinued free tier but still viable for small apps

**Steps**:

1. **Create Heroku account**: https://heroku.com

2. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

3. **Create app**:
   ```bash
   heroku login
   heroku create your-app-name
   ```

4. **Set environment variables**:
   ```bash
   heroku config:set WHATSAPP_PHONE_NUMBER_ID=...
   heroku config:set WHATSAPP_ACCESS_TOKEN=...
   heroku config:set WEBHOOK_VERIFY_TOKEN=...
   heroku config:set CLAUDE_API_KEY=...
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   ```

6. **Get URL**: `https://your-app-name.herokuapp.com`

## 🔒 Production Security

### Environment Variables

**NEVER commit `.env` to git!**

For production, use:
- Railway/Render: Dashboard environment variables
- AWS: AWS Secrets Manager or Parameter Store
- Self-hosted: Environment files with restricted permissions

### Webhook Signature Verification

Add `WHATSAPP_APP_SECRET` to enable signature verification:

```env
WHATSAPP_APP_SECRET=your_app_secret
```

This is **highly recommended** for production.

### SSL/HTTPS

WhatsApp **requires** HTTPS for webhooks.

Options:
- Railway/Render: Built-in SSL
- AWS/DO: Use Let's Encrypt (free)
- Cloudflare: Free SSL proxy

### Rate Limiting

Configured in `.env`:

```env
RATE_LIMIT_WINDOW_MS=60000  # 1 minute
RATE_LIMIT_MAX_REQUESTS=30  # 30 requests per window
```

Adjust based on your traffic.

### Firewall Rules

If self-hosting:
- Allow ports 80, 443 (HTTP/HTTPS)
- Allow port 22 (SSH) only from your IP
- Deny all other incoming traffic

## 📊 Monitoring

### Logging

**Production logs location**:
- `logs/error.log` - Errors only
- `logs/combined.log` - All logs

**Log rotation** (recommended):

Install PM2:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Error Monitoring

**Free options**:
- Sentry.io (free tier: 5k events/month)
- LogRocket
- Rollbar

**Setup Sentry**:
```bash
npm install @sentry/node
```

In `server.js`:
```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

### Uptime Monitoring

**Free options**:
- UptimeRobot (50 monitors free)
- Pingdom
- Freshping

Monitor:
- `https://your-domain.com/health`
- Alert on downtime

## 💾 Backup Strategy

### Configuration Backup
- Keep `.env.example` updated in repo
- Store actual credentials in secure vault
- Document all WhatsApp/Claude setup

### Database Backup (when added)
- Daily automated backups
- Store in separate region/service
- Test restore process monthly

### Code Backup
- Use Git
- Push to GitHub/GitLab
- Tag releases

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test  # If you have tests
      - name: Deploy to Railway
        run: |
          npm i -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 📈 Performance Optimization

### Node.js Optimization

In production:

```javascript
// server.js
if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy');
  app.use(compression()); // Enable gzip
}
```

Install compression:
```bash
npm install compression
```

### Caching (Future)

When adding Redis:

```bash
npm install redis ioredis
```

Cache frequently requested quotes for 30 minutes.

## 🚨 Troubleshooting Production

### Webhook Not Receiving Messages

1. Check WhatsApp webhook configuration
2. Verify URL is publicly accessible (HTTPS)
3. Check server logs: `pm2 logs whatsapp-bot`
4. Test webhook: `curl https://your-domain.com/health`
5. Verify phone number is approved in Meta

### High Error Rates

1. Check Claude API credits/limits
2. Review error logs: `tail -f logs/error.log`
3. Check WhatsApp API status
4. Verify environment variables
5. Monitor RAM/CPU usage

### Slow Responses

1. Check API response times (Claude, WhatsApp)
2. Add logging to measure bottlenecks
3. Consider Redis caching
4. Scale horizontally if needed

## 📞 Production Checklist

Before going live:

- [ ] Test all intents thoroughly
- [ ] Verify pricing calculations with real data
- [ ] Test error scenarios (API failures)
- [ ] Set up monitoring alerts
- [ ] Document runbook procedures
- [ ] Train support team
- [ ] Have rollback plan ready
- [ ] Test human escalation flow
- [ ] Verify phone number approval
- [ ] Load test (use tools like Artillery)

## 🎯 Post-Deployment

### Week 1
- Monitor error rates daily
- Check user conversations
- Fix any critical bugs
- Gather feedback

### Month 1
- Analyze intent accuracy
- Review AI fallback usage
- Optimize confidence thresholds
- Plan improvements

### Ongoing
- Monthly security audits
- Quarterly dependency updates
- Review and update pricing
- Add new intents as needed

---

**You're ready for production! 🚀**
