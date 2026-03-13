import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Loader2, CreditCard, Plus, Trash2, CheckCircle } from 'lucide-react';
import { stripePromise } from '../../lib/stripe';

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
}

interface PaymentMethodManagerProps {
  customerId: string;
  onPaymentMethodAdded?: (paymentMethod: PaymentMethod) => void;
  onPaymentMethodRemoved?: (paymentMethodId: string) => void;
  onError?: (error: string) => void;
}

const PaymentMethodContent: React.FC<PaymentMethodManagerProps> = ({
  customerId,
  onPaymentMethodAdded,
  onPaymentMethodRemoved,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, [customerId]);

  const loadPaymentMethods = async () => {
    try {
      // In a real implementation, you'd fetch from your backend
      // For now, we'll simulate with empty array
      setPaymentMethods([]);
    } catch (err) {
      console.error('Error loading payment methods:', err);
    }
  };

  const handleAddPaymentMethod = async (event: React.FormEvent) => {
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

    setIsAddingCard(true);
    setError(null);

    try {
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Failed to create payment method');
      }

      if (!paymentMethod) {
        throw new Error('No payment method returned');
      }

      // In a real implementation, you'd save this to your backend
      const newPaymentMethod: PaymentMethod = {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card ? {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          exp_month: paymentMethod.card.exp_month,
          exp_year: paymentMethod.card.exp_year,
        } : undefined,
        is_default: paymentMethods.length === 0 // First card becomes default
      };

      setPaymentMethods(prev => [...prev, newPaymentMethod]);
      setShowAddForm(false);
      
      if (onPaymentMethodAdded) {
        onPaymentMethodAdded(newPaymentMethod);
      }

      // Clear the card element
      cardElement.clear();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add payment method';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, you'd call your backend to remove the payment method
      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
      
      if (onPaymentMethodRemoved) {
        onPaymentMethodRemoved(paymentMethodId);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove payment method';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCardBrandIcon = (brand: string) => {
    // You could add specific brand icons here
    return <CreditCard className="h-4 w-4" />;
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Manage your saved payment methods
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Existing Payment Methods */}
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getCardBrandIcon(pm.card?.brand || 'card')}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">
                          {pm.card?.brand} •••• {pm.card?.last4}
                        </span>
                        {pm.is_default && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Expires {pm.card?.exp_month}/{pm.card?.exp_year}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePaymentMethod(pm.id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No payment methods saved</p>
            </div>
          )}

          {/* Add New Payment Method */}
          {!showAddForm ? (
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Card</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Card Information
                    </label>
                    <div className="border border-gray-300 rounded-md p-3 bg-white">
                      <CardElement options={cardElementOptions} />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={!stripe || isAddingCard}
                      className="flex-1"
                    >
                      {isAddingCard ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Card'
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setError(null);
                      }}
                      disabled={isAddingCard}
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="text-xs text-gray-400 text-center">
                    Test card: 4242 4242 4242 4242 (any future date, any CVC)
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const PaymentMethodManager: React.FC<PaymentMethodManagerProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentMethodContent {...props} />
    </Elements>
  );
};