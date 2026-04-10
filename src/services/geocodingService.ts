/**
 * Geocoding service using OpenStreetMap Nominatim (free, no API key required).
 * For production at scale, consider Google Maps or Mapbox with env-based API keys.
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'InDetailMarketplace/1.0 (car service marketplace; contact@example.com)';

export interface LocationResult {
  display: string;
  lat: number;
  lng: number;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  country?: string;
  country_code?: string;
}

interface NominatimReverseResult {
  address?: NominatimAddress;
  lat?: string;
  lon?: string;
}

interface NominatimSearchResult {
  lat: string;
  lon: string;
  address?: NominatimAddress;
  display_name?: string;
}

function formatCityState(address: NominatimAddress | undefined, displayName?: string): string {
  if (!address) return displayName || 'Unknown';
  const city = address.city || address.town || address.village || address.municipality || '';
  const state = address.state || address.country || '';
  const parts = [city, state].filter(Boolean);
  if (parts.length === 0) return displayName || 'Unknown';
  return parts.join(', ');
}

/**
 * Reverse geocode: convert lat/lng to "City, State".
 * Uses Nominatim; no API key required.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<LocationResult> {
  const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json', 'User-Agent': USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`Geocoding failed: ${res.status} ${res.statusText}`);
  }
  const data: NominatimReverseResult = await res.json();
  const latNum = data.lat != null ? parseFloat(data.lat) : lat;
  const lngNum = data.lon != null ? parseFloat(data.lon) : lng;
  const display = formatCityState(data.address, undefined);
  if (display === 'Unknown') {
    throw new Error('Could not determine city and state for this location');
  }
  return { display, lat: latNum, lng: lngNum };
}

/**
 * Search locations by query (for autocomplete).
 * Returns array of { display, lat, lng }. Debounce calls (Nominatim: 1 req/s).
 */
export async function searchLocations(query: string): Promise<LocationResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json', 'User-Agent': USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`Search failed: ${res.status} ${res.statusText}`);
  }
  const data: NominatimSearchResult[] = await res.json();
  return data.map((item) => ({
    display: formatCityState(item.address, item.display_name),
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}
