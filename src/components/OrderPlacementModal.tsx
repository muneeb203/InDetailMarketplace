import { useEffect, useMemo, useState } from 'react';
import { Detailer, Vehicle } from '../types';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import { createOrder, createOrderWithServices } from '../services/orderService';
import { useVehicleCategories } from '../hooks/useVehicleCategories';
import { useServiceOfferings } from '../hooks/useServiceOfferings';
import { ClientPaymentForm } from './payments/ClientPaymentForm';
import { StripeConnectService } from '../services/stripeConnect';
import { StripeConnectDirectService } from '../services/stripeConnectDirect';
import { PromoCodeService } from '../services/promoCodeService';

interface OrderPlacementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detailer: Detailer;
  clientId: string;
  clientVehicles: Vehicle[];
  initialSelectedServices?: { id: string; name: string; price?: number }[];
  onSuccess: (orderId: string) => void;
  onError: (message: string) => void;
}

export function OrderPlacementModal({
  open,
  onOpenChange,
  detailer,
  clientId,
  clientVehicles,
  initialSelectedServices = [],
  onSuccess,
  onError,
}: OrderPlacementModalProps) {
  const { categories } = useVehicleCategories();
  const [vehicleCategoryId, setVehicleCategoryId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoCodeId, setPromoCodeId] = useState<string | null>(null);
  const [promoValidating, setPromoValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [detailerStripeAccountId, setDetailerStripeAccountId] = useState<string | null>(null);

  // Get detailer's Stripe account ID
  useEffect(() => {
    const fetchStripeAccount = async () => {
      try {
        // Try direct service first (for development)
        let result = await StripeConnectDirectService.getAccountStatus(detailer.id);
        
        // Fallback to regular service if direct service fails
        if (!result.success) {
          result = await StripeConnectService.getAccountStatus(detailer.id);
        }
        
        if (result.success && result.data) {
          console.log('Found Stripe account for detailer:', result.data);
          setDetailerStripeAccountId(result.data.stripe_account_id);
        } else {
          console.log('No Stripe account found for detailer:', detailer.id);
          setDetailerStripeAccountId(null);
        }
      } catch (error) {
        console.error('Failed to fetch detailer Stripe account:', error);
        setDetailerStripeAccountId(null);
      }
    };

    if (open && detailer.id) {
      fetchStripeAccount();
    }
  }, [open, detailer.id]);

  const mapVehicleToCategoryId = (vehicle: Vehicle): string | null => {
    if (!vehicle.type) return null;
    const type = vehicle.type.trim().toLowerCase();
    const exact = categories.find((c) => c.name.trim().toLowerCase() === type);
    if (exact) return exact.id;
    const fuzzy = categories.find((c) => {
      const name = c.name.trim().toLowerCase();
      return name.includes(type) || type.includes(name);
    });
    return fuzzy?.id ?? null;
  };

  const vehicleOptions = useMemo(
    () =>
      clientVehicles
        .map((v) => ({
          vehicle: v,
          categoryId: mapVehicleToCategoryId(v),
          label: `${v.year} ${v.make} ${v.model}${v.type ? ` (${v.type})` : ''}`,
        }))
        .filter((opt) => Boolean(opt.categoryId)),
    [clientVehicles, categories]
  );

  useEffect(() => {
    if (!open) return;
    if (vehicleOptions.length === 0) {
      setVehicleCategoryId(null);
      return;
    }
    const defaultVehicle = vehicleOptions.find((opt) => opt.vehicle.isDefault) ?? vehicleOptions[0];
    setVehicleCategoryId(defaultVehicle.categoryId);
  }, [open, vehicleOptions]);

  const { offerings } = useServiceOfferings(detailer.id, vehicleCategoryId);

  const resolvedSelectedServices = useMemo(() => {
    if (initialSelectedServices.length === 0) return [];
    return offerings
      .filter((offering) => initialSelectedServices.some((s) => s.id === offering.id))
      .map((offering) => ({
        id: offering.id,
        name: offering.service.name,
        price: offering.price,
      }));
  }, [offerings, initialSelectedServices]);

  const selectedServicesForDisplay = useMemo(() => {
    if (resolvedSelectedServices.length > 0) {
      return resolvedSelectedServices.map((s) => ({ id: s.id, name: s.name, price: s.price, hasPrice: true }));
    }
    
    // If we have initial services but no resolved services, and we have offerings, try to match them
    if (initialSelectedServices.length > 0 && offerings.length > 0) {
      const matchedServices = initialSelectedServices.map((initialService) => {
        const matchedOffering = offerings.find(offering => offering.id === initialService.id);
        if (matchedOffering) {
          return {
            id: initialService.id,
            name: initialService.name,
            price: matchedOffering.price,
            hasPrice: true
          };
        }
        return {
          id: initialService.id,
          name: initialService.name,
          price: typeof initialService.price === 'number' ? initialService.price : 0,
          hasPrice: typeof initialService.price === 'number' && initialService.price >= 0,
        };
      });
      return matchedServices;
    }
    
    return initialSelectedServices.map((s) => ({
      id: s.id,
      name: s.name,
      price: typeof s.price === 'number' ? s.price : 0,
      hasPrice: typeof s.price === 'number' && s.price >= 0,
    }));
  }, [resolvedSelectedServices, initialSelectedServices, offerings]);

  const isLoadingPrices = initialSelectedServices.length > 0 && resolvedSelectedServices.length === 0 && vehicleCategoryId !== null;

  const subTotal = useMemo(() => {
    let calculatedSubTotal = 0;
    
    if (resolvedSelectedServices.length > 0) {
      calculatedSubTotal = resolvedSelectedServices.reduce((sum, s) => sum + s.price, 0);
    } else if (initialSelectedServices.length > 0 && offerings.length > 0) {
      // If we have initial services but no resolved services, and we have offerings, try to match them
      calculatedSubTotal = initialSelectedServices.reduce((sum, initialService) => {
        const matchedOffering = offerings.find(offering => offering.id === initialService.id);
        if (matchedOffering) {
          return sum + matchedOffering.price;
        }
        return sum + (typeof initialService.price === 'number' ? initialService.price : 0);
      }, 0);
    } else {
      calculatedSubTotal = initialSelectedServices.reduce((sum, s) => sum + (typeof s.price === 'number' ? s.price : 0), 0);
    }
    
    // Add validation to prevent unreasonably high amounts
    if (calculatedSubTotal > 10000) { // More than $10,000
      console.warn('Unusually high subtotal detected:', calculatedSubTotal);
      console.warn('Resolved services:', resolvedSelectedServices);
      console.warn('Initial services:', initialSelectedServices);
      console.warn('Offerings:', offerings);
      
      // If the amount seems to be in cents when it should be in dollars, convert it
      if (calculatedSubTotal > 100000) { // More than $100,000, likely in cents
        console.warn('Converting from cents to dollars');
        calculatedSubTotal = calculatedSubTotal / 100;
      }
    }
    
    // Cap at reasonable maximum ($5,000)
    return Math.min(calculatedSubTotal, 5000);
  }, [resolvedSelectedServices, initialSelectedServices, offerings]);
  const discount = promoApplied ? subTotal * 0.1 : 0; // Will be updated by promo validation
  const total = Math.max(0, subTotal - discount);

  const effectiveServiceIds = useMemo(
    () => (resolvedSelectedServices.length > 0 ? resolvedSelectedServices.map((s) => s.id) : initialSelectedServices.map((s) => s.id)),
    [resolvedSelectedServices, initialSelectedServices]
  );

  const applyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoApplied(false);
      setPromoCodeId(null);
      return;
    }

    setPromoValidating(true);
    try {
      const result = await PromoCodeService.validatePromoCode(
        code,
        detailer.id,
        clientId,
        subTotal
      );

      if (result.valid) {
        setPromoApplied(true);
        setPromoCodeId(result.promo_code_id || null);
        // Update discount calculation based on actual promo code
        // For now, we'll keep the simple 10% calculation
        // In a full implementation, you'd store the discount amount from the result
      } else {
        setPromoApplied(false);
        setPromoCodeId(null);
        onError(result.error_message || 'Invalid promo code');
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      setPromoApplied(false);
      setPromoCodeId(null);
      onError('Failed to validate promo code');
    } finally {
      setPromoValidating(false);
    }
  };

  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const handleProceedToPay = async () => {
    console.log('Proceed to Pay button clicked');

    if (effectiveServiceIds.length === 0) {
      onError('Please select services on the gig page before requesting quote');
      return;
    }
    if (detailer.id === clientId) {
      onError('You cannot request service from yourself');
      return;
    }

    if (!detailerStripeAccountId) {
      onError('This detailer has not set up their payment account yet. Please try another detailer.');
      return;
    }

    // Create the order FIRST, then show payment form
    setSubmitting(true);
    try {
      console.log('Creating order before payment...');
      
      const paymentMeta = `Payment: Stripe Marketplace | subtotal=${subTotal.toFixed(2)} | discount=${discount.toFixed(2)} | total=${total.toFixed(2)}${promoApplied ? ` | promo=${promoCode.trim().toUpperCase()}` : ''}`;
      const mergedNotes = [paymentMeta, notes.trim()].filter(Boolean).join('\n');

      let orderId: string;

      if (vehicleCategoryId) {
        console.log('Creating order with services...');
        const orderWithServices = await createOrderWithServices({
          dealer_id: detailer.id,
          vehicle_category_id: vehicleCategoryId,
          service_offering_ids: effectiveServiceIds,
          notes: mergedNotes || undefined,
        });
        orderId = orderWithServices.id;
        console.log('Order created with services:', orderId);
      } else {
        console.log('Creating legacy order...');
        const legacyOrder = await createOrder(
          {
            gig_id: detailer.id,
            dealer_id: detailer.id,
            proposed_price: total,
            notes: mergedNotes || undefined,
          },
          clientId
        );
        orderId = legacyOrder.id;
        console.log('Legacy order created:', orderId);
      }

      // Store the created order ID and show payment form
      setCreatedOrderId(orderId);
      console.log('Showing marketplace payment form with order ID:', orderId);
      setShowStripeCheckout(true);
      
    } catch (err: unknown) {
      console.error('Error creating order:', err);
      const msg = err instanceof Error ? err.message : 'Failed to create order';
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStripeSuccess = async (paymentIntentId: string) => {
    // After successful marketplace payment, complete the flow
    console.log('Payment successful, completing order flow...');
    
    if (!createdOrderId) {
      onError('Order ID not found after payment');
      return;
    }

    try {
      console.log('Order creation and payment successful, calling onSuccess...');
      onSuccess(createdOrderId);
      
      console.log('Closing modal...');
      onOpenChange(false);
      
      // Reset form state
      setPromoCode('');
      setPromoApplied(false);
      setNotes('');
      setShowStripeCheckout(false);
      setCreatedOrderId(null);
      
      console.log('handleStripeSuccess completed successfully');
    } catch (err: unknown) {
      console.error('Error in handleStripeSuccess:', err);
      const msg = err instanceof Error ? err.message : 'Failed to complete order';
      onError(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment & Checkout</DialogTitle>
          <DialogDescription>
            Review total and complete your quote request for {detailer.businessName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {!showStripeCheckout ? (
            <>
              <div className="rounded-lg border p-3 bg-gray-50">
                <p className="text-sm font-medium mb-2">Selected Services</p>
                {selectedServicesForDisplay.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedServicesForDisplay.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <span>{s.name}</span>
                        <span className="font-medium">
                          {isLoadingPrices ? 'Loading...' : s.hasPrice ? `$${s.price.toFixed(2)}` : 'Selected'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No services selected on gig page.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="promo">Promo Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="promo"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoApplied(false);
                      setPromoCodeId(null);
                    }}
                    placeholder="Enter promo code"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={applyPromo}
                    disabled={promoValidating || !promoCode.trim()}
                  >
                    {promoValidating ? 'Checking...' : 'Apply'}
                  </Button>
                </div>
                {promoApplied && (
                  <p className="text-xs text-green-600">
                    Promo applied: {promoCode.toUpperCase()} - {((discount / subTotal) * 100).toFixed(0)}% off
                  </p>
                )}
              </div>

              <div className="rounded-lg border p-3 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Discount</span>
                  <span>- ${discount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold pt-1 border-t">
                  <span>Total Payment</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleProceedToPay}
                  disabled={submitting || effectiveServiceIds.length === 0}
                >
                  {submitting ? 'Processing...' : 'Proceed to Pay'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            createdOrderId ? (
              <ClientPaymentForm
                orderId={createdOrderId} // Use the real order ID created before payment
                amount={Math.round(total * 100)} // Convert to cents
                detailerStripeAccountId={detailerStripeAccountId!}
                onSuccess={handleStripeSuccess}
                onError={onError}
                onCancel={() => setShowStripeCheckout(false)}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Creating order...</p>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
