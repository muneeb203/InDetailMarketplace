/**
 * Geolocation service for dealer profile creation.
 * Uses browser Geolocation API + Nominatim for reverse geocoding.
 */

const LAT_MIN = -90;
const LAT_MAX = 90;
const LNG_MIN = -180;
const LNG_MAX = 180;

export function validateCoordinates(lat: number, lng: number): boolean {
  return (
    lat >= LAT_MIN &&
    lat <= LAT_MAX &&
    lng >= LNG_MIN &&
    lng <= LNG_MAX
  );
}

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  address: string;
}

export interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED' | 'INVALID_COORDS';
  message: string;
}

/**
 * Fetch current position using browser Geolocation API
 */
export function getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 'NOT_SUPPORTED',
        message: 'Geolocation is not supported by your browser.',
      } as GeolocationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (!validateCoordinates(latitude, longitude)) {
          reject({
            code: 'INVALID_COORDS',
            message: 'Invalid coordinates received.',
          } as GeolocationError);
          return;
        }
        resolve({ latitude, longitude });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject({
              code: 'PERMISSION_DENIED',
              message: 'Location access is required to create a dealer profile.',
            } as GeolocationError);
            break;
          case error.POSITION_UNAVAILABLE:
            reject({
              code: 'POSITION_UNAVAILABLE',
              message: 'Unable to fetch location. Please try again.',
            } as GeolocationError);
            break;
          case error.TIMEOUT:
            reject({
              code: 'TIMEOUT',
              message: 'Location request timed out. Please try again.',
            } as GeolocationError);
            break;
          default:
            reject({
              code: 'POSITION_UNAVAILABLE',
              message: 'Unable to fetch location. Please try again.',
            } as GeolocationError);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Reverse geocode lat/lng to readable address using Nominatim (OpenStreetMap)
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'InDetailMarketplace/1.0',
      },
    });

    if (!res.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await res.json();
    const addr = data.address || {};
    const parts = [
      addr.road,
      addr.suburb || addr.neighbourhood,
      addr.city || addr.town || addr.village,
      addr.state,
      addr.postcode,
      addr.country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}

/**
 * Get current location with reverse geocoded address
 */
export async function getCurrentLocation(): Promise<GeolocationResult> {
  const { latitude, longitude } = await getCurrentPosition();
  const address = await reverseGeocode(latitude, longitude);
  return { latitude, longitude, address };
}
