import { supabase } from '../lib/supabaseClient';

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
  priceRange: string;
  specialties: string[];
}) {
  const {
    userId,
    name,
    email,
    phone,
    businessName,
    baseLocation,
    priceRange,
    specialties,
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
  };

  const { error: dealerError } = await supabase.from('dealer_profiles').upsert(
    {
      id: userId,
      business_name: businessName,
      base_location: baseLocation,
      services_offered,
      price_range: priceRange,
      logo_url: null,
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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (profileError || !profile) {
    throw profileError || new Error('Profile not found for user');
  }

  const appRole = dbRoleToAppRole(profile.role as DbRole);

  let clientProfile: any = null;
  let dealerProfile: any = null;

  if (profile.role === 'client') {
    const { data, error } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    clientProfile = data;
  } else if (profile.role === 'dealer') {
    const { data, error } = await supabase
      .from('dealer_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
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

