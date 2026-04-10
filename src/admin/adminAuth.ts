import { supabase } from '../lib/supabaseClient';

/** Sends a 6-digit OTP to the given email.
 *  Always appears to succeed — no indication of whether the email is
 *  authorized. This prevents email enumeration attacks. */
export async function sendAdminOtp(email: string): Promise<void> {
  // shouldCreateUser:false — won't create new auth users for unknown emails.
  // Supabase intentionally returns no error even for unknown emails (by design).
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  // Only surface hard infrastructure errors, not "email not found" (that's silent)
  if (error && error.message !== 'Signups not allowed for otp') {
    throw new Error('Could not send OTP. Please try again.');
  }
}

/** Verifies the OTP, then confirms the user is actually an admin.
 *  Signs out and throws if the role check fails (double-check security). */
export async function verifyAdminOtp(email: string, token: string): Promise<void> {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw new Error('Invalid or expired OTP. Please try again.');
  if (!data.user) throw new Error('Verification failed');

  // Double-check admin role after authentication
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    await supabase.auth.signOut();
    throw new Error('Access denied. This account does not have admin privileges.');
  }
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
