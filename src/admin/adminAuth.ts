import { supabase } from '../lib/supabaseClient';

export async function adminLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('No user returned');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    throw new Error('Profile not found');
  }

  if (profile.role !== 'admin') {
    await supabase.auth.signOut();
    throw new Error('Unauthorized');
  }

  return data.user;
}

export async function getAdminUser(): Promise<{ isAdmin: boolean; userId: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isAdmin: false, userId: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const isAdmin = profile?.role === 'admin';
  return { isAdmin, userId: isAdmin ? user.id : null };
}
