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
import { StripeCheckout } from './StripeCheckout';

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
  const [submitting, setSubmitting] = useState(false);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);

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
    if (resolvedSelectedServices.length > 0) {
      return resolvedSelectedServices.reduce((sum, s) => sum + s.price, 0);
    }
    
    // If we have initial services but no resolved services, and we have offerings, try to match them
    if (initialSelectedServices.length > 0 && offerings.length > 0) {
      return initialSelectedServices.reduce((sum, initialService) => {
        const matchedOffering = offerings.find(offering => offering.id === initialService.id);
        if (matchedOffering) {
          return sum + matchedOffering.price;
        }
        return sum + (typeof initialService.price === 'number' ? initialService.price : 0);
      }, 0);
    }
    
    return initialSelectedServices.reduce((sum, s) => sum + (typeof s.price === 'number' ? s.price : 0), 0);
  }, [resolvedSelectedServices, initialSelectedServices, offerings]);
  const discount = promoApplied && promoCode.trim().toUpperCase() === 'SAVE10' ? subTotal * 0.1 : 0;
  const total = Math.max(0, subTotal - discount);

  const effectiveServiceIds = useMemo(
    () => (resolvedSelectedServices.length > 0 ? resolvedSelectedServices.map((s) => s.id) : initialSelectedServices.map((s) => s.id)),
    [resolvedSelectedServices, initialSelectedServices]
  );

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'SAVE10') {
      setPromoApplied(true);
      return;
    }
    setPromoApplied(false);
    onError('Invalid promo code. Try SAVE10');
  };

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

    // After basic validation, show Stripe checkout to collect payment details.
    console.log('Showing Stripe checkout');
    setShowStripeCheckout(true);
  };

  const handleStripeSuccess = async () => {
    // After successful Stripe payment, create the order
    console.log('handleStripeSuccess called');
    setSubmitting(true);
    
    try {
      const paymentMeta = `Payment: card (Stripe) | subtotal=${subTotal.toFixed(2)} | discount=${discount.toFixed(2)} | total=${total.toFixed(2)}${promoApplied ? ` | promo=${promoCode.trim().toUpperCase()}` : ''}`;
      const mergedNotes = [paymentMeta, notes.trim()].filter(Boolean).join('\n');

      console.log('Creating order with notes:', mergedNotes);

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
        // Fallback: no vehicle category, use legacy order with proposed_price = final total
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

      console.log('Order creation successful, calling onSuccess...');
      onSuccess(orderId);
      
      console.log('Closing modal...');
      onOpenChange(false);
      
      // Reset form state
      setPromoCode('');
      setPromoApplied(false);
      setNotes('');
      setShowStripeCheckout(false);
      
      console.log('handleStripeSuccess completed successfully');
    } catch (err: unknown) {
      console.error('Error in handleStripeSuccess:', err);
      const msg = err instanceof Error ? err.message : 'Failed to create order';
      console.error('Error message:', msg);
      onError(msg);
    } finally {
      setSubmitting(false);
      console.log('handleStripeSuccess finally block executed');
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
                  <ul className="space-y-1.5 list-none p-0 m-0">
                    {selectedServicesForDisplay.map((s) => (
                      <li key={s.id} className="flex items-center justify-between text-sm">
                        <span>{s.name}</span>
                        <span className="font-medium">
                          {isLoadingPrices ? 'Loading...' : s.hasPrice ? `$${s.price.toFixed(2)}` : 'Selected'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No services selected on gig page.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="promo">Promo Code (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="promo"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoApplied(false);
                    }}
                    placeholder="Enter code (e.g. SAVE10)"
                  />
                  <Button type="button" variant="outline" onClick={applyPromo}>
                    Apply
                  </Button>
                </div>
                {promoApplied && (
                  <p className="text-xs text-green-600">Promo applied: 10% off</p>
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
            <StripeCheckout
              amount={total}
              onSuccess={handleStripeSuccess}
              onCancel={() => setShowStripeCheckout(false)}
              onError={onError}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
