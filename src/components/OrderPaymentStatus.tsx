import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  DollarSign,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { PaymentStatusCard } from './payments/PaymentStatusCard';
import { ClientConfirmationModal } from './payments/ClientConfirmationModal';
import { MarketplaceOrder } from '../types/marketplacePayments';
import { MarketplacePaymentService } from '../services/marketplacePayments';
import { PayoutProcessingService } from '../services/payoutProcessing';

interface OrderPaymentStatusProps {
  orderId: string;
  userRole: 'client' | 'detailer';
  userId: string;
  onStatusUpdate?: () => void;
}

export function OrderPaymentStatus({ 
  orderId, 
  userRole, 
  userId, 
  onStatusUpdate 
}: OrderPaymentStatusProps) {
  const [order, setOrder] = useState<MarketplaceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOrderPaymentStatus();
  }, [orderId]);

  const fetchOrderPaymentStatus = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would fetch the order with payment details
      // For now, we'll create a mock order structure
      const mockOrder: MarketplaceOrder = {
        id: orderId,
        gig_id: 'gig-123',
        client_id: userRole === 'client' ? userId : 'other-client',
        dealer_id: userRole === 'detailer' ? userId : 'other-dealer',
        proposed_price: 15000, // $150.00
        agreed_price: 15000,
        notes: 'Full car detailing service',
        scheduled_date: new Date().toISOString(),
        status: 'accepted',
        marketplace_status: 'paid',
        amount_total: 15000, // $150.00 in cents
        amount_upfront: 2250, // 15% = $22.50
        amount_remaining: 12750, // 85% = $127.50
        platform_fee: 465, // Platform fee
        confirmation_deadline: null,
        auto_release_scheduled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
        confirmed_at: null,
        opened_at: new Date().toISOString(),
        dealer: {
          id: 'dealer-123',
          business_name: 'Premium Auto Detailing',
          base_location: 'Los Angeles, CA'
        },
        client: {
          id: 'client-123',
          name: 'John Smith'
        }
      };

      setOrder(mockOrder);
    } catch (err) {
      setError('Failed to load payment status');
      console.error('Error fetching order payment status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async () => {
    if (!order || userRole !== 'detailer') return;
    
    setProcessing(true);
    try {
      const result = await PayoutProcessingService.processUpfrontPayout(orderId, userId);
      if (result.success) {
        // Update order status
        setOrder(prev => prev ? { ...prev, marketplace_status: 'in_progress' } : null);
        onStatusUpdate?.();
      } else {
        setError(result.error?.message || 'Failed to process upfront payout');
      }
    } catch (err) {
      setError('Failed to accept job');
      console.error('Error accepting job:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!order || userRole !== 'detailer') return;
    
    setProcessing(true);
    try {
      // Mark job as complete and schedule auto-release
      setOrder(prev => prev ? { 
        ...prev, 
        marketplace_status: 'detailer_marked_done',
        confirmation_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        auto_release_scheduled: true
      } : null);
      onStatusUpdate?.();
    } catch (err) {
      setError('Failed to mark job complete');
      console.error('Error marking job complete:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmComplete = async () => {
    if (!order || userRole !== 'client') return;
    
    setProcessing(true);
    try {
      const result = await PayoutProcessingService.processCompletionPayout(orderId, order.dealer_id);
      if (result.success) {
        setOrder(prev => prev ? { 
          ...prev, 
          marketplace_status: 'completed',
          confirmed_at: new Date().toISOString()
        } : null);
        setShowConfirmationModal(false);
        onStatusUpdate?.();
      } else {
        setError(result.error?.message || 'Failed to process final payout');
      }
    } catch (err) {
      setError('Failed to confirm completion');
      console.error('Error confirming completion:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReportIssue = () => {
    if (!order) return;
    
    setOrder(prev => prev ? { ...prev, marketplace_status: 'disputed' } : null);
    setShowConfirmationModal(false);
    onStatusUpdate?.();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading payment status...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!order) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Order not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <PaymentStatusCard
        order={order}
        userRole={userRole}
        onConfirmComplete={() => setShowConfirmationModal(true)}
        onReportIssue={() => setShowConfirmationModal(true)}
        onAcceptJob={handleAcceptJob}
        onMarkComplete={handleMarkComplete}
        processing={processing}
      />

      {showConfirmationModal && (
        <ClientConfirmationModal
          order={order}
          onConfirm={handleConfirmComplete}
          onDispute={handleReportIssue}
          onClose={() => setShowConfirmationModal(false)}
        />
      )}
    </>
  );
}