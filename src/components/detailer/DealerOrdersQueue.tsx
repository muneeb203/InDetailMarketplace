import { useEffect, useState, useCallback } from 'react';
import { Order } from '../../types';
import {
  fetchDealerOrders,
  subscribeToDealerOrders,
  updateOrderStatus,
  isAllowedDealerTransition,
} from '../../services/orderService';
import { markOrderOpened } from '../../services/exposureService';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Loader2,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';

interface DealerOrdersQueueProps {
  dealerId: string;
  onNavigate?: (view: string) => void;
}

const statusConfig: Record<Order['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
  pending: { label: 'Pending', variant: 'secondary', icon: Clock },
  countered: { label: 'Countered', variant: 'outline', icon: DollarSign },
  accepted: { label: 'Accepted', variant: 'default', icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle },
  paid: { label: 'Paid', variant: 'default', icon: CheckCircle },
  in_progress: { label: 'In Progress', variant: 'default', icon: Clock },
  completed: { label: 'Completed', variant: 'default', icon: CheckCircle },
};

export function DealerOrdersQueue({ dealerId, onNavigate }: DealerOrdersQueueProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [pendingCount, setPendingCount] = useState(0);

  const mergeOrder = useCallback((order: Order) => {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === order.id);
      const next = [...prev];
      if (idx >= 0) {
        next[idx] = order;
        return next;
      }
      return [order, ...next];
    });
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => {
      if (prev.some((o) => o.id === order.id)) return prev;
      return [order, ...prev];
    });
    if (order.status === 'pending') {
      setNewOrderIds((prev) => new Set(prev).add(order.id));
      setPendingCount((c) => c + 1);
      toast.success('New service request received.');
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchDealerOrders(dealerId)
      .then((data) => {
        if (mounted) setOrders(data);
      })
      .catch((err) => toast.error(err?.message || 'Failed to load orders'))
      .finally(() => mounted && setLoading(false));

    const unsub = subscribeToDealerOrders(dealerId, addOrder, mergeOrder);

    return () => {
      mounted = false;
      unsub();
    };
  }, [dealerId, addOrder, mergeOrder]);

  const clearNewHighlight = (orderId: string) => {
    setNewOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
        setPendingCount((c) => Math.max(0, c - 1));
      }
      return next;
    });
  };

  const pending = orders.filter((o) => o.status === 'pending' || o.status === 'countered');
  const active = orders.filter((o) => ['accepted', 'paid', 'in_progress'].includes(o.status));
  const completed = orders.filter((o) => o.status === 'completed');
  const rejected = orders.filter((o) => o.status === 'rejected');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Orders Queue</h2>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="gap-1">
            <Bell className="w-3 h-3" />
            {pendingCount} new
          </Badge>
        )}
      </div>

      {orders.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No orders yet</p>
          <p className="text-sm text-gray-400 mt-1">Service requests from clients will appear here</p>
        </Card>
      )}

      {pending.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Pending Requests</h3>
          <div className="space-y-3">
            {pending.map((order) => (
              <DealerOrderCard
                key={order.id}
                order={order}
                statusConfig={statusConfig}
                isNew={newOrderIds.has(order.id)}
                onClearNew={() => clearNewHighlight(order.id)}
                setUpdatingId={setUpdatingId}
                updatingId={updatingId}
                mergeOrder={mergeOrder}
              />
            ))}
          </div>
        </section>
      )}

      {active.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Orders</h3>
          <div className="space-y-3">
            {active.map((order) => (
              <DealerOrderCard
                key={order.id}
                order={order}
                statusConfig={statusConfig}
                isNew={false}
                onClearNew={() => {}}
                setUpdatingId={setUpdatingId}
                updatingId={updatingId}
                mergeOrder={mergeOrder}
              />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Completed Orders</h3>
          <div className="space-y-3">
            {completed.map((order) => (
              <DealerOrderCard
                key={order.id}
                order={order}
                statusConfig={statusConfig}
                isNew={false}
                onClearNew={() => {}}
                setUpdatingId={setUpdatingId}
                updatingId={updatingId}
                mergeOrder={mergeOrder}
              />
            ))}
          </div>
        </section>
      )}

      {rejected.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Rejected Orders</h3>
          <div className="space-y-3">
            {rejected.map((order) => (
              <DealerOrderCard
                key={order.id}
                order={order}
                statusConfig={statusConfig}
                isNew={false}
                onClearNew={() => {}}
                setUpdatingId={setUpdatingId}
                updatingId={updatingId}
                mergeOrder={mergeOrder}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DealerOrderCard({
  order,
  statusConfig,
  isNew,
  onClearNew,
  setUpdatingId,
  updatingId,
  mergeOrder,
}: {
  order: Order;
  statusConfig: typeof statusConfig;
  isNew: boolean;
  onClearNew: () => void;
  setUpdatingId: (id: string | null) => void;
  updatingId: string | null;
  mergeOrder: (o: Order) => void;
}) {
  const [counterPrice, setCounterPrice] = useState('');
  const [showCounter, setShowCounter] = useState(false);

  // Track lead open when dealer first views order (opened_at is null)
  useEffect(() => {
    if (order.opened_at == null) {
      markOrderOpened(order.id);
    }
  }, [order.id, order.opened_at]);

  const config = statusConfig[order.status];
  const Icon = config.icon;
  const clientName = order.client?.name || 'Client';

  const handleAccept = async () => {
    if (!isAllowedDealerTransition(order.status, 'accepted')) return;
    setUpdatingId(order.id);
    try {
      const updated = await updateOrderStatus(order.id, 'accepted', {
        agreed_price: order.proposed_price,
      });
      mergeOrder(updated);
      toast.success('Order accepted');
      onClearNew();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to accept');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async () => {
    if (!isAllowedDealerTransition(order.status, 'rejected')) return;
    setUpdatingId(order.id);
    try {
      const updated = await updateOrderStatus(order.id, 'rejected');
      mergeOrder(updated);
      toast.success('Order rejected');
      onClearNew();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCounter = async () => {
    const price = parseFloat(counterPrice);
    if (!price || price <= 0) {
      toast.error('Enter a valid price');
      return;
    }
    if (!isAllowedDealerTransition(order.status, 'countered')) return;
    setUpdatingId(order.id);
    try {
      const updated = await updateOrderStatus(order.id, 'countered', { agreed_price: price });
      mergeOrder(updated);
      toast.success('Counter offer sent');
      setShowCounter(false);
      setCounterPrice('');
      onClearNew();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send counter');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkInProgress = async () => {
    if (!isAllowedDealerTransition(order.status, 'in_progress')) {
      toast.error(`Cannot transition from ${order.status} to in_progress`);
      console.error('Transition not allowed:', { from: order.status, to: 'in_progress' });
      return;
    }
    setUpdatingId(order.id);
    try {
      console.log('Updating order to in_progress:', order.id);
      const updated = await updateOrderStatus(order.id, 'in_progress');
      console.log('Order updated successfully:', updated);
      mergeOrder(updated);
      toast.success('Marked in progress');
    } catch (err: unknown) {
      console.error('Failed to update order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update';
      toast.error(errorMessage, {
        description: 'Please check console for details'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkCompleted = async () => {
    if (!isAllowedDealerTransition(order.status, 'completed')) return;
    setUpdatingId(order.id);
    try {
      const updated = await updateOrderStatus(order.id, 'completed');
      mergeOrder(updated);
      toast.success('Order completed');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete');
    } finally {
      setUpdatingId(null);
    }
  };

  const price = order.agreed_price ?? order.proposed_price;

  return (
    <Card
      className={`p-4 transition-all ${isNew ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}`}
      onMouseEnter={isNew ? onClearNew : undefined}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-gray-900">{clientName}</p>
          <p className="text-sm text-gray-500">
            Proposed: ${order.proposed_price}
            {order.agreed_price != null && order.agreed_price !== order.proposed_price && (
              <> · Agreed: ${order.agreed_price}</>
            )}
          </p>
          {order.notes && <p className="text-sm text-gray-600 mt-1">{order.notes}</p>}
          {order.scheduled_date && (
            <p className="text-xs text-gray-500 mt-1">Scheduled: {order.scheduled_date}</p>
          )}
        </div>
        <Badge variant={config.variant} className="gap-1">
          <Icon className="w-3 h-3" />
          {config.label}
        </Badge>
      </div>

      {order.status === 'pending' && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={handleAccept} disabled={!!updatingId}>
            {updatingId === order.id ? '...' : 'Accept'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleReject} disabled={!!updatingId}>
            Reject
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCounter(!showCounter)}
            disabled={!!updatingId}
          >
            Counter Offer
          </Button>
          {showCounter && (
            <div className="flex gap-2 items-center w-full mt-2">
              <Label className="sr-only">New price</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="New price"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                className="w-24"
              />
              <Button size="sm" onClick={handleCounter} disabled={!!updatingId || !counterPrice}>
                Send
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCounter(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      {(order.status === 'accepted' || order.status === 'paid') && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="outline" disabled>
            Proceed to Payment (Client)
          </Button>
          <Button size="sm" onClick={handleMarkInProgress} disabled={!!updatingId}>
            Mark In Progress
          </Button>
        </div>
      )}

      {order.status === 'in_progress' && (
        <div className="mt-3">
          <Button size="sm" onClick={handleMarkCompleted} disabled={!!updatingId}>
            Mark Completed
          </Button>
        </div>
      )}
    </Card>
  );
}
