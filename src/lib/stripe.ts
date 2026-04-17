import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('⚠️ VITE_STRIPE_PUBLISHABLE_KEY is not set. Stripe functionality will be disabled.');
} else if (stripePublishableKey.startsWith('pk_live_') && window.location.protocol === 'http:') {
  console.warn('⚠️ Using live Stripe keys over HTTP. This is only allowed for testing. Use HTTPS in production.');
}

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export { stripePromise };