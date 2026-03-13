import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { MarketplaceOrder } from '../../types/marketplacePayments';
import { JobCompletionService } from '../../services/jobCompletion';

interface ClientConfirmationModalProps {
  order: MarketplaceOrder;
  onConfirm: () => void;
  onDispute: () => void;
  onClose: () => void;
}

export const ClientConfirmationModal: React.FC<ClientConfirmationModalProps> = ({
  order,
  onConfirm,
  onDispute,
  onClose
}) => {
  const [feedback, setFeedback] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const result = await JobCompletionService.processClientConfirmation({
        order_id: order.id,
        client_id: order.client_id,
        confirmed: true,
        feedback: feedback.trim() || undefined
      });

      if (result.success) {
        onConfirm();
      } else {
        alert('Failed to confirm job completion. Please try again.');
      }
    } catch (error) {
      console.error('Error confirming job:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDispute = async () => {
    setIsDisputing(true);
    try {
      const result = await JobCompletionService.processClientConfirmation({
        order_id: order.id,
        client_id: order.client_id,
        confirmed: false,
        feedback: feedback.trim() || 'Client reported an issue with the service'
      });

      if (result.success) {
        onDispute();
      } else {
        alert('Failed to report issue. Please try again.');
      }
    } catch (error) {
      console.error('Error reporting dispute:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsDisputing(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const getTimeRemaining = () => {
    if (!order.confirmation_deadline) return null;
    
    const deadline = new Date(order.confirmation_deadline);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle>Service Completed</CardTitle>
          </div>
          <CardDescription>
            Your detailer has marked the job as completed. Please confirm the service quality.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Order Details */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Service Amount:</span>
              <span className="font-medium">{formatCurrency(order.amount_total || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Detailer:</span>
              <span className="font-medium">{order.dealer?.business_name || 'Professional Detailer'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Awaiting Confirmation
              </Badge>
            </div>
          </div>

          {/* Time Remaining */}
          {order.confirmation_deadline && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{getTimeRemaining()}</span>
            </div>
          )}

          {/* Auto-release Notice */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Auto-release Notice</p>
                <p>If you don't respond within 48 hours, the remaining payment will be automatically released to the detailer.</p>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Feedback (Optional)
            </label>
            <Textarea
              placeholder="Share your experience with the service..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleConfirm}
              disabled={isConfirming || isDisputing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isConfirming ? 'Confirming...' : 'Confirm Complete'}
            </Button>
            <Button
              onClick={handleDispute}
              disabled={isConfirming || isDisputing}
              variant="outline"
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              {isDisputing ? 'Reporting...' : 'Report Issue'}
            </Button>
          </div>

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full"
            disabled={isConfirming || isDisputing}
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};