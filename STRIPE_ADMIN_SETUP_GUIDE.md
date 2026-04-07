# Stripe Admin Setup Guide

## Overview

This guide will help you set up Stripe payments for your InDetail Marketplace. Once configured, your marketplace will be able to process payments between clients and detailers securely.

## 🚀 Quick Start

1. **Access Admin Panel**: Log into your admin account and navigate to **Settings → Payments**
2. **Follow Setup Guide**: Use the built-in setup wizard to create your Stripe account
3. **Configure API Keys**: Enter your Stripe API keys to connect your account
4. **Test & Activate**: Test the connection and start accepting payments

## 📋 Step-by-Step Setup

### Step 1: Create Your Stripe Account

1. **Visit Stripe Website**
   - Go to [https://stripe.com](https://stripe.com)
   - Click "Start now" to begin registration

2. **Choose Account Type**
   - Select "Individual / Sole Proprietor" (no company registration required)
   - This is the easiest option for most marketplace owners

3. **Provide Basic Information**
   - Full legal name (as it appears on your ID)
   - Email address (you'll use this to log into Stripe)
   - Country of residence
   - Phone number for verification

### Step 2: Complete Identity Verification (KYC)

Stripe requires identity verification to activate your account and comply with financial regulations.

**Required Documents:**
- Valid government-issued ID (passport, driver's license, or national ID)
- Proof of address (utility bill, bank statement, or lease agreement)
- Business information (if applicable)

**Verification Process:**
1. Upload clear photos of your documents
2. Provide your residential address
3. Answer questions about your business
4. Wait for Stripe to review (usually 1-2 business days)

### Step 3: Add Bank Account Details

To receive payments, you need to connect a bank account:

1. **Bank Account Requirements:**
   - Account must be in your name (matching your Stripe account)
   - Must be in the same country as your Stripe account
   - Should support receiving international payments (if applicable)

2. **Required Information:**
   - Bank name and address
   - Account number and routing number
   - Account holder name
   - Account type (checking/savings)

### Step 4: Complete Business Profile

1. **Business Description**
   - Describe your marketplace business
   - Explain the services provided (auto detailing marketplace)
   - Provide your website URL

2. **Transaction Information**
   - Expected monthly transaction volume
   - Average transaction amount
   - Types of products/services sold

### Step 5: Get Your API Keys

Once your account is approved:

1. **Access Developer Settings**
   - Log into your Stripe Dashboard
   - Go to **Developers → API Keys**
   - You'll see both Test and Live keys

2. **Copy Your Keys**
   - **Publishable Key**: Starts with `pk_test_` (test) or `pk_live_` (live)
   - **Secret Key**: Starts with `sk_test_` (test) or `sk_live_` (live)
   - **Webhook Secret**: Starts with `whsec_` (optional but recommended)

### Step 6: Configure in Admin Panel

1. **Navigate to Settings**
   - Log into your marketplace admin panel
   - Go to **Settings → Payments**

2. **Enter API Keys**
   - Paste your Publishable Key
   - Paste your Secret Key
   - Enter Account Name (for your reference)
   - Choose Test Mode or Live Mode

3. **Test Connection**
   - Click "Test Connection" to verify your keys
   - Ensure the test passes before saving

4. **Save Configuration**
   - Click "Save Configuration"
   - Your marketplace is now ready to process payments!

## 🔒 Security Best Practices

### API Key Security
- **Never share your Secret Key** with anyone
- **Use Test Keys** during development and testing
- **Switch to Live Keys** only when ready for production
- **Regenerate keys** if you suspect they've been compromised

### Account Security
- Enable two-factor authentication on your Stripe account
- Use a strong, unique password
- Regularly review your account activity
- Set up account alerts for important events

## 💰 Understanding Stripe Fees

### Standard Pricing
- **2.9% + 30¢** per successful card charge
- **No monthly fees** or setup costs
- **No hidden fees** - transparent pricing

### International Cards
- **Additional 1%** for international cards
- **Currency conversion fees** may apply

### Payouts
- **Free** for standard payouts (2-7 business days)
- **1%** for instant payouts (available in some countries)

## 🧪 Testing Your Setup

### Test Mode
- Use test API keys for development
- No real money is processed
- Use test card numbers provided by Stripe

### Test Card Numbers
- **Successful Payment**: `4242424242424242`
- **Declined Payment**: `4000000000000002`
- **Insufficient Funds**: `4000000000009995`

### Testing Checklist
- [ ] Client can create an order
- [ ] Payment form loads correctly
- [ ] Test payments process successfully
- [ ] Detailer receives payment notification
- [ ] Admin can view transaction details

## 🚀 Going Live

### Pre-Launch Checklist
- [ ] Stripe account fully verified
- [ ] All required business information provided
- [ ] Bank account connected and verified
- [ ] Test payments working correctly
- [ ] Live API keys configured
- [ ] Terms of service and privacy policy updated

### Switching to Live Mode
1. **Get Live API Keys**
   - Go to Stripe Dashboard → Developers → API Keys
   - Copy your Live keys (pk_live_ and sk_live_)

2. **Update Configuration**
   - Go to Admin Settings → Payments
   - Replace test keys with live keys
   - Enable "Live Mode"
   - Test connection and save

3. **Monitor First Transactions**
   - Watch for successful payments
   - Check that funds appear in your Stripe dashboard
   - Verify payouts to your bank account

## 🛠️ Troubleshooting

### Common Issues

**"Invalid API Key" Error**
- Verify you're using the correct key format
- Ensure test/live keys match your mode setting
- Check for extra spaces or characters

**"Account Not Activated" Error**
- Complete identity verification process
- Provide all required business information
- Wait for Stripe approval (can take 1-2 days)

**Payment Failures**
- Check if using test card numbers in live mode
- Verify customer's card details are correct
- Ensure sufficient funds on customer's card

**Webhook Issues**
- Verify webhook endpoint URL is correct
- Check webhook secret matches configuration
- Ensure your server can receive HTTPS requests

### Getting Help

**Stripe Support**
- Visit [https://support.stripe.com](https://support.stripe.com)
- Use live chat for urgent issues
- Check Stripe's extensive documentation

**Marketplace Support**
- Contact your development team
- Check admin panel logs
- Review error messages in browser console

## 📊 Monitoring Your Business

### Stripe Dashboard
- View real-time transaction data
- Monitor payment success rates
- Track revenue and growth
- Manage disputes and refunds

### Key Metrics to Watch
- **Payment Success Rate**: Should be >95%
- **Average Transaction Value**: Track growth over time
- **Monthly Recurring Revenue**: For subscription services
- **Chargeback Rate**: Should be <1%

### Setting Up Alerts
- Configure email notifications for large transactions
- Set up alerts for failed payments
- Monitor for unusual activity patterns

## 🔄 Regular Maintenance

### Monthly Tasks
- Review transaction reports
- Check for any disputes or chargebacks
- Update business information if needed
- Review and optimize payment flows

### Quarterly Tasks
- Analyze payment success rates
- Review fee structure and costs
- Update terms of service if needed
- Plan for seasonal transaction volume changes

### Annual Tasks
- Renew any required business licenses
- Update tax information
- Review and update security practices
- Plan for business growth and scaling

## 📞 Support Contacts

### Stripe Support
- **Website**: [https://support.stripe.com](https://support.stripe.com)
- **Phone**: Available in Stripe Dashboard
- **Email**: Available through dashboard

### Emergency Contacts
- **Account Issues**: Use Stripe Dashboard support
- **Technical Issues**: Contact your development team
- **Security Concerns**: Immediately contact Stripe support

---

## ✅ Setup Complete!

Once you've completed all steps:
- Your marketplace can process real payments
- Clients can pay detailers securely
- You'll receive transaction fees automatically
- All payments are PCI compliant and secure

**Next Steps:**
1. Promote your marketplace to attract users
2. Monitor payment performance and user feedback
3. Consider additional Stripe features like subscriptions or marketplace features
4. Plan for scaling as your business grows

---

*This guide was created for InDetail Marketplace. For the most up-to-date information, always refer to official Stripe documentation.*