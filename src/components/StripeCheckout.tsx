import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface StripeCheckoutProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (message: string) => void;
}

export function StripeCheckout({ amount, onSuccess, onCancel, onError }: StripeCheckoutProps) {
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // TODO: Replace with your actual Stripe publishable key
      const stripePublishableKey = (import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY;
      
      if (!stripePublishableKey) {
        onError('Stripe is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env file');
        setProcessing(false);
        return;
      }

      // In a real implementation, you would:
      // 1. Call your backend API to create a Stripe Checkout Session
      // 2. Redirect to Stripe Checkout
      // 3. Handle the success/cancel callbacks
      
      // For now, we'll simulate the payment process
      // Replace this with actual Stripe integration
      
      const stripe = await loadStripe(stripePublishableKey);
      
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Call your backend to create a checkout session
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount: amount * 100 }), // Stripe uses cents
      // });
      // const session = await response.json();
      // await stripe.redirectToCheckout({ sessionId: session.id });

      // Simulated success for demo purposes
      setTimeout(() => {
        setProcessing(false);
        onSuccess();
      }, 2000);
      
    } catch (err) {
      setProcessing(false);
      const message = err instanceof Error ? err.message : 'Payment failed';
      onError(message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-lg mb-2">Complete Payment</h3>
        <p className="text-sm text-gray-600 mb-4">
          You will be redirected to Stripe's secure checkout page to complete your payment of ${amount.toFixed(2)}.
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Secure payment powered by Stripe</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handlePayment}
          disabled={processing}
          className="flex-1"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </Button>
      </div>
    </div>
  );
}
