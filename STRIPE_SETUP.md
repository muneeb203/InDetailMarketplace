# Stripe Payment Integration Setup

## Overview
The payment system has been updated with a simple Stripe integration. The flow is:
1. User reviews services and total on the Payment & Checkout modal
2. User clicks "Proceed to Pay" (for card payments)
3. Stripe checkout screen appears
4. After successful payment, the order is created

## Setup Instructions

### 1. Get Your Stripe API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create an account or sign in
3. Navigate to Developers → API keys
4. Copy your **Publishable key** (starts with `pk_test_` for test mode)

### 2. Configure Environment Variables
Update your `.env` file with your Stripe publishable key:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

### 3. Backend Integration (Required for Production)
The current implementation simulates payment processing. For production, you need to:

1. Create a backend API endpoint (e.g., `/api/create-checkout-session`)
2. Install Stripe on your backend: `npm install stripe`
3. Create a Checkout Session on your backend:

```javascript
// Example backend code (Node.js/Express)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
  const { amount } = req.body;
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Service Payment',
        },
        unit_amount: amount, // Amount in cents
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${YOUR_DOMAIN}/cancel`,
  });

  res.json({ id: session.id });
});
```

4. Update `src/components/StripeCheckout.tsx` to call your backend:

```typescript
// Uncomment and update this section in StripeCheckout.tsx
const response = await fetch('/api/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: amount * 100 }), // Stripe uses cents
});
const session = await response.json();
await stripe.redirectToCheckout({ sessionId: session.id });
```

## Testing

### Test Mode
- Use Stripe test cards: https://stripe.com/docs/testing
- Test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

### Current Behavior
- For "Credit / Debit Card": Shows Stripe checkout flow
- For "Wallet / UPI" or "Cash on service": Directly creates order without Stripe

## Files Modified
- `src/components/OrderPlacementModal.tsx` - Added Stripe checkout flow
- `src/components/StripeCheckout.tsx` - New Stripe checkout component
- `.env` - Added Stripe configuration
- `package.json` - Added @stripe/stripe-js dependency

## Next Steps
1. Add your Stripe publishable key to `.env`
2. Test the payment flow with test cards
3. Set up backend API for production
4. Configure success/cancel redirect URLs
5. Add webhook handling for payment confirmations
