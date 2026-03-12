import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CreditCard, Lock } from 'lucide-react';

interface StripeCheckoutSimpleProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (message: string) => void;
}

export function StripeCheckoutSimple({ amount, onSuccess, onCancel, onError }: StripeCheckoutSimpleProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleSubmit = async () => {
    console.log('Simple payment button clicked');

    if (!cardNumber || !expiry || !cvc) {
      setError('Please fill in all card details');
      return;
    }

    setProcessing(true);
    setError(null);
    console.log('Processing payment...');

    try {
      // Simulate payment processing
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

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Complete Payment (Simple Test)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Enter your payment details to complete your order of ${amount.toFixed(2)}.
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Lock className="w-4 h-4" />
          <span>Test payment form (not connected to Stripe yet)</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Card Number */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Card Number
          </label>
          <Input
            type="text"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            maxLength={19}
          />
        </div>

        {/* Expiry and CVC */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <Input
              type="text"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              maxLength={5}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              CVC
            </label>
            <Input
              type="text"
              placeholder="123"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              maxLength={4}
            />
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
          <strong>Test Card:</strong> 4242 4242 4242 4242, Exp: 12/25, CVC: 123
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
    </div>
  );
}