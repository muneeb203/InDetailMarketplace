import { useState } from 'react';
import { Detailer } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
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
import { DollarSign, Calendar } from 'lucide-react';

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
  const [proposedPrice, setProposedPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(proposedPrice);
    if (!price || price <= 0) {
      onError('Proposed price must be greater than 0');
      return;
    }
    if (detailer.id === clientId) {
      onError('You cannot request service from yourself');
      return;
    }

    setSubmitting(true);
    try {
      const { createOrder } = await import('../services/orderService');
      const order = await createOrder(
        {
          gig_id: detailer.id,
          dealer_id: detailer.id,
          proposed_price: price,
          notes: notes.trim() || undefined,
          scheduled_date: scheduledDate || undefined,
        },
        clientId
      );
      onSuccess(order.id);
      onOpenChange(false);
      setProposedPrice('');
      setNotes('');
      setScheduledDate('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create order';
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Service</DialogTitle>
          <DialogDescription>
            Request service from {detailer.businessName}. Enter your proposed price and any details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proposed_price">Proposed Price ($) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="proposed_price"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_date">Scheduled Date (optional)</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="scheduled_date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

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
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
