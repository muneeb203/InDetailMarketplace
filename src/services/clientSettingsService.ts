import { supabase } from '../lib/supabaseClient';

export async function updateClientProfileInfo(userId: string, data: {
  name?: string;
  email?: string;
  phone?: string;
}) {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...(data.name != null && { name: data.name }),
      ...(data.email != null && { email: data.email }),
      ...(data.phone != null && { phone: data.phone }),
    })
    .eq('id', userId);

  if (error) throw error;
}

export async function updateClientVehicle(userId: string, vehicle: {
  make: string;
  model: string;
  year: number;
}) {
  const { error } = await supabase
    .from('client_profiles')
    .upsert(
      {
        id: userId,
        vehicle_make: vehicle.make,
        vehicle_model: vehicle.model,
        vehicle_year: vehicle.year,
      },
      { onConflict: 'id' }
    );

  if (error) throw error;
}
