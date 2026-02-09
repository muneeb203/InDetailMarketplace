import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { SUBSCRIPTION_TIERS, upgradeSubscription } from '../services/stripeService';
import { Check, Crown, Loader2, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (tierId: string) => void;
  detailerId: string;
  currentTier?: string;
}

export function SubscriptionModal({
  open,
  onClose,
  onSuccess,
  detailerId,
  currentTier = 'free',
}: SubscriptionModalProps) {
  const [selectedTier, setSelectedTier] = useState(currentTier);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    if (selectedTier === currentTier) {
      toast.info('You are already on this plan');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await upgradeSubscription(detailerId, selectedTier);

      if (result.success) {
        toast.success('Subscription upgraded!', {
          description: 'Your new benefits are now active.',
        });
        onSuccess(selectedTier);
        onClose();
      }
    } catch (error) {
      toast.error('Upgrade failed', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="subscription-description">
        <DialogHeader>
          <DialogTitle>Choose Your Plan</DialogTitle>
          <DialogDescription id="subscription-description">
            Upgrade your subscription to get more leads and better placement
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 py-4">
          {SUBSCRIPTION_TIERS.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                selectedTier === tier.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              } ${tier.popular ? 'ring-2 ring-blue-500' : ''}`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                  <Crown className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}

              <div className="mb-4">
                <h3 className="mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl">${tier.price}</span>
                  {tier.price > 0 && <span className="text-gray-500">/mo</span>}
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {tier.limitations?.map((limitation, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
                    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>

              {selectedTier === tier.id && (
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Selected</span>
                </div>
              )}

              {currentTier === tier.id && (
                <Badge variant="secondary" className="absolute top-6 right-6">
                  Current
                </Badge>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={isProcessing} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={isProcessing || selectedTier === currentTier}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : selectedTier === currentTier ? (
              'Current Plan'
            ) : (
              `Upgrade to ${SUBSCRIPTION_TIERS.find((t) => t.id === selectedTier)?.name}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
