// Haversine formula for calculating distance between two coordinates
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Get user's current location
export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        // If user denies or error, use default location
        resolve(null);
      }
    );
  });
}

// Mock coordinates for demo (you can replace with real geocoding API)
export const MOCK_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Downtown': { lat: 40.7128, lng: -74.0060 },
  'North Side': { lat: 40.7589, lng: -73.9851 },
  'West End': { lat: 40.7614, lng: -73.9776 },
  'South Side': { lat: 40.6782, lng: -73.9442 },
  'East Side': { lat: 40.7484, lng: -73.9680 },
  'Midtown': { lat: 40.7549, lng: -73.9840 },
};

export function getCoordinatesForLocation(location: string): { lat: number; lng: number } {
  return MOCK_COORDINATES[location] || MOCK_COORDINATES['Downtown'];
}
