import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  DollarSign
} from 'lucide-react';
import { MarketplaceOrder, MarketplaceOrderStatus } from '../../types/marketplacePayments';

interface PaymentStatusCardProps {
  order: MarketplaceOrder;
  userRole: 'client' | 'detailer';
  onConfirmComplete?: () => void;
  onReportIssue?: () => void;
}

export const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({
  order,
  userRole,
  onConfirmComplete,
  onReportIssue
}) => {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const getStatusInfo = (status: MarketplaceOrderStatus) => {
    const statusMap = {
      'pending_payment': {
        icon: CreditCard,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Payment Pending',
        description: 'Waiting for payment to be processed'
      },
      'paid': {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Payment Received',
        description: 'Payment captured, funds in escrow'
      },
      'detailer_notified': {
        icon: Clock,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        label: 'Detailer Notified',
        description: 'Waiting for detailer response'
      },
      'detailer_accepted': {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Job Accepted',
        description: 'Detailer accepted, upfront payment sent'
      },
      'detailer_rejected': {
        icon: XCircle,
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Job Declined',
        description: 'Detailer declined, refund processed'
      },
      'in_progress': {
        icon: Clock,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        label: 'In Progress',
        description: 'Service is being performed'
      },
      'detailer_marked_done': {
        icon: AlertTriangle,
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        label: 'Awaiting Confirmation',
        description: 'Detailer completed, awaiting client confirmation'
      },
      'client_confirmed': {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Confirmed Complete',
        description: 'Client confirmed, final payment sent'
      },
      'auto_confirmed': {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Auto-Confirmed',
        description: 'Auto-confirmed after timeout, final payment sent'
      },
      'completed': {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Completed',
        description: 'Job fully completed'
      },
      'disputed': {
        icon: AlertTriangle,
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Disputed',
        description: 'Payment disputed, under review'
      }
    };

    return statusMap[status] || statusMap['pending_payment'];
  };

  const statusInfo = getStatusInfo(order.marketplace_status);
  const StatusIcon = statusInfo.icon;

  const showConfirmationActions = 
    userRole === 'client' && 
    order.marketplace_status === 'detailer_marked_done';

  const getPaymentBreakdown = () => {
    if (!order.amount_total) return null;

    const upfrontPaid = order.marketplace_status === 'detailer_accepted' || 
                       ['in_progress', 'detailer_marked_done', 'client_confirmed', 'auto_confirmed', 'completed'].includes(order.marketplace_status);
    
    const finalPaid = ['client_confirmed', 'auto_confirmed', 'completed'].includes(order.marketplace_status);

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Total Amount:</span>
          <span className="font-medium">{formatCurrency(order.amount_total)}</span>
        </div>
        
        {order.amount_upfront && (
          <div className="flex justify-between text-sm">
            <span>Upfront Payment (15%):</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{formatCurrency(order.amount_upfront)}</span>
              {upfrontPaid && <CheckCircle className="h-4 w-4 text-green-600" />}
            </div>
          </div>
        )}
        
        {order.amount_remaining && (
          <div className="flex justify-between text-sm">
            <span>Final Payment (85%):</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{formatCurrency(order.amount_remaining)}</span>
              {finalPaid && <CheckCircle className="h-4 w-4 text-green-600" />}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Status
          </CardTitle>
          <Badge className={statusInfo.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{statusInfo.description}</p>
        
        {/* Payment Breakdown */}
        {getPaymentBreakdown() && (
          <div className="bg-gray-50 p-3 rounded-lg">
            {getPaymentBreakdown()}
          </div>
        )}

        {/* Auto-release countdown for detailer_marked_done */}
        {order.marketplace_status === 'detailer_marked_done' && order.confirmation_deadline && (
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-orange-800">
              <Clock className="h-4 w-4" />
              <span>
                Auto-release in: {(() => {
                  const deadline = new Date(order.confirmation_deadline);
                  const now = new Date();
                  const diff = deadline.getTime() - now.getTime();
                  
                  if (diff <= 0) return 'Expired';
                  
                  const hours = Math.floor(diff / (1000 * 60 * 60));
                  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                  
                  return `${hours}h ${minutes}m`;
                })()}
              </span>
            </div>
          </div>
        )}

        {/* Client Confirmation Actions */}
        {showConfirmationActions && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onConfirmComplete}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Confirm Complete
            </Button>
            <Button
              onClick={onReportIssue}
              variant="outline"
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              Report Issue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};