import { useEffect, useState, useCallback } from 'react';
import { fetchAdminStats, subscribeAdminRealtime } from '../adminApi';
import { Users, Store, ShoppingBag, MessageSquare, Star, DollarSign } from 'lucide-react';
import { StripeSetupBanner } from '../../components/admin/StripeSetupNotification';

export function DashboardOverview() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchAdminStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchAdminStats();
      setStats(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const unsub = subscribeAdminRealtime(refresh);
    return unsub;
  }, [refresh]);

  if (loading && !stats) {
    return <div className="text-gray-600">Loading dashboard...</div>;
  }

  if (error && !stats) {
    return <div className="text-red-600 bg-red-50 p-4 rounded">{error}</div>;
  }

  const s = stats!;
  const cards = [
    { label: 'Total Users', value: s.totalUsers, icon: Users },
    { label: 'Total Detailers', value: s.totalDealers, icon: Store },
    { label: 'Total Orders', value: s.totalOrders, icon: ShoppingBag },
    { label: 'Total Conversations', value: s.totalConversations, icon: MessageSquare },
    { label: 'Total Reviews', value: s.totalReviews, icon: Star },
    { label: 'Revenue (paid orders)', value: `$${s.revenue.toFixed(2)}`, icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <StripeSetupBanner />
      
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      <p className="text-sm text-gray-500">Real-time data. Updates automatically.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Icon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xl font-semibold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Orders by Status</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(s.ordersByStatus).map(([status, count]) => (
            <span
              key={status}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm"
            >
              <span className="font-medium">{status}</span>
              <span>{count}</span>
            </span>
          ))}
          {Object.keys(s.ordersByStatus).length === 0 && (
            <p className="text-sm text-gray-500">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
