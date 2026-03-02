import { supabase } from '../lib/supabaseClient';

export async function fetchAdminStats() {
  const [profilesRes, dealersRes, ordersRes, convsRes, reviewsRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('dealer_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('id, status, agreed_price'),
    supabase.from('conversations').select('*', { count: 'exact', head: true }),
    supabase.from('dealer_reviews').select('*', { count: 'exact', head: true }),
  ]);

  const totalUsers = profilesRes.count ?? 0;
  const totalDealers = dealersRes.count ?? 0;
  const totalConversations = convsRes.count ?? 0;
  const totalReviews = reviewsRes.count ?? 0;

  const orders = ordersRes.data ?? [];
  const totalOrders = orders.length;
  const ordersByStatus: Record<string, number> = {};
  let revenue = 0;
  orders.forEach((o: { status: string; agreed_price?: number | null }) => {
    ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
    if (o.status === 'paid' && o.agreed_price != null) revenue += Number(o.agreed_price);
  });

  return {
    totalUsers,
    totalDealers,
    totalOrders,
    ordersByStatus,
    totalConversations,
    totalReviews,
    revenue,
  };
}

export function subscribeAdminRealtime(refresh: () => void) {
  const tables = ['orders', 'conversations', 'dealer_reviews', 'profiles'];
  const channels: ReturnType<typeof supabase.channel>[] = [];

  tables.forEach((table) => {
    const ch = supabase
      .channel(`admin-${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => refresh()
      )
      .subscribe();
    channels.push(ch);
  });

  return () => {
    channels.forEach((ch) => supabase.removeChannel(ch));
  };
}
