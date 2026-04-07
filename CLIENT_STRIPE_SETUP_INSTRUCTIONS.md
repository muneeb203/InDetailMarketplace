# Stripe Setup Instructions for Your Marketplace

## 🎯 What You Need to Do

Your marketplace is ready, but we need your Stripe API keys to enable payments. Follow these simple steps:

### Step 1: Create Your Stripe Account (5 minutes)

1. **Go to Stripe.com**
   - Visit: https://stripe.com
   - Click "Start now"
   - Sign up with your email

2. **Choose Account Type**
   - Select "Individual" (easiest option)
   - No company registration needed

3. **Fill Basic Info**
   - Your full legal name
   - Email address
   - Country
   - Phone number

### Step 2: Complete Verification (1-2 days)

Stripe will ask for:
- Government ID (passport/driver's license)
- Your address
- Bank account details

**Note:** This is required by law for payment processing. Stripe will review and approve your account.

### Step 3: Get Your API Keys (2 minutes)

Once approved:

1. **Login to Stripe Dashboard**
   - Go to: https://dashboard.stripe.com
   - Login with your account

2. **Find Your API Keys**
   - Click "Developers" in the left menu
   - Click "API keys"
   - You'll see two keys:

**COPY THESE TWO KEYS:**
- **Publishable key** (starts with `pk_test_` or `pk_live_`)
- **Secret key** (starts with `sk_test_` or `sk_live_`)

### Step 4: Enter Keys in Your Admin Panel

1. **Login to Your Marketplace Admin**
   - Go to your marketplace website
   - Login to admin panel
   - Go to **Settings → Payments**

2. **Enter Your Keys**
   - Paste your **Publishable Key**
   - Paste your **Secret Key**
   - Give your account a name (like "Main Stripe Account")
   - Choose **Test Mode** first (for testing)
   - Click **"Save Configuration"**

### Step 5: Test & Go Live

1. **Test First**
   - Use test keys initially
   - Make a test payment to ensure everything works

2. **Switch to Live**
   - When ready, get your **Live keys** from Stripe
   - Update the admin panel with live keys
   - Switch to **Live Mode**

## 🔒 Important Security Notes

- **Never share your Secret Key** with anyone except through the secure admin panel
- **Keep your Stripe login secure** - use a strong password
- **Start with Test Mode** - no real money is processed

## 💰 How Payments Work

- All payments go **directly to your Stripe account**
- You control all transactions and refunds
- Stripe charges 2.9% + 30¢ per transaction
- Money appears in your bank account automatically

## ❓ Need Help?

**Stripe Issues:**
- Visit: https://support.stripe.com
- Use their live chat for quick help

**Marketplace Issues:**
- Contact your development team
- Check the admin panel for error messages

## ✅ What Happens Next

Once you complete these steps:
1. Your marketplace will process real payments
2. Clients can pay detailers securely
3. You'll receive transaction fees automatically
4. All payments are secure and PCI compliant

**That's it! Your marketplace will be ready to accept payments.**

---

*Need help? Contact your development team with any questions.*