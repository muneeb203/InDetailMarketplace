import { useState, useEffect } from 'react';
import { fetchDetailers, DetailerFilters } from '../services/detailerService';
import { Detailer } from '../types';

export function useDetailers(filters?: DetailerFilters) {
  const [detailers, setDetailers] = useState<Detailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDetailers() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDetailers(filters);
        
        if (isMounted) {
          setDetailers(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          console.error('Error loading detailers:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDetailers();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(filters)]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDetailers(filters);
      setDetailers(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error refetching detailers:', err);
    } finally {
      setLoading(false);
    }
  };

  return { detailers, loading, error, refetch };
}
