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
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error('Auth error in createOrder:', authError);
    throw new Error('You must be signed in to create an order');
  }
  if (!user) {
    throw new Error('You must be signed in to create an order');
  }

  // Log for debugging
  console.log('Creating order:', {
    authUserId: user.id,
    passedClientId: clientId,
    match: user.id === clientId,
    input,
  });

  // Use authenticated user ID instead of passed clientId for security
  const { data, error } = await supabase
    .from('orders')
    .insert({
      gig_id: input.gig_id,
      client_id: user.id, // Use auth.uid() equivalent
      dealer_id: input.dealer_id,
      proposed_price: input.proposed_price,
      notes: input.notes || null,
      scheduled_date: input.scheduled_date || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Order creation error:', error);
    throw error;
  }
  return mapRowToOrder(data);
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  const order = mapRowToOrder(data);
  await enrichOrdersWithDealer([order]);
  await enrichOrdersWithClient([order]);
  return order;
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

export async function getDealerCompletedOrdersCount(dealerId: string): Promise<number> {
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('dealer_id', dealerId)
    .eq('status', 'completed');

  if (error) return 0;
  return count ?? 0;
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

export async function fetchClientUpcomingOrders(clientId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('client_id', clientId)
    .in('status', ['accepted', 'paid', 'in_progress'])
    .order('scheduled_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  const orders = (data || []).map(mapRowToOrder);
  await enrichOrdersWithDealer(orders);
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
  console.log('updateOrderStatus called:', { orderId, status, extra });
  
  // First, check if we can read the order (to verify RLS permissions)
  const { data: existingOrder, error: readError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  
  if (readError) {
    console.error('Cannot read order:', readError);
    throw new Error(`Cannot access order: ${readError.message}. You may not have permission to view this order.`);
  }
  
  if (!existingOrder) {
    throw new Error('Order not found');
  }
  
  console.log('Current order status:', existingOrder.status);
  console.log('Current user (dealer_id):', existingOrder.dealer_id);
  
  const payload: Record<string, unknown> = { status };
  if (extra?.agreed_price != null) payload.agreed_price = extra.agreed_price;

  console.log('Updating order with payload:', payload);

  const { data, error } = await supabase
    .from('orders')
    .update(payload)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Supabase update error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fullError: error
    });
    
    // PGRST116 means no rows returned - likely RLS blocking the update
    if (error.code === 'PGRST116') {
      throw new Error('Permission denied: You do not have permission to update this order. Please check RLS policies.');
    }
    
    throw new Error(`Failed to update order: ${error.message} (code: ${error.code})`);
  }
  
  if (!data) {
    throw new Error('Update succeeded but no data returned');
  }
  
  console.log('Order updated successfully, raw data:', data);
  const order = mapRowToOrder(data);
  console.log('Mapped order:', order);
  return order;
}

/**
 * Client accepts a countered offer via RPC (bypasses RLS for reliable client updates).
 * Use this instead of updateOrderStatus when client accepts from 'countered' status.
 */
export async function clientAcceptCounter(orderId: string): Promise<Order> {
  const { data, error } = await supabase.rpc('accept_client_counter', {
    p_order_id: orderId,
  });

  if (error) throw error;
  const row = data as Record<string, unknown>;
  const order = mapRowToOrder(row);
  const enriched = await enrichSingleOrderWithDealer(order);
  return enriched ?? order;
}

/**
 * Client rejects/cancels a countered offer via RPC (bypasses RLS).
 * Use this when client cancels from 'countered' status.
 */
export async function clientRejectOrder(orderId: string): Promise<Order> {
  const { data, error } = await supabase.rpc('client_reject_order', {
    p_order_id: orderId,
  });

  if (error) throw error;
  const row = data as Record<string, unknown>;
  const order = mapRowToOrder(row);
  const enriched = await enrichSingleOrderWithDealer(order);
  return enriched ?? order;
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
  console.log('Setting up dealer orders subscription for dealer:', dealerId);
  
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
        const eventType = payload.eventType ?? (payload as any).event_type;
        const raw = (payload.new ?? (payload as any).new) as Record<string, unknown> | undefined;
        if (!raw) return;
        const order = mapRowToOrder(raw);
        if (eventType === 'INSERT') {
          enrichSingleOrderWithClient(order).then((enriched) => {
            if (enriched) {
              onInsert(enriched);
            } else {
              onInsert(order);
            }
          });
        } else if (eventType === 'UPDATE') {
          enrichSingleOrderWithClient(order).then((enriched) => enriched && onUpdate(enriched));
        }
      }
    )
    .subscribe((status) => {
      console.log('Dealer orders subscription status:', status);
    });

  return () => {
    console.log('Unsubscribing from dealer orders');
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

// ============================================================================
// Service Pricing System Extensions
// ============================================================================

import type {
  CreateOrderWithServicesData,
  OrderWithServices,
  OrderService as OrderServiceType,
} from '../types/serviceTypes';

/**
 * Calculate total price for selected service offerings and vehicle category
 */
export async function calculateOrderTotal(
  serviceOfferingIds: string[],
  vehicleCategoryId: string
): Promise<number> {
  if (serviceOfferingIds.length === 0) {
    return 0;
  }

  try {
    // Fetch all service offerings with their prices
    const { data: offerings, error } = await supabase
      .from('service_offerings')
      .select(`
        id,
        pricing_model,
        is_active,
        prices:service_prices(vehicle_category_id, price)
      `)
      .in('id', serviceOfferingIds);

    if (error) {
      console.error('Error fetching offerings for total calculation:', error);
      throw new Error(`Failed to calculate order total: ${error.message}`);
    }

    if (!offerings) {
      throw new Error('No offerings found');
    }

    let total = 0;

    for (const offering of offerings) {
      // Check if offering is active
      if (!offering.is_active) {
        throw new Error(`Service offering ${offering.id} is not active`);
      }

      // Find the appropriate price
      let price: number | undefined;

      if (offering.pricing_model === 'single') {
        // Single pricing: use the one price
        price = offering.prices[0]?.price;
      } else {
        // Multi-tier: find price for specific vehicle category
        const categoryPrice = offering.prices.find(
          (p: any) => p.vehicle_category_id === vehicleCategoryId
        );
        price = categoryPrice?.price;
      }

      if (price === undefined) {
        throw new Error(`No price found for offering ${offering.id}`);
      }

      total += price;
    }

    return total;
  } catch (err) {
    console.error('Unexpected error in calculateOrderTotal:', err);
    throw err;
  }
}

/**
 * Create an order with services (new service pricing system)
 */
export async function createOrderWithServices(
  input: CreateOrderWithServicesData
): Promise<OrderWithServices> {
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error('Auth error in createOrderWithServices:', authError);
    throw new Error('You must be signed in to create an order');
  }
  if (!user) {
    throw new Error('You must be signed in to create an order');
  }

  // Validate inputs
  if (!input.vehicle_category_id) {
    throw new Error('Vehicle category is required');
  }
  if (!input.service_offering_ids || input.service_offering_ids.length === 0) {
    throw new Error('At least one service must be selected');
  }

  try {
    // Calculate total price
    const totalPrice = await calculateOrderTotal(
      input.service_offering_ids,
      input.vehicle_category_id
    );

    // Fetch service details for order_services records
    const { data: offerings, error: offeringsError } = await supabase
      .from('service_offerings')
      .select(`
        id,
        pricing_model,
        service:services(name),
        prices:service_prices(vehicle_category_id, price)
      `)
      .in('id', input.service_offering_ids);

    if (offeringsError || !offerings) {
      throw new Error('Failed to fetch service details');
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        gig_id: input.dealer_id, // gig_id is required and references dealer_profiles
        client_id: user.id,
        dealer_id: input.dealer_id,
        vehicle_category_id: input.vehicle_category_id,
        total_price: totalPrice,
        status: 'pending',
        notes: input.notes || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Create order_services records
    const orderServices = offerings.map((offering: any) => {
      let price: number;

      if (offering.pricing_model === 'single') {
        price = offering.prices[0]?.price || 0;
      } else {
        const categoryPrice = offering.prices.find(
          (p: any) => p.vehicle_category_id === input.vehicle_category_id
        );
        price = categoryPrice?.price || 0;
      }

      return {
        order_id: order.id,
        service_offering_id: offering.id,
        service_name: offering.service.name,
        price_at_order: price,
      };
    });

    const { data: services, error: servicesError } = await supabase
      .from('order_services')
      .insert(orderServices)
      .select();

    if (servicesError) {
      console.error('Error creating order services:', servicesError);
      // Try to rollback by deleting the order
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(`Failed to create order services: ${servicesError.message}`);
    }

    // Return complete order with services
    return {
      ...order,
      services: services || [],
    };
  } catch (err) {
    console.error('Unexpected error in createOrderWithServices:', err);
    throw err;
  }
}

/**
 * Fetch order with services and vehicle category
 */
export async function fetchOrderWithServices(orderId: string): Promise<OrderWithServices | null> {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        vehicle_category:vehicle_categories(*),
        services:order_services(*)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching order with services:', orderError);
      throw new Error(`Failed to fetch order: ${orderError.message}`);
    }

    return order;
  } catch (err) {
    console.error('Unexpected error in fetchOrderWithServices:', err);
    throw err;
  }
}

/**
 * Fetch all orders with services for a client
 */
export async function fetchClientOrdersWithServices(
  clientId: string
): Promise<OrderWithServices[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        vehicle_category:vehicle_categories(*),
        services:order_services(*)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client orders with services:', error);
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in fetchClientOrdersWithServices:', err);
    throw err;
  }
}

/**
 * Fetch all orders with services for a dealer
 */
export async function fetchDealerOrdersWithServices(
  dealerId: string
): Promise<OrderWithServices[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        vehicle_category:vehicle_categories(*),
        services:order_services(*)
      `)
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dealer orders with services:', error);
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in fetchDealerOrdersWithServices:', err);
    throw err;
  }
}
