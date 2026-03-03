import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../../components/ui/button';

interface OrderRow {
  id: string;
  client_id: string;
  dealer_id: string;
  status: string;
  proposed_price: number | null;
  agreed_price: number | null;
  created_at: string | null;
}

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientNames, setClientNames] = useState<Record<string, string>>({});
  const [dealerNames, setDealerNames] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from('orders')
      .select('id, client_id, dealer_id, status, proposed_price, agreed_price, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        else setOrders((data as OrderRow[]) ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const ids = [...new Set(orders.flatMap((o) => [o.client_id, o.dealer_id]))];
    if (ids.length === 0) return;
    supabase.from('profiles').select('id, name').in('id', ids).then(({ data }) => {
      const byId: Record<string, string> = {};
      (data ?? []).forEach((r: { id: string; name: string | null }) => {
        byId[r.id] = r.name ?? '-';
      });
      setClientNames((prev) => ({ ...prev, ...byId }));
    });
    supabase.from('dealer_profiles').select('id, business_name').in('id', ids).then(({ data }) => {
      const byId: Record<string, string> = {};
      (data ?? []).forEach((r: { id: string; business_name: string | null }) => {
        byId[r.id] = r.business_name ?? '-';
      });
      setDealerNames((prev) => ({ ...prev, ...byId }));
    });
  }, [orders]);

  const updateStatus = async (orderId: string, status: string) => {
    const { error: e } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (e) setError(e.message);
    else setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  if (loading && orders.length === 0) {
    return <div className="text-gray-600">Loading orders...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded text-sm">{error}</div>
      )}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Detailer</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Proposed</th>
              <th className="px-4 py-3 font-medium">Agreed</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{clientNames[o.client_id] ?? o.client_id.slice(0, 8)}</td>
                <td className="px-4 py-3">{dealerNames[o.dealer_id] ?? o.dealer_id.slice(0, 8)}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded bg-gray-100">{o.status}</span>
                </td>
                <td className="px-4 py-3">${o.proposed_price ?? '-'}</td>
                <td className="px-4 py-3">${o.agreed_price ?? '-'}</td>
                <td className="px-4 py-3 text-gray-500">
                  {o.created_at ? new Date(o.created_at).toLocaleString() : '-'}
                </td>
                <td className="px-4 py-3">
                  {o.status === 'pending' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(o.id, 'rejected')}>
                      Cancel
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-8 text-center text-gray-500">No orders found</div>
        )}
      </div>
    </div>
  );
}
