import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Vehicle } from '../types';

export interface ClientProfileData {
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
}

export function useClientProfile(clientId: string | undefined) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(!!clientId);

  const refetch = useCallback(async () => {
    if (!clientId) {
      setVehicles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('vehicle_make, vehicle_model, vehicle_year')
        .eq('id', clientId)
        .maybeSingle();

      if (error || !data) {
        setVehicles([]);
        return;
      }

      if (data?.vehicle_make) {
        setVehicles([
          {
            id: '1',
            make: data.vehicle_make,
            model: data.vehicle_model ?? '',
            year: data.vehicle_year ?? new Date().getFullYear(),
            type: 'Sedan',
            isDefault: true,
          },
        ]);
      } else {
        setVehicles([]);
      }
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { vehicles, loading, refetch };
}
