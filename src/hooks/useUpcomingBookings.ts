import { useState, useEffect, useCallback } from 'react';
import { fetchDealerUpcomingOrders } from '../services/orderService';
import type { Order } from '../types';
import type { BookingItem, BookingStatus } from '../components/detailer/UpcomingBookings';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'TBD';
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function mapOrderToBookingItem(order: Order): BookingItem {
  const statusMap: Record<string, BookingStatus> = {
    accepted: 'confirmed',
    paid: 'confirmed',
    in_progress: 'confirmed',
  };
  const status = statusMap[order.status] ?? 'pending';
  const serviceType = order.notes?.slice(0, 40) ?? 'Detailing Service';
  return {
    id: order.id,
    clientName: order.client?.name ?? 'Client',
    serviceType: serviceType + (order.notes && order.notes.length > 40 ? '…' : ''),
    date: formatDate(order.scheduled_date),
    time: 'TBD',
    status,
  };
}

export function useUpcomingBookings(dealerId: string | undefined) {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!dealerId) return;
    setLoading(true);
    try {
      const orders = await fetchDealerUpcomingOrders(dealerId);
      setBookings(orders.map(mapOrderToBookingItem));
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [dealerId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { bookings, loading, refetch };
}
