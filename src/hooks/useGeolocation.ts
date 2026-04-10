import { useState, useEffect } from 'react';
import { getCurrentLocation } from '../lib/geo';

export function useGeolocation() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getLocation = async () => {
      try {
        const pos = await getCurrentLocation();
        if (mounted) {
          if (pos) {
            setLocation(pos);
          } else {
            // Default to NYC coordinates if geolocation fails
            setLocation({ latitude: 40.7128, longitude: -74.006 });
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Unable to get location');
          // Default location
          setLocation({ latitude: 40.7128, longitude: -74.006 });
          setLoading(false);
        }
      }
    };

    getLocation();

    return () => {
      mounted = false;
    };
  }, []);

  return { location, error, loading };
}
