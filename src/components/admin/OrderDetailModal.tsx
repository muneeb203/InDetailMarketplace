import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  User, 
  Store, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  CreditCard,
  Package
} from 'lucide-react';
import { adminOrderService, AdminOrderDetails } from '../../services/adminOrderService';
import { toast } from 'sonner';

interface OrderDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
  onOrderUpdated?: () => void;
}

export function OrderDetailModal({ open, onOpenChange, orderId, onOrderUpdated }: OrderDetailModalProps) {
  const [order, setOrder] = useState<AdminOrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open && orderId) {
      loadOrderDetails();
    }
  }, [open, orderId]);

  const loadOrderDetails = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const orderDetails = await adminOrderService.getOrderDetails(orderId);
      setOrder(orderDetails);
      setNewStatus(orderDetails?.bookingStatus || '');
      setNotes('');
    } catch (error) {
      console.error('Failed to load order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order || !newStatus) return;

    setUpdating(true);
    try {
      const result = await adminOrderService.updateOrderStatus(order.id, newStatus, notes || undefined);
      
      if (result.success) {
        toast.success('Order status updated successfully');
        onOrderUpdated?.();
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    setUpdating(true);
    try {
      const result = await adminOrderService.cancelOrder(order.id, notes || undefined);
      
      if (result.success) {
        toast.success('Order cancelled successfully');
        onOrderUpdated?.();
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'countered':
        return <Badge variant="default" className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Countered</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'paid':
        return <Badge variant="default" className="bg-blue-500"><DollarSign className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-orange-500"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-blue-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'held':
        return <Badge variant="default" className="bg-blue-500"><DollarSign className="w-3 h-3 mr-1" />Held</Badge>;
      case 'partial_released':
        return <Badge variant="default" className="bg-yellow-500"><DollarSign className="w-3 h-3 mr-1" />Partial</Badge>;
      case 'fully_released':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Released</Badge>;
      case 'refunded':
        return <Badge variant="destructive">Refunded</Badge>;
      case 'dispute_hold':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Dispute Hold</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            {order ? `Order ID: ${order.id}` : 'Loading order details...'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading order details...</div>
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Order Status and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Booking Status:</span>
                    {getStatusBadge(order.bookingStatus)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payment Status:</span>
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </div>
                  {order.hasDispute && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      Dispute Active
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                  </div>
                  {order.proposedPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Proposed Price:</span>
                      <span>${order.proposedPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {order.agreedPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Agreed Price:</span>
                      <span>${order.agreedPrice.toFixed(2)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Client and Detailer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Name:</span>
                    <div className="font-medium">{order.clientName}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <div className="text-sm">{order.clientEmail}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    Detailer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Business Name:</span>
                    <div className="font-medium">{order.detailerName}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <div className="text-sm">{order.detailerEmail}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dates and Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Created:</span>
                    <div className="text-sm">{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <div className="text-sm">{new Date(order.updatedAt).toLocaleString()}</div>
                  </div>
                  {order.scheduledDate && (
                    <div>
                      <span className="text-sm text-gray-600">Scheduled Date:</span>
                      <div className="text-sm">{new Date(order.scheduledDate).toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            {order.services && order.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm">{service.serviceName}</span>
                        <span className="text-sm font-medium">${service.priceAtOrder.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{order.notes}</p>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Admin Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin Actions</CardTitle>
                <CardDescription>Update order status or add notes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Update Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="countered">Countered</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes about this status change..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={updating || !newStatus || newStatus === order.bookingStatus}
                  >
                    {updating ? 'Updating...' : 'Update Status'}
                  </Button>
                  
                  {order.bookingStatus !== 'rejected' && order.bookingStatus !== 'completed' && (
                    <Button
                      variant="destructive"
                      onClick={handleCancelOrder}
                      disabled={updating}
                    >
                      {updating ? 'Cancelling...' : 'Cancel Order'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Order not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}