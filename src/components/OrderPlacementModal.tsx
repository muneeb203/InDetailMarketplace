import { useState } from 'react';
import { Detailer } from '../types';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import { VehicleCategorySelector } from './VehicleCategorySelector';
import { ServiceSelectionList } from './ServiceSelectionList';
import { OrderSummary } from './OrderSummary';
import { createOrderWithServices } from '../services/orderService';

interface OrderPlacementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detailer: Detailer;
  clientId: string;
  onSuccess: (orderId: string) => void;
  onError: (message: string) => void;
}

export function OrderPlacementModal({
  open,
  onOpenChange,
  detailer,
  clientId,
  onSuccess,
  onError,
}: OrderPlacementModalProps) {
  const [vehicleCategoryId, setVehicleCategoryId] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<{
    id: string;
    name: string;
    price: number;
  }[]>([]);
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicleCategoryId) {
      onError('Please select a vehicle category');
      return;
    }
    
    if (selectedServices.length === 0) {
      onError('Please select at least one service');
      return;
    }
    
    if (detailer.id === clientId) {
      onError('You cannot request service from yourself');
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrderWithServices({
        dealer_id: detailer.id,
        vehicle_category_id: vehicleCategoryId,
        service_offering_ids: selectedServices.map(s => s.id),
        notes: notes.trim() || undefined,
      });
      
      onSuccess(order.id);
      onOpenChange(false);
      
      // Reset form
      setVehicleCategoryId(null);
      setSelectedServices([]);
      setNotes('');
      setScheduledDate('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create order';
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleService = (id: string, price: number, name: string) => {
    const existingService = selectedServices.find(s => s.id === id);
    
    if (existingService) {
      // Remove service
      setSelectedServices(prev => prev.filter(s => s.id !== id));
    } else {
      // Add service
      setSelectedServices(prev => [...prev, { id, name, price }]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Service</DialogTitle>
          <DialogDescription>
            Request service from {detailer.businessName}. Select your vehicle type and services.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Category */}
          <VehicleCategorySelector
            value={vehicleCategoryId}
            onChange={setVehicleCategoryId}
            required
          />

          {/* Services with Pricing */}
          <ServiceSelectionList
            dealerId={detailer.id}
            vehicleCategoryId={vehicleCategoryId}
            selectedOfferingIds={selectedServices.map(s => s.id)}
            onToggleOffering={handleToggleService}
          />

          {/* Order Summary */}
          {selectedServices.length > 0 && (
            <OrderSummary items={selectedServices} />
          )}

          {/* Scheduled Date */}
          <div className="space-y-2">
            <Label htmlFor="scheduled_date">Preferred Date (optional)</Label>
            <input
              id="scheduled_date"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requests or details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || selectedServices.length === 0 || !vehicleCategoryId}
            >
              {submitting ? 'Submitting...' : 'Confirm Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

