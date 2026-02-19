import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Star, Loader2 } from 'lucide-react';
import { createReview } from '../services/dealerReviewService';

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  dealerId: string;
  clientId: string;
  dealerName: string;
  onSuccess?: () => void;
}

export function ReviewModal({
  open,
  onOpenChange,
  orderId,
  dealerId,
  clientId,
  dealerName,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayRating = hoverRating || rating;

  const handleSubmit = async () => {
    setError(null);
    if (rating < 1 || rating > 5) {
      setError('Please select a rating (1-5 stars)');
      return;
    }
    if (!orderId) {
      setError('Invalid order');
      return;
    }

    setSubmitting(true);
    try {
      await createReview({
        order_id: orderId,
        dealer_id: dealerId,
        client_id: clientId,
        rating,
        review_text: reviewText.trim() || undefined,
      });
      onSuccess?.();
      onOpenChange(false);
      setRating(0);
      setReviewText('');
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setRating(0);
      setHoverRating(0);
      setReviewText('');
      setError(null);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            How was your experience with {dealerName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Star rating */}
          <div>
            <p className="text-sm font-medium mb-2">Rating *</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= displayRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review text */}
          <div>
            <label htmlFor="review-text" className="text-sm font-medium block mb-2">
              Your review (optional)
            </label>
            <textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience..."
              className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={1000}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || rating < 1}>
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Submit Review'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
