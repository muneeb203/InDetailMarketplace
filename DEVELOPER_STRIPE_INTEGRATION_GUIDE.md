# Developer Guide: Stripe Integration Workflow

## 🎯 Overview

This guide explains how to handle the Stripe integration workflow between you (developer) and your client.

## 📋 Workflow Steps

### Step 1: Client Setup (Client's Responsibility)

1. **Send Client Instructions**
   - Share `CLIENT_STRIPE_SETUP_INSTRUCTIONS.md` with your client
   - Client creates Stripe account and gets verified
   - Client enters API keys through admin panel

2. **Client Access**
   - Client logs into admin panel at `/admin`
   - Sees notification banner about Stripe setup
   - Goes to Settings → Payments
   - Follows setup guide and enters keys

### Step 2: Retrieve Keys (Your Responsibility)

1. **Run the Key Retrieval Script**
   ```bash
   cd InDetailMarketplace
   node scripts/get-stripe-keys.js
   ```

2. **What You'll Get**
   - Publishable Key (for frontend)
   - Secret Key (for backend/Supabase)
   - Webhook Secret (optional)
   - Mode (test/live)

### Step 3: Update Environment Variables

1. **Update .env File**
   ```env
   # Add these keys from the script output
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_... (optional)
   ```

2. **Update Supabase Edge Functions**
   - Go to Supabase Dashboard → Edge Functions
   - Update environment variables with STRIPE_SECRET_KEY

### Step 4: Test Integration

1. **Test Payment Flow**
   ```bash
   npm run dev
   ```
   - Create test order
   - Process test payment
   - Verify payment success

2. **Verify Database**
   - Check payment records in Supabase
   - Verify order status updates
   - Test webhook handling

## 🔧 Technical Implementation

### Database Schema

The system automatically creates a `stripe_config` table:

```sql
CREATE TABLE stripe_config (
    id UUID PRIMARY KEY,
    publishable_key TEXT,
    secret_key_encrypted TEXT,
    webhook_secret_encrypted TEXT,
    is_live_mode BOOLEAN DEFAULT false,
    account_name TEXT,
    setup_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Security

- Secret keys are base64 encoded (basic security)
- Only admin users can access the configuration
- Keys are never exposed in frontend code
- Use environment variables for actual implementation

### Admin Panel Features

1. **Setup Notification**
   - Shows on dashboard when Stripe not configured
   - Links directly to settings page
   - Dismissible but reappears until setup complete

2. **Configuration Panel**
   - Step-by-step Stripe account creation guide
   - API key input with validation
   - Connection testing
   - Test/Live mode switching

3. **Status Monitoring**
   - Shows current configuration status
   - Displays account information
   - Indicates test vs live mode

## 🚀 Deployment Workflow

### Development Phase
1. Client uses test keys
2. You test with test payments
3. Verify all functionality works

### Production Phase
1. Client gets live keys from Stripe
2. Client updates admin panel with live keys
3. You retrieve live keys using script
4. Update production environment variables
5. Deploy to production

## 🔍 Monitoring & Maintenance

### Regular Checks
- Monitor payment success rates
- Check for failed transactions
- Review Stripe dashboard for issues
- Update keys if client regenerates them

### Client Communication
- Provide monthly payment reports
- Alert client to any payment issues
- Guide client through Stripe dashboard
- Help with dispute resolution

## 🛠️ Troubleshooting

### Common Issues

**"No Stripe configuration found"**
- Client hasn't completed setup in admin panel
- Guide client through setup process

**"Invalid API Key" errors**
- Keys might be copied incorrectly
- Check for extra spaces or characters
- Verify test/live mode consistency

**Payment failures**
- Check Stripe dashboard for error details
- Verify webhook endpoints are working
- Ensure keys are properly configured

### Debug Commands

```bash
# Check current configuration
node scripts/get-stripe-keys.js

# Test Supabase connection
npx supabase status

# Check environment variables
echo $STRIPE_SECRET_KEY
```

## 📞 Support Escalation

### Client Issues
1. Guide client through admin panel
2. Check setup documentation
3. Verify Stripe account status
4. Contact Stripe support if needed

### Technical Issues
1. Check server logs
2. Verify database connections
3. Test API endpoints
4. Review webhook configurations

## 🔒 Security Best Practices

### For You (Developer)
- Never commit API keys to version control
- Use environment variables for all secrets
- Regularly rotate access tokens
- Monitor for suspicious activity

### For Client
- Use strong passwords for Stripe account
- Enable 2FA on Stripe account
- Regularly review transaction reports
- Report suspicious activity immediately

## 📊 Success Metrics

### Technical Metrics
- Payment success rate > 95%
- Average response time < 2 seconds
- Zero security incidents
- 99.9% uptime

### Business Metrics
- Transaction volume growth
- Customer satisfaction scores
- Dispute/chargeback rates < 1%
- Revenue growth tracking

---

## ✅ Checklist

### Initial Setup
- [ ] Client receives setup instructions
- [ ] Client creates Stripe account
- [ ] Client completes verification
- [ ] Client enters keys in admin panel
- [ ] You retrieve keys using script
- [ ] Environment variables updated
- [ ] Test payments successful

### Production Deployment
- [ ] Client switches to live keys
- [ ] You update production environment
- [ ] Live payment testing complete
- [ ] Monitoring systems active
- [ ] Client trained on Stripe dashboard

### Ongoing Maintenance
- [ ] Monthly payment reports
- [ ] Quarterly security reviews
- [ ] Annual compliance checks
- [ ] Regular backup procedures

---

*This workflow ensures secure, efficient Stripe integration while maintaining clear separation of responsibilities between developer and client.*