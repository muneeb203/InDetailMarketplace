import { useEffect, useState, useCallback } from 'react';
import { Order } from '../types';
import { fetchClientOrders, subscribeToClientOrders } from '../services/orderService';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Package, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { clientAcceptCounter, clientRejectOrder, isAllowedClientTransition } from '../services/orderService';

interface ClientOrdersPageProps {
  clientId: string;
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

export function ClientOrdersPage({ clientId }: ClientOrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchClientOrders(clientId)
      .then((data) => mounted && setOrders(data))
      .catch((err) => mounted && toast.error(err?.message || 'Failed to load orders'))
      .finally(() => mounted && setLoading(false));

    const unsub = subscribeToClientOrders(clientId, addOrder, (order) => {
      mergeOrder(order);
      if (order.status === 'accepted') {
        toast.success('Dealer accepted your request');
      } else if (order.status === 'countered') {
        toast.info('Dealer proposed new price', {
          description: `New price: $${order.agreed_price}`,
        });
      } else if (order.status === 'rejected') {
        toast.error('Request rejected');
      }
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [clientId, addOrder, mergeOrder]);

  const handleAcceptCounter = async (order: Order) => {
    if (!isAllowedClientTransition(order.status, 'accepted')) return;
    setUpdatingId(order.id);
    try {
      const updated = await clientAcceptCounter(order.id);
      mergeOrder(updated);
      toast.success('Offer accepted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept';
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelRequest = async (order: Order) => {
    if (!isAllowedClientTransition(order.status, 'rejected')) return;
    setUpdatingId(order.id);
    try {
      const updated = await clientRejectOrder(order.id);
      mergeOrder(updated);
      toast.success('Request cancelled');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel');
    } finally {
      setUpdatingId(null);
    }
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>

      {orders.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No orders yet</p>
          <p className="text-sm text-gray-400 mt-1">Request service from a detailer to get started</p>
        </Card>
      )}

      {pending.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Pending Requests</h2>
          <div className="space-y-3">
            {pending.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                statusConfig={statusConfig}
                onAcceptCounter={handleAcceptCounter}
                onCancelRequest={handleCancelRequest}
                updatingId={updatingId}
                isClient
              />
            ))}
          </div>
        </section>
      )}

      {active.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Services</h2>
          <div className="space-y-3">
            {active.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                statusConfig={statusConfig}
                onAcceptCounter={handleAcceptCounter}
                onCancelRequest={handleCancelRequest}
                updatingId={updatingId}
                isClient
              />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Completed Services</h2>
          <div className="space-y-3">
            {completed.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                statusConfig={statusConfig}
                onAcceptCounter={handleAcceptCounter}
                onCancelRequest={handleCancelRequest}
                updatingId={updatingId}
                isClient
              />
            ))}
          </div>
        </section>
      )}

      {rejected.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Cancelled / Rejected</h2>
          <div className="space-y-3">
            {rejected.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                statusConfig={statusConfig}
                onAcceptCounter={handleAcceptCounter}
                onCancelRequest={handleCancelRequest}
                updatingId={updatingId}
                isClient
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OrderCard({
  order,
  statusConfig,
  onAcceptCounter,
  onCancelRequest,
  updatingId,
  isClient,
}: {
  order: Order;
  statusConfig: typeof statusConfig;
  onAcceptCounter: (o: Order) => void;
  onCancelRequest: (o: Order) => void;
  updatingId: string | null;
  isClient: boolean;
}) {
  const config = statusConfig[order.status];
  const Icon = config.icon;
  const dealerName = order.dealer?.business_name || 'Dealer';
  const price = order.agreed_price ?? order.proposed_price;

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-gray-900">{dealerName}</p>
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

      {isClient && order.status === 'countered' && (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            onClick={() => onAcceptCounter(order)}
            disabled={!!updatingId}
          >
            {updatingId === order.id ? 'Accepting...' : 'Accept Offer'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onCancelRequest(order)} disabled={!!updatingId}>
            Cancel Request
          </Button>
        </div>
      )}

      {isClient && order.status === 'accepted' && (
        <div className="mt-3">
          <Button size="sm" variant="outline" disabled>
            Proceed to Payment (Coming soon)
          </Button>
        </div>
      )}
    </Card>
  );
}
