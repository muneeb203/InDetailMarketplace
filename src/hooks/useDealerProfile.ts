import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface DealerProfileData {
  logo_url: string | null;
  portfolio_images: string[];
  business_name?: string;
  base_location?: string;
  price_range?: string;
  bio?: string;
  certifications?: string[];
  years_in_business?: number;
  comm_preference?: string;
  location_lat?: number | null;
  location_lng?: number | null;
  service_radius_miles?: number | null;
  services_offered?: { specialties?: string[]; serviceRadius?: number };
  operating_hours?: Record<string, { isOpen: boolean; open: string; close: string }>;
  is_insured?: boolean;
  is_pro?: boolean;
  social_handles?: Record<string, string>;
  promo?: { title?: string; description?: string; startDate?: string; endDate?: string; active?: boolean };
  [key: string]: unknown;
}

export function useDealerProfile(userId: string | undefined) {
  const [data, setData] = useState<DealerProfileData | null>(null);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setData(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data: profile, error: fetchError } = await supabase
        .from('dealer_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;
      const servicesOffered = profile?.services_offered as Record<string, unknown> | undefined;
      setData({
        logo_url: profile?.logo_url ?? null,
        portfolio_images: Array.isArray(profile?.portfolio_images) ? profile.portfolio_images : [],
        business_name: profile?.business_name,
        base_location: profile?.base_location,
        price_range: profile?.price_range,
        bio: profile?.bio,
        certifications: profile?.certifications ?? [],
        years_in_business: profile?.years_in_business,
        comm_preference: profile?.comm_preference ?? 'voice-chat',
        location_lat: profile?.location_lat ?? null,
        location_lng: profile?.location_lng ?? null,
        service_radius_miles: profile?.service_radius_miles ?? 10,
        services_offered: servicesOffered,
        operating_hours: profile?.operating_hours ?? undefined,
        is_insured: profile?.is_insured ?? false,
        is_pro: profile?.is_pro ?? false,
        social_handles: (profile?.social_handles as Record<string, string>) ?? undefined,
        promo: (profile?.promo as Record<string, unknown>) ?? undefined,
      });
    } catch (err) {
      setError(err as Error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateLocal = useCallback((updates: Partial<DealerProfileData>) => {
    setData((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  return { data, loading, error, refetch: fetchProfile, updateLocal };
}
