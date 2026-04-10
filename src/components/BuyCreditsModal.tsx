import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CREDIT_PACKAGES, purchaseCredits } from '../services/stripeService';
import { Check, Loader2, DollarSign, Sparkles } from 'lucide-react';
import { toast } from "sonner";

interface BuyCreditsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (credits: number) => void;
  detailerId: string;
}

export function BuyCreditsModal({ open, onClose, onSuccess, detailerId }: BuyCreditsModalProps) {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1].id);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    try {
      const result = await purchaseCredits(detailerId, selectedPackage);
      
      if (result.success) {
        toast.success(`Successfully added ${result.credits} credits!`, {
          description: 'Your wallet has been updated.',
        });
        onSuccess(result.credits);
        onClose();
      }
    } catch (error) {
      toast.error('Payment failed', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pkg = CREDIT_PACKAGES.find((p) => p.id === selectedPackage);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby="buy-credits-description">
        <DialogHeader>
          <DialogTitle>Buy Lead Credits</DialogTitle>
          <DialogDescription id="buy-credits-description">
            Choose a package to add credits to your wallet. Each credit = 1 lead acceptance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {CREDIT_PACKAGES.map((pack) => (
            <button
              key={pack.id}
              onClick={() => setSelectedPackage(pack.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedPackage === pack.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="mb-1">{pack.name}</h3>
                  <p className="text-2xl text-blue-600">${pack.price}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-lg">{pack.credits}</span>
                  </div>
                  <p className="text-xs text-gray-500">credits</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  ${(pack.price / pack.credits).toFixed(2)} per lead
                </p>
                {pack.popular && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                    Most Popular
                  </Badge>
                )}
                {pack.savings && !pack.popular && (
                  <Badge variant="secondary" className="text-green-600">
                    {pack.savings}
                  </Badge>
                )}
              </div>

              {selectedPackage === pack.id && (
                <div className="mt-3 flex items-center gap-2 text-blue-600">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Selected</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm mb-2">Payment Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Credits</span>
              <span>{pkg?.credits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="text-lg">${pkg?.price}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Purchase
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Secure payment powered by Stripe. Credits never expire.
        </p>
      </DialogContent>
    </Dialog>
  );
}
