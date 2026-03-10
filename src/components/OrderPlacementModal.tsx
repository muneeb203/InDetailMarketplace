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
import { createOrderWithServices } from '../services/orderService';
import { useVehicleCategories } from '../hooks/useVehicleCategories';
import { useServiceOfferings } from '../hooks/useServiceOfferings';
import { StripeCheckout } from './StripeCheckout';

interface OrderPlacementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detailer: Detailer;
  clientId: string;
  clientVehicles: Vehicle[];
  initialSelectedServices?: { id: string; name: string }[];
  onSuccess: (orderId: string) => void;
  onError: (message: string) => void;
}

type PaymentMethod = 'card' | 'wallet' | 'cash';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
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

  const selectedServicesForDisplay = useMemo(
    () =>
      resolvedSelectedServices.length > 0
        ? resolvedSelectedServices.map((s) => ({ ...s, hasPrice: true }))
        : initialSelectedServices.map((s) => ({ ...s, price: 0, hasPrice: false })),
    [resolvedSelectedServices, initialSelectedServices]
  );

  const isLoadingPrices = initialSelectedServices.length > 0 && resolvedSelectedServices.length === 0 && vehicleCategoryId !== null;

  // Debug logging
  useEffect(() => {
    console.log('OrderPlacementModal Debug:', {
      vehicleCategoryId,
      offeringsCount: offerings.length,
      initialSelectedServicesCount: initialSelectedServices.length,
      offerings: offerings.map(o => ({ id: o.id, name: o.service.name, price: o.price })),
      initialSelectedServices,
      resolvedCount: resolvedSelectedServices.length,
      resolved: resolvedSelectedServices,
    });
  }, [vehicleCategoryId, offerings, initialSelectedServices, resolvedSelectedServices]);

  const subTotal = resolvedSelectedServices.reduce((sum, s) => sum + s.price, 0);
  const discount = promoApplied && promoCode.trim().toUpperCase() === 'SAVE10' ? subTotal * 0.1 : 0;
  const total = Math.max(0, subTotal - discount);

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'SAVE10') {
      setPromoApplied(true);
      return;
    }
    setPromoApplied(false);
    onError('Invalid promo code. Try SAVE10');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleCategoryId) {
      onError('Please select one of your saved vehicles');
      return;
    }
    if (resolvedSelectedServices.length === 0) {
      onError('Please select services on the gig page before requesting quote');
      return;
    }
    if (detailer.id === clientId) {
      onError('You cannot request service from yourself');
      return;
    }

    // Show Stripe checkout instead of submitting immediately
    if (paymentMethod === 'card' && !showStripeCheckout) {
      setShowStripeCheckout(true);
      return;
    }

    setSubmitting(true);
    try {
      const paymentMeta = `Payment: ${paymentMethod} | subtotal=${subTotal.toFixed(2)} | discount=${discount.toFixed(2)} | total=${total.toFixed(2)}${promoApplied ? ` | promo=${promoCode.trim().toUpperCase()}` : ''}`;
      const mergedNotes = [paymentMeta, notes.trim()].filter(Boolean).join('\n');

      const order = await createOrderWithServices({
        dealer_id: detailer.id,
        vehicle_category_id: vehicleCategoryId,
        service_offering_ids: resolvedSelectedServices.map((s) => s.id),
        notes: mergedNotes || undefined,
      });

      onSuccess(order.id);
      onOpenChange(false);
      setPromoCode('');
      setPromoApplied(false);
      setNotes('');
      setPaymentMethod('card');
      setShowStripeCheckout(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create order';
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStripeSuccess = async () => {
    // After successful Stripe payment, create the order
    setSubmitting(true);
    try {
      const paymentMeta = `Payment: card (Stripe) | subtotal=${subTotal.toFixed(2)} | discount=${discount.toFixed(2)} | total=${total.toFixed(2)}${promoApplied ? ` | promo=${promoCode.trim().toUpperCase()}` : ''}`;
      const mergedNotes = [paymentMeta, notes.trim()].filter(Boolean).join('\n');

      const order = await createOrderWithServices({
        dealer_id: detailer.id,
        vehicle_category_id: vehicleCategoryId!,
        service_offering_ids: resolvedSelectedServices.map((s) => s.id),
        notes: mergedNotes || undefined,
      });

      onSuccess(order.id);
      onOpenChange(false);
      setPromoCode('');
      setPromoApplied(false);
      setNotes('');
      setPaymentMethod('card');
      setShowStripeCheckout(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create order';
      onError(msg);
    } finally {
      setSubmitting(false);
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

        <form onSubmit={handleSubmit} className="space-y-5">
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

              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger id="payment-method" className="w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit / Debit Card</SelectItem>
                    <SelectItem value="wallet">Wallet / UPI</SelectItem>
                    <SelectItem value="cash">Cash on service</SelectItem>
                  </SelectContent>
                </Select>
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
                  type="submit"
                  disabled={submitting || resolvedSelectedServices.length === 0 || !vehicleCategoryId}
                >
                  {submitting ? 'Processing...' : paymentMethod === 'card' ? 'Proceed to Pay' : `Pay $${total.toFixed(2)} & Request Quote`}
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
