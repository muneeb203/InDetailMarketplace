import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { stripePromise } from '../../lib/stripe';
import { MarketplacePaymentService } from '../../services/marketplacePayments';

interface ClientPaymentFormProps {
  orderId: string;
  amount: number; // in cents
  detailerStripeAccountId: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

const PaymentFormContent: React.FC<ClientPaymentFormProps> = ({
  orderId,
  amount,
  detailerStripeAccountId,
  onSuccess,
  onError,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent on your backend
      const paymentResult = await MarketplacePaymentService.createMarketplacePayment({
        order_id: orderId,
        amount: amount,
        detailer_stripe_account_id: detailerStripeAccountId,
        metadata: {
          order_id: orderId,
          payment_type: 'service_payment'
        }
      });

      if (!paymentResult.success || !paymentResult.data) {
        throw new Error(paymentResult.error?.message || 'Failed to create payment intent');
      }

      const { client_secret } = paymentResult.data;
      setClientSecret(client_secret);

      // Check if this is a development mock payment BEFORE calling Stripe
      if (client_secret.includes('pi_dev_')) {
        console.log('🎭 Development mode: Simulating successful payment without calling Stripe API');
        console.log('🎭 Mock client secret:', client_secret);
        
        // Simulate a delay like a real payment
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful payment for development
        const mockPaymentIntent = {
          id: client_secret.split('_secret_')[0],
          status: 'succeeded'
        };
        console.log('🎭 Simulated payment success:', mockPaymentIntent);
        onSuccess(mockPaymentIntent.id);
        return;
      }

      console.log('🔄 Real Stripe mode: Processing actual payment...');
      
      // Only call Stripe API for real client secrets
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // You can add billing details here if needed
          },
        }
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
        <CardDescription>
          Secure payment for your car detailing service
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Amount */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="text-lg font-semibold">{formatCurrency(amount)}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Includes platform fees and processing
            </div>
          </div>

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

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Lock className="h-3 w-3" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${formatCurrency(amount)}`
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Test Card Info */}
          <div className="text-xs text-gray-400 text-center">
            Test card: 4242 4242 4242 4242 (any future date, any CVC)
            {clientSecret?.includes('pi_dev_') && (
              <div className="text-orange-600 font-semibold mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                🔧 Development Mode: Payment will be simulated (no real charges)
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export const ClientPaymentForm: React.FC<ClientPaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};