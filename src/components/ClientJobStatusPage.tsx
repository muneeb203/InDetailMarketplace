import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  MapPin, 
  MessageSquare, 
  FileText, 
  XCircle,
  Play,
  ArrowLeft,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from "sonner";
import { fetchOrderById } from '../services/orderService';
import type { Order } from '../types';

type JobStatus = 'requested' | 'accepted' | 'on-the-way' | 'started' | 'completed' | 'cancelled';

interface ClientJobStatusPageProps {
  bookingId: string; // Now required - the order ID
  onBack?: () => void;
  onNavigateToMessages?: () => void;
}

export function ClientJobStatusPage({ 
  bookingId,
  onBack,
  onNavigateToMessages 
}: ClientJobStatusPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Fetch real order data
  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchOrderById(bookingId);
        if (!data) {
          setError('Order not found');
        } else {
          setOrder(data);
        }
      } catch (err: any) {
        console.error('Error loading order:', err);
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    }
    
    if (bookingId) {
      loadOrder();
    }
  }, [bookingId]);

  const handleMessageDetailer = () => {
    if (onNavigateToMessages) {
      onNavigateToMessages();
    } else {
      toast.info('Opening conversation...');
    }
  };

  const handleCancelJob = () => {
    toast.success('Booking cancelled. Refund will be processed within 3-5 business days.');
    setShowCancelDialog(false);
    // TODO: Update order status to 'rejected' in database
  };

  // Map order status to job status steps
  const getStatusStep = (status: Order['status']): number => {
    const statusMap: Record<Order['status'], number> = {
      'pending': 0,
      'countered': 0,
      'accepted': 1,
      'rejected': -1,
      'paid': 2,
      'in_progress': 3,
      'completed': 4,
    };
    return statusMap[status] ?? 0;
  };

  const canCancel = order && ['pending', 'countered', 'accepted'].includes(order.status);

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-b from-[#EAF5FF] to-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-[#EAF5FF] to-white">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'This order could not be loaded.'}</p>
            {onBack && (
              <Button onClick={onBack} variant="outline">
                Go Back
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#EAF5FF] to-white overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            {onBack && (
              <button
                onClick={onBack}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-xl">Job Status</h1>
              <p className="text-xs text-gray-600 leading-relaxed">
                Live updates from your trusted detailer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-4">
          {/* Detailer Info Card */}
          <Card className="p-4 border">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.dealer?.business_name || 'dealer'}`} />
                <AvatarFallback>{(order.dealer?.business_name || 'D')[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm truncate">{order.dealer?.business_name || 'Detailer'}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <span>Order #{order.id.slice(0, 8)}</span>
                </div>
              </div>
              <Button
                onClick={handleMessageDetailer}
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs border-[#0078FF] text-[#0078FF] hover:bg-[#0078FF] hover:text-white"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                Message
              </Button>
            </div>
          </Card>

          {/* Live Status Banner */}
          {currentStep > 0 && currentStep < 4 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-900">
                    {order.status === 'in_progress' && 'Service in progress'}
                    {order.status === 'paid' && 'Payment confirmed'}
                    {order.status === 'accepted' && 'Detailer accepted your request'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Last update {new Date(order.updated_at).toLocaleString()}
              </p>
            </motion.div>
          )}

          {/* Status Timeline */}
          <Card className="p-4 border">
            <h2 className="text-sm mb-4">Progress</h2>
            <div className="relative">
              {[
                { id: 'pending', label: 'Requested', icon: Circle },
                { id: 'accepted', label: 'Accepted', icon: Circle },
                { id: 'paid', label: 'Payment Confirmed', icon: Circle },
                { id: 'in_progress', label: 'In Progress', icon: Play },
                { id: 'completed', label: 'Completed', icon: CheckCircle2 },
              ].map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="relative">
                    <div className="flex gap-3 pb-6 last:pb-0">
                      {/* Icon */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isCurrent
                              ? 'bg-[#0078FF] text-white animate-pulse'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </div>

                        {/* Connector Line */}
                        {index < 4 && (
                          <div
                            className={`absolute left-4 top-8 w-0.5 h-6 transition-all ${
                              isCompleted ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`text-sm ${
                              isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                            }`}
                          >
                            {step.label}
                          </h3>
                        </div>
                        {isCurrent && (
                          <p className="text-xs text-[#0078FF] mt-1">Current status</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Booking Details Summary */}
          <Card className="p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm">Booking Details</h2>
              <Button
                onClick={() => setShowDetailsModal(true)}
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-[#0078FF] hover:bg-blue-50"
              >
                View Full Details
              </Button>
            </div>

            <div className="space-y-2.5">
              {order.scheduled_date && (
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#0078FF] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Scheduled</p>
                    <p className="text-sm text-gray-900">
                      {new Date(order.scheduled_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              )}

              {order.dealer?.base_location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#0078FF] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Service Area</p>
                    <p className="text-sm text-gray-900">{order.dealer.base_location}</p>
                  </div>
                </div>
              )}

              {order.notes && (
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-[#0078FF] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Notes</p>
                    <p className="text-sm text-gray-900">{order.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleMessageDetailer}
              className="w-full bg-[#0078FF] hover:bg-[#0056CC] text-white h-11"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Detailer
            </Button>

            {canCancel && (
              <Button
                onClick={() => setShowCancelDialog(true)}
                variant="outline"
                className="w-full h-11 border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Full Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Booking Details</DialogTitle>
            <DialogDescription className="text-xs">
              Order ID: {order.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {order.notes && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Service Notes</p>
                <p className="text-sm text-gray-900">{order.notes}</p>
              </div>
            )}

            {order.scheduled_date && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Scheduled</p>
                <p className="text-sm text-gray-900">
                  {new Date(order.scheduled_date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            )}

            {order.dealer?.base_location && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Service Area</p>
                <p className="text-sm text-gray-900">{order.dealer.base_location}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-600 mb-1">Detailer</p>
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.dealer?.business_name || 'dealer'}`} />
                  <AvatarFallback>{(order.dealer?.business_name || 'D')[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-900">{order.dealer?.business_name || 'Detailer'}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total</span>
                <span className="text-base text-gray-900">
                  ${order.agreed_price ?? order.proposed_price}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Cancel Booking?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to cancel this booking? A full refund will be processed within
              3-5 business days.
              {!canCancel && (
                <span className="block mt-2 text-red-600">
                  Cancellation is only available before the detailer is on the way.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelJob}
              className="bg-red-600 hover:bg-red-700 text-xs"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
