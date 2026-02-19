import { supabase } from '../lib/supabaseClient';

export interface DealerReview {
  id: string;
  order_id: string;
  dealer_id: string;
  client_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

export interface DealerReviewWithClient extends DealerReview {
  client_name?: string;
}

export async function getReviewByOrderId(orderId: string): Promise<DealerReview | null> {
  const { data, error } = await supabase
    .from('dealer_reviews')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();

  if (error) throw error;
  return data as DealerReview | null;
}

export async function getOrderIdsWithReviews(orderIds: string[]): Promise<Set<string>> {
  if (orderIds.length === 0) return new Set();
  const { data, error } = await supabase
    .from('dealer_reviews')
    .select('order_id')
    .in('order_id', orderIds);
  if (error) throw error;
  return new Set((data || []).map((r) => r.order_id));
}

export async function createReview(params: {
  order_id: string;
  dealer_id: string;
  client_id: string;
  rating: number;
  review_text?: string;
}): Promise<DealerReview> {
  const { rating, review_text, ...rest } = params;
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const { data, error } = await supabase
    .from('dealer_reviews')
    .insert({
      ...rest,
      rating,
      review_text: review_text?.trim() || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as DealerReview;
}

export async function fetchDealerReviews(dealerId: string): Promise<DealerReviewWithClient[]> {
  const { data: reviews, error } = await supabase
    .from('dealer_reviews')
    .select('id, order_id, dealer_id, client_id, rating, review_text, created_at')
    .eq('dealer_id', dealerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!reviews?.length) return [];

  const clientIds = [...new Set(reviews.map((r) => r.client_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', clientIds);

  const nameMap = new Map((profiles || []).map((p) => [p.id, p.name]));

  return reviews.map((r) => ({
    ...r,
    client_name: nameMap.get(r.client_id) ?? 'Anonymous',
  })) as DealerReviewWithClient[];
}

export async function fetchDealerRating(dealerId: string): Promise<{ rating: number; review_count: number }> {
  const { data, error } = await supabase
    .from('dealer_profiles')
    .select('rating, review_count')
    .eq('id', dealerId)
    .single();

  if (error) throw error;
  return {
    rating: Number(data?.rating ?? 0),
    review_count: Number(data?.review_count ?? 0),
  };
}
