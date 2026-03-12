import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { stripePromise } from '../lib/stripe';

interface StripeCheckoutProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (message: string) => void;
}

const CheckoutFormContent: React.FC<StripeCheckoutProps> = ({
  amount,
  onSuccess,
  onCancel,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    console.log('Stripe payment button clicked');

    if (!stripe || !elements) {
      const errorMsg = 'Stripe has not loaded yet. Please try again.';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      const errorMsg = 'Card element not found. Please refresh and try again.';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    setProcessing(true);
    setError(null);
    console.log('Processing payment...');

    try {
      // For now, we'll simulate a successful payment
      // In a real implementation, you would:
      // 1. Create a payment intent on your backend
      // 2. Confirm the payment with Stripe
      
      // Create payment method
      console.log('Creating payment method...');
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        console.error('Stripe error:', stripeError);
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (!paymentMethod) {
        console.error('No payment method created');
        throw new Error('No payment method created');
      }

      console.log('Payment method created successfully:', paymentMethod.id);

      // Simulate backend call to create payment intent and confirm payment
      // In real implementation, you would call your backend here:
      /*
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Math.round(amount * 100), // Convert to cents
          payment_method_id: paymentMethod.id 
        }),
      });
      const { client_secret } = await response.json();
      
      const { error: confirmError } = await stripe.confirmCardPayment(client_secret);
      if (confirmError) {
        throw new Error(confirmError.message);
      }
      */

      // For demo purposes, simulate success after 2 seconds
      console.log('Simulating payment success...');
      setTimeout(() => {
        console.log('Payment successful!');
        setProcessing(false);
        onSuccess();
      }, 2000);

    } catch (err: any) {
      console.error('Payment error:', err);
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      onError(errorMessage);
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Complete Payment
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Enter your payment details to complete your order of ${amount.toFixed(2)}.
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Lock className="w-4 h-4" />
          <span>Secure payment powered by Stripe</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Card Element */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-md p-3 bg-white">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Test Card Info */}
        <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
          <strong>Test Card:</strong> 4242 4242 4242 4242 (any future date, any CVC)
        </div>

        {/* Action Buttons */}
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
            onClick={handleSubmit}
            disabled={!stripe || processing}
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
    </div>
  );
};

export function StripeCheckout(props: StripeCheckoutProps) {
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Check if Stripe key is available
  React.useEffect(() => {
    const stripeKey = (import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY;
    console.log('Stripe key available:', !!stripeKey);
    
    if (!stripeKey) {
      setStripeError('Stripe publishable key is not configured. Please check your .env file.');
      props.onError('Stripe is not configured properly.');
    }
  }, []);

  if (stripeError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{stripeError}</AlertDescription>
        </Alert>
        <Button onClick={props.onCancel} variant="outline" className="w-full">
          Back
        </Button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormContent {...props} />
    </Elements>
  );
}