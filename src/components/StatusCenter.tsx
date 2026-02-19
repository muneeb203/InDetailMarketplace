import { useState, useEffect, useCallback } from 'react';
import { ClientJobStatusPage } from './ClientJobStatusPage';
import { DetailerJobStatusPage } from './DetailerJobStatusPage';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock, DollarSign, Activity, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchDealerUpcomingOrders, fetchClientUpcomingOrders } from '../services/orderService';
import type { Order } from '../types';

interface StatusCenterProps {
  role: 'client' | 'detailer';
  userId?: string;
  onNavigateToMessages?: (params?: { dealerId?: string }) => void;
}

type DisplayStatus = 'requested' | 'accepted' | 'on-the-way' | 'started' | 'completed';

interface BookingItem {
  id: string;
  serviceType: string;
  date: string;
  time: string;
  status: DisplayStatus;
  price: number;
  clientOrDetailerName: string;
  dealerId?: string;
  clientId?: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'TBD';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function mapOrderToBookingItem(order: Order, role: 'client' | 'detailer'): BookingItem {
  const statusMap: Record<string, DisplayStatus> = {
    accepted: 'accepted',
    paid: 'accepted',
    in_progress: 'started',
  };
  const status = statusMap[order.status] ?? 'accepted';
  const serviceType = order.notes?.slice(0, 50) ?? 'Detailing Service';
  const price = order.agreed_price ?? order.proposed_price;
  const clientOrDetailerName =
    role === 'detailer'
      ? (order.client?.name ?? 'Client')
      : (order.dealer?.business_name ?? 'Detailer');

  return {
    id: order.id,
    serviceType: serviceType + (order.notes && order.notes.length > 50 ? '…' : ''),
    date: formatDate(order.scheduled_date),
    time: 'TBD',
    status,
    price,
    clientOrDetailerName,
    dealerId: order.dealer_id,
    clientId: order.client_id,
  };
}

const statusConfig = {
  requested: {
    label: 'Requested',
    color: 'bg-blue-100 text-[#0078FF] border-blue-200',
    dotColor: 'bg-[#0078FF]',
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-green-100 text-green-700 border-green-200',
    dotColor: 'bg-green-500',
  },
  'on-the-way': {
    label: 'On the Way',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    dotColor: 'bg-yellow-500',
  },
  started: {
    label: 'In Progress',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    dotColor: 'bg-purple-500',
  },
  completed: {
    label: 'Completed',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    dotColor: 'bg-gray-500',
  },
};

export function StatusCenter({ role, userId, onNavigateToMessages }: StatusCenterProps) {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(!!userId);

  const fetchBookings = useCallback(async () => {
    if (!userId) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const orders =
        role === 'detailer'
          ? await fetchDealerUpcomingOrders(userId)
          : await fetchClientUpcomingOrders(userId);
      setBookings(orders.map((o) => mapOrderToBookingItem(o, role)));
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // If a specific booking is selected, show the detailed status page
  if (selectedBookingId) {
    const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
    const messageParams = role === 'client'
      ? { dealerId: selectedBooking?.dealerId }
      : undefined;
    return role === 'client' ? (
      <ClientJobStatusPage
        bookingId={selectedBookingId}
        onBack={() => setSelectedBookingId(null)}
        onNavigateToMessages={onNavigateToMessages ? () => onNavigateToMessages(messageParams) : undefined}
      />
    ) : (
      <DetailerJobStatusPage
        bookingId={selectedBookingId}
        onBack={() => setSelectedBookingId(null)}
        onNavigateToMessages={onNavigateToMessages ? () => onNavigateToMessages() : undefined}
      />
    );
  }

  // Otherwise, show the Status Center overview
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#EAF5FF] to-white overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl">Status Center</h1>
            <div className="w-8 h-8 bg-gradient-to-br from-[#0078FF] to-[#0056CC] rounded-full flex items-center justify-center shadow-md">
              <Activity className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            {role === 'client' 
              ? 'Track your active bookings and receive real-time updates from your detailer.'
              : 'Manage job status and keep your clients informed at every step.'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-4">
          {/* Active Bookings */}
          <div>
            <h2 className="text-sm mb-3 px-1">Active Jobs</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
            <div className="space-y-3">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="p-4 hover:shadow-md transition-all duration-300 border hover:border-[#0078FF]/30 cursor-pointer"
                    onClick={() => setSelectedBookingId(booking.id)}
                  >
                    <div className="space-y-3">
                      {/* Status Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <Badge className={`${statusConfig[booking.status].color} border px-2 py-0.5 text-xs`}>
                          <div className="flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${statusConfig[booking.status].dotColor} animate-pulse`} />
                            {statusConfig[booking.status].label}
                          </div>
                        </Badge>
                        <span className="text-xs text-gray-500">#{booking.id}</span>
                      </div>

                      {/* Service Info */}
                      <div>
                        <h3 className="text-sm mb-1">{booking.serviceType}</h3>
                        <p className="text-xs text-gray-600">
                          {role === 'client' ? `Detailer: ${booking.clientOrDetailerName}` : `Client: ${booking.clientOrDetailerName}`}
                        </p>
                      </div>

                      {/* Date, Time, Price */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Calendar className="w-3 h-3 text-[#0078FF]" />
                          {booking.date.split(',')[0]}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Clock className="w-3 h-3 text-[#0078FF]" />
                          {booking.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <DollarSign className="w-3 h-3 text-[#0078FF]" />
                          ${booking.price}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="pt-1 border-t border-gray-100">
                        <p className="text-xs text-[#0078FF]">
                          Tap to view detailed status →
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
            )}
          </div>

          {/* Empty State for no active jobs */}
          {!loading && bookings.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-sm mb-1">No Active Jobs</h3>
              <p className="text-xs text-gray-600">
                {role === 'client' 
                  ? 'Book your first detail to start tracking status updates!'
                  : 'Accept a lead to start tracking job status.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
