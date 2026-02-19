import { supabase } from '../lib/supabaseClient';
import type { Order, OrderStatus } from '../types';

const ALLOWED_CLIENT_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ['rejected'],
  countered: ['accepted', 'rejected'],
};

const ALLOWED_DEALER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ['accepted', 'rejected', 'countered'],
  accepted: ['paid', 'in_progress'],
  paid: ['in_progress'],
  in_progress: ['completed'],
};

export function isAllowedClientTransition(from: OrderStatus, to: OrderStatus): boolean {
  const allowed = ALLOWED_CLIENT_TRANSITIONS[from];
  return !!allowed?.includes(to);
}

export function isAllowedDealerTransition(from: OrderStatus, to: OrderStatus): boolean {
  const allowed = ALLOWED_DEALER_TRANSITIONS[from];
  return !!allowed?.includes(to);
}

export interface CreateOrderInput {
  gig_id: string;
  dealer_id: string;
  proposed_price: number;
  notes?: string;
  scheduled_date?: string;
}

export async function createOrder(input: CreateOrderInput, clientId: string): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      gig_id: input.gig_id,
      client_id: clientId,
      dealer_id: input.dealer_id,
      proposed_price: input.proposed_price,
      notes: input.notes || null,
      scheduled_date: input.scheduled_date || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return mapRowToOrder(data);
}

export async function fetchClientOrders(clientId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  const orders = (data || []).map(mapRowToOrder);
  await enrichOrdersWithDealer(orders);
  return orders;
}

export async function fetchDealerOrders(dealerId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('dealer_id', dealerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  const orders = (data || []).map(mapRowToOrder);
  await enrichOrdersWithClient(orders);
  return orders;
}

export async function fetchDealerUpcomingOrders(dealerId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('dealer_id', dealerId)
    .in('status', ['accepted', 'paid', 'in_progress'])
    .order('scheduled_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  const orders = (data || []).map(mapRowToOrder);
  await enrichOrdersWithClient(orders);
  return orders;
}

async function enrichOrdersWithDealer(orders: Order[]): Promise<void> {
  const ids = [...new Set(orders.map((o) => o.dealer_id))];
  if (ids.length === 0) return;
  const { data } = await supabase
    .from('dealer_profiles')
    .select('id, business_name, base_location')
    .in('id', ids);
  const map = new Map((data || []).map((d) => [d.id, d]));
  orders.forEach((o) => {
    const d = map.get(o.dealer_id);
    if (d) o.dealer = { id: d.id, business_name: d.business_name, base_location: d.base_location };
  });
}

async function enrichOrdersWithClient(orders: Order[]): Promise<void> {
  const ids = [...new Set(orders.map((o) => o.client_id))];
  if (ids.length === 0) return;
  const { data } = await supabase.from('profiles').select('id, name').in('id', ids);
  const map = new Map((data || []).map((p) => [p.id, p]));
  orders.forEach((o) => {
    const p = map.get(o.client_id);
    if (p) o.client = { id: p.id, name: p.name };
  });
}

async function enrichSingleOrderWithDealer(order: Order): Promise<Order | null> {
  const { data } = await supabase
    .from('dealer_profiles')
    .select('id, business_name, base_location')
    .eq('id', order.dealer_id)
    .single();
  if (data) order.dealer = { id: data.id, business_name: data.business_name, base_location: data.base_location };
  return order;
}

async function enrichSingleOrderWithClient(order: Order): Promise<Order | null> {
  const { data } = await supabase.from('profiles').select('id, name').eq('id', order.client_id).single();
  if (data) order.client = { id: data.id, name: data.name };
  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  extra?: { agreed_price?: number }
): Promise<Order> {
  const payload: Record<string, unknown> = { status };
  if (extra?.agreed_price != null) payload.agreed_price = extra.agreed_price;

  const { data, error } = await supabase
    .from('orders')
    .update(payload)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return mapRowToOrder(data);
}

export function subscribeToClientOrders(
  clientId: string,
  onInsert: (order: Order) => void,
  onUpdate: (order: Order) => void
) {
  const channel = supabase
    .channel(`orders:client:${clientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `client_id=eq.${clientId}`,
      },
      async (payload) => {
        const order = mapRowToOrder(payload.new as Record<string, unknown>);
        if (payload.eventType === 'INSERT') {
          onInsert(order);
          enrichSingleOrderWithDealer(order).then((enriched) => enriched && onUpdate(enriched));
        } else if (payload.eventType === 'UPDATE') {
          onUpdate(order);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToDealerOrders(
  dealerId: string,
  onInsert: (order: Order) => void,
  onUpdate: (order: Order) => void
) {
  const channel = supabase
    .channel(`orders:dealer:${dealerId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `dealer_id=eq.${dealerId}`,
      },
      async (payload) => {
        const order = mapRowToOrder(payload.new as Record<string, unknown>);
        if (payload.eventType === 'INSERT') {
          onInsert(order);
          enrichSingleOrderWithClient(order).then((enriched) => enriched && onUpdate(enriched));
        } else if (payload.eventType === 'UPDATE') {
          onUpdate(order);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

function mapRowToOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    gig_id: row.gig_id as string,
    client_id: row.client_id as string,
    dealer_id: row.dealer_id as string,
    proposed_price: Number(row.proposed_price),
    agreed_price: row.agreed_price != null ? Number(row.agreed_price) : null,
    notes: (row.notes as string) || null,
    scheduled_date: (row.scheduled_date as string) || null,
    status: row.status as Order['status'],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    opened_at: (row.opened_at as string) || null,
  };
}
