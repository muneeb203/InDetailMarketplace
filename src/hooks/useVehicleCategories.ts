import { useState, useEffect } from 'react';
import { getVehicleCategories } from '../services/vehicleCategoryService';
import type { VehicleCategory } from '../types/serviceTypes';

export function useVehicleCategories() {
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchCategories() {
      try {
        setLoading(true);
        setError(null);
        const data = await getVehicleCategories();
        if (mounted) {
          setCategories(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch vehicle categories');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  return { categories, loading, error };
}
