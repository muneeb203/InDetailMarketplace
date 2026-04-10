import { useState, useEffect, useCallback } from 'react';
import { fetchClientOrders, subscribeToClientOrders, updateOrderStatus, clientRejectOrder } from '../services/orderService';
import type { Order } from '../types';

export interface BookingDisplay {
  id: string;
  orderId: string;
  dealerId: string;
  serviceType: string;
  detailerName: string;
  detailerAvatar: string;
  vehicleName: string;
  date: string;
  time: string;
  price: number;
  status: 'requested' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
  detailerPhone: string;
  detailerEmail: string;
  serviceDetails: string[];
  estimatedDuration: string;
  notes: string | null;
}

function mapOrderToBooking(order: Order): BookingDisplay {
  const statusMap: Record<Order['status'], BookingDisplay['status']> = {
    pending: 'requested',
    countered: 'requested',
    accepted: 'accepted',
    rejected: 'cancelled',
    paid: 'accepted',
    in_progress: 'in-progress',
    completed: 'completed',
  };
  const price = order.agreed_price ?? order.proposed_price;
  const serviceType = order.notes?.slice(0, 60) || 'Detailing Service';
  return {
    id: order.id,
    orderId: order.id,
    dealerId: order.dealer_id,
    serviceType: serviceType + (order.notes && order.notes.length > 60 ? '…' : ''),
    detailerName: order.dealer?.business_name ?? 'Detailer',
    detailerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(order.dealer?.business_name ?? order.dealer_id),
    vehicleName: 'Your vehicle',
    date: order.scheduled_date ?? new Date(order.created_at).toISOString().split('T')[0],
    time: 'TBD',
    price,
    status: statusMap[order.status],
    location: order.dealer?.base_location ?? '—',
    detailerPhone: '—',
    detailerEmail: '—',
    serviceDetails: order.notes ? [order.notes.slice(0, 50)] : ['Detailing Service'],
    estimatedDuration: '—',
    notes: order.notes,
  };
}

export function useClientBookings(clientId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(!!clientId);

  const mergeOrder = useCallback((order: Order) => {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === order.id);
      const next = [...prev];
      if (idx >= 0) next[idx] = order;
      else next.unshift(order);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!clientId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchClientOrders(clientId)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));

    const unsub = subscribeToClientOrders(clientId, mergeOrder, mergeOrder);
    return () => unsub();
  }, [clientId, mergeOrder]);

  const cancelOrder = useCallback(async (orderId: string, bookingStatus?: string) => {
    // Use RPC for requested (pending/countered) to bypass RLS; direct update for accepted/in-progress
    const useRpc = bookingStatus === 'requested';
    const updated = useRpc
      ? await clientRejectOrder(orderId)
      : await updateOrderStatus(orderId, 'rejected');
    mergeOrder(updated);
  }, [mergeOrder]);

  const bookings = orders.map(mapOrderToBooking);
  return { bookings, loading, cancelOrder, refetch: () => clientId && fetchClientOrders(clientId).then(setOrders) };
}
