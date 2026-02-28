import { supabase } from '../lib/supabaseClient';

/** Valid price range values for dealer_profiles.price_range - stored exactly as-is */
const VALID_PRICE_RANGES = ['$', '$$', '$$$', '$$$$'] as const;

function normalizePriceRange(value: string): string {
  const v = value?.trim();
  return VALID_PRICE_RANGES.includes(v as any) ? v : '$$';
}

export type AppRole = 'client' | 'detailer';
export type DbRole = 'client' | 'dealer' | 'admin';

export const appRoleToDbRole = (role: AppRole): DbRole =>
  role === 'client' ? 'client' : 'dealer';

export const dbRoleToAppRole = (role: DbRole): AppRole | 'admin' => {
  if (role === 'client') return 'client';
  if (role === 'dealer') return 'detailer';
  return 'admin';
};

export async function signUpAuthOnly(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('No user returned from Supabase signUp');
  return data.user;
}

/** Creates only the profiles row so login works even if user never completed onboarding. */
export async function createMinimalProfile(params: {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: 'client' | 'dealer';
}) {
  const { userId, name, email, phone, role } = params;
  const { error } = await supabase.from('profiles').upsert(
    { id: userId, role, name, email, phone },
    { onConflict: 'id' }
  );
  if (error) throw error;
}

export async function createClientProfile(params: {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  location_lat: number | null;
  location_lng: number | null;
  vehicle?: { make: string; model: string; year: number };
}) {
  const { userId, name, email, phone, location_lat, location_lng, vehicle } = params;

  // Base profile (upsert so re-running onboarding doesn't hit "duplicate key" if profile exists)
  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: userId,
      role: 'client',
      name,
      email,
      phone,
    },
    { onConflict: 'id' }
  );
  if (profileError) throw profileError;

  // Client extension — only store lat/lng (no city/state in DB)
  const { error: clientError } = await supabase.from('client_profiles').upsert(
    {
      id: userId,
      location_lat,
      location_lng,
      vehicle_make: vehicle?.make ?? null,
      vehicle_model: vehicle?.model ?? null,
      vehicle_year: vehicle?.year ?? null,
    },
    { onConflict: 'id' }
  );
  if (clientError) throw clientError;
}

export async function createDealerProfile(params: {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  businessName: string;
  baseLocation: string;
  locationLat: number;
  locationLng: number;
  serviceRadius?: number;
  priceRange: string;
  specialties: string[];
  portfolioImages?: string[];
  logoUrl?: string;
}) {
  const {
    userId,
    name,
    email,
    phone,
    businessName,
    baseLocation,
    locationLat,
    locationLng,
    serviceRadius = 15,
    priceRange,
    specialties,
    portfolioImages = [],
    logoUrl,
  } = params;

  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: userId,
      role: 'dealer',
      name,
      email,
      phone,
    },
    { onConflict: 'id' }
  );
  if (profileError) throw profileError;

  const services_offered = {
    specialties,
    serviceRadius,
  };

  const price_range = normalizePriceRange(priceRange);

  const { error: dealerError } = await supabase.from('dealer_profiles').upsert(
    {
      id: userId,
      business_name: businessName,
      base_location: baseLocation,
      location_lat: locationLat,
      location_lng: locationLng,
      services_offered,
      price_range,
      logo_url: logoUrl ?? null,
      portfolio_images: portfolioImages,
    },
    { onConflict: 'id' }
  );
  if (dealerError) throw dealerError;
}

export async function signInAndLoadProfile(email: string, password: string) {
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });
  if (authError) throw authError;
  const user = authData.user;
  if (!user) throw new Error('No user returned from Supabase signIn');

  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile) {
    const name = (user.user_metadata?.name as string) || user.email?.split('@')[0] || 'User';
    await createMinimalProfile({
      userId: user.id,
      name,
      email: user.email ?? '',
      phone: (user.user_metadata?.phone as string) || '',
      role: 'client',
    });
    const { data: created, error: createdErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (createdErr || !created) throw createdErr || new Error('Could not create profile');
    profile = created;
  }

  const appRole = dbRoleToAppRole(profile.role as DbRole);

  let clientProfile: any = null;
  let dealerProfile: any = null;

  if (profile.role === 'client') {
    const { data, error } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (error) throw error;
    clientProfile = data;
  } else if (profile.role === 'dealer') {
    const { data, error } = await supabase
      .from('dealer_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (error) throw error;
    dealerProfile = data;
  }

  return {
    user,
    profile,
    clientProfile,
    dealerProfile,
    appRole,
  };
}

