import { useState, useEffect } from 'react';
import { getActiveOfferings } from '../services/serviceOfferingService';
import type { ServiceOfferingWithPrice } from '../types/serviceTypes';

export function useServiceOfferings(dealerId: string, vehicleCategoryId: string | null) {
  const [offerings, setOfferings] = useState<ServiceOfferingWithPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchOfferings() {
      // Don't fetch if no vehicle category selected
      if (!vehicleCategoryId) {
        setOfferings([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getActiveOfferings(dealerId, vehicleCategoryId);
        if (mounted) {
          setOfferings(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch service offerings');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchOfferings();

    return () => {
      mounted = false;
    };
  }, [dealerId, vehicleCategoryId]);

  return { offerings, loading, error };
}
