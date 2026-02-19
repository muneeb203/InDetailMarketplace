/**
 * Dealer Settings Service - Update operations for dealer_profiles
 * Uses .update() with RLS (id = auth.uid())
 */

import { supabase } from '../lib/supabaseClient';

export type CommPreference = 'chat' | 'voice' | 'voice-chat';

export interface ProfileInfoUpdate {
  business_name?: string;
  bio?: string;
  certifications?: string[];
  years_in_business?: number;
  comm_preference?: CommPreference;
}

export interface LocationUpdate {
  base_location: string;
  location_lat: number;
  location_lng: number;
}

export interface BusinessDetailsUpdate {
  services_offered?: { specialties: string[]; serviceRadius?: number };
  price_range?: string;
  operating_hours?: Record<string, { isOpen: boolean; open: string; close: string }>;
  is_insured?: boolean;
  is_pro?: boolean;
}

export interface ServiceRadiusUpdate {
  service_radius_miles: number;
}

export interface SocialHandlesUpdate {
  social_handles?: Record<string, string>;
}

export interface PromoUpdate {
  promo?: { title?: string; description?: string; startDate?: string; endDate?: string; active?: boolean };
}

export async function updateDealerProfile(
  userId: string,
  updates:
    | ProfileInfoUpdate
    | LocationUpdate
    | BusinessDetailsUpdate
    | ServiceRadiusUpdate
    | SocialHandlesUpdate
    | PromoUpdate
) {
  const { error } = await supabase
    .from('dealer_profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
