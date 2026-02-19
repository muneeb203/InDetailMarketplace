import { supabase } from '../lib/supabaseClient';

export interface ExposureMetricsData {
  profileViews: { value: number; change: number; trend: 'up' | 'down' | 'neutral' };
  saves: { value: number; change: number; trend: 'up' | 'down' | 'neutral' };
  leadOpens: { value: number; change: number; trend: 'up' | 'down' | 'neutral' };
  quoteAcceptRate: { value: number; change: number; trend: 'up' | 'down' | 'neutral' };
}

function computeTrend(current: number, previous: number): { change: number; trend: 'up' | 'down' | 'neutral' } {
  if (previous === 0) {
    return { change: current > 0 ? 100 : 0, trend: current > 0 ? 'up' : 'neutral' };
  }
  const change = Math.round(((current - previous) / previous) * 100);
  if (change > 0) return { change, trend: 'up' };
  if (change < 0) return { change: Math.abs(change), trend: 'down' };
  return { change: 0, trend: 'neutral' };
}

export async function fetchExposureMetrics(
  dealerId: string,
  period: '7' | '30'
): Promise<ExposureMetricsData> {
  const days = period === '7' ? 7 : 30;
  const prevDays = period === '7' ? 14 : 60;

  const now = new Date().toISOString();
  const currentStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const prevStart = new Date(Date.now() - prevDays * 24 * 60 * 60 * 1000).toISOString();

  const [
    viewsResult,
    viewsPrevResult,
    savesResult,
    savesPrevResult,
    leadOpensResult,
    leadOpensPrevResult,
    ordersResult,
    ordersPrevResult,
    acceptedResult,
    acceptedPrevResult,
  ] = await Promise.all([
    supabase
      .from('dealer_profile_views')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .gte('created_at', currentStart)
      .lte('created_at', now),
    supabase
      .from('dealer_profile_views')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .gte('created_at', prevStart)
      .lt('created_at', currentStart),
    supabase
      .from('dealer_saves')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .gte('created_at', currentStart)
      .lte('created_at', now),
    supabase
      .from('dealer_saves')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .gte('created_at', prevStart)
      .lt('created_at', currentStart),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .not('opened_at', 'is', null)
      .gte('created_at', currentStart)
      .lte('created_at', now),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .not('opened_at', 'is', null)
      .gte('created_at', prevStart)
      .lt('created_at', currentStart),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .gte('created_at', currentStart)
      .lte('created_at', now),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .gte('created_at', prevStart)
      .lt('created_at', currentStart),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .in('status', ['accepted', 'completed'])
      .gte('created_at', currentStart)
      .lte('created_at', now),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .in('status', ['accepted', 'completed'])
      .gte('created_at', prevStart)
      .lt('created_at', currentStart),
  ]);

  const views = viewsResult.count ?? 0;
  const viewsPrev = viewsPrevResult.count ?? 0;
  const saves = savesResult.count ?? 0;
  const savesPrev = savesPrevResult.count ?? 0;
  const leadOpens = leadOpensResult.count ?? 0;
  const leadOpensPrev = leadOpensPrevResult.count ?? 0;
  const totalOrders = ordersResult.count ?? 0;
  const totalOrdersPrev = ordersPrevResult.count ?? 0;
  const acceptedOrders = acceptedResult.count ?? 0;
  const acceptedOrdersPrev = acceptedPrevResult.count ?? 0;

  const acceptRate = totalOrders > 0 ? Math.round((acceptedOrders / totalOrders) * 100) : 0;
  const acceptRatePrev = totalOrdersPrev > 0 ? Math.round((acceptedOrdersPrev / totalOrdersPrev) * 100) : 0;

  const profileViewsTrend = computeTrend(views, viewsPrev);
  const savesTrend = computeTrend(saves, savesPrev);
  const leadOpensTrend = computeTrend(leadOpens, leadOpensPrev);
  const quoteAcceptTrend = computeTrend(acceptRate, acceptRatePrev);

  return {
    profileViews: { value: views, ...profileViewsTrend },
    saves: { value: saves, ...savesTrend },
    leadOpens: { value: leadOpens, ...leadOpensTrend },
    quoteAcceptRate: { value: acceptRate, ...quoteAcceptTrend },
  };
}

export async function trackProfileView(dealerId: string, viewerId: string | null): Promise<void> {
  try {
    await supabase.from('dealer_profile_views').insert({
      dealer_id: dealerId,
      viewer_id: viewerId,
    });
  } catch {
    // Do not block UI if insert fails
  }
}

export async function toggleDealerSave(dealerId: string, clientId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from('dealer_saves')
    .select('id')
    .eq('dealer_id', dealerId)
    .eq('client_id', clientId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('dealer_saves')
      .delete()
      .eq('dealer_id', dealerId)
      .eq('client_id', clientId);
    return false;
  } else {
    await supabase.from('dealer_saves').insert({
      dealer_id: dealerId,
      client_id: clientId,
    });
    return true;
  }
}

export async function getDealerSaveCount(dealerId: string): Promise<number> {
  const { count } = await supabase
    .from('dealer_saves')
    .select('*', { count: 'exact', head: true })
    .eq('dealer_id', dealerId);
  return count ?? 0;
}

export async function isDealerSavedByClient(dealerId: string, clientId: string): Promise<boolean> {
  const { data } = await supabase
    .from('dealer_saves')
    .select('id')
    .eq('dealer_id', dealerId)
    .eq('client_id', clientId)
    .maybeSingle();
  return !!data;
}

export async function getPublicDealerStats(dealerId: string): Promise<{ profile_views: number; saves: number }> {
  const { data, error } = await supabase.rpc('get_public_dealer_stats', { p_dealer_id: dealerId });
  if (error) return { profile_views: 0, saves: 0 };
  return {
    profile_views: Number(data?.profile_views ?? 0),
    saves: Number(data?.saves ?? 0),
  };
}

export async function markOrderOpened(orderId: string): Promise<void> {
  try {
    await supabase
      .from('orders')
      .update({ opened_at: new Date().toISOString() })
      .eq('id', orderId)
      .is('opened_at', null);
  } catch {
    // Do not block UI
  }
}
