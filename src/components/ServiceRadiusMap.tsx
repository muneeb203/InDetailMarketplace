/**
 * Service area map with circle overlay.
 * Circle radius uses METERS (miles × 1609.34) - required for correct display.
 * Loads Leaflet from CDN to avoid npm dependency.
 */
import { useEffect, useRef } from 'react';

const MILES_TO_METERS = 1609.34;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletMap = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletCircle = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletMarker = any;

declare global {
  interface Window {
    L?: {
      map: (el: HTMLElement) => LeafletMap;
      tileLayer: (url: string, opts: object) => { addTo: (m: LeafletMap) => void };
      marker: (latlng: [number, number], opts?: object) => LeafletMarker;
      circle: (latlng: [number, number], opts: object) => LeafletCircle;
      icon: (opts: object) => object;
    };
  }
}

interface ServiceRadiusMapProps {
  lat: number;
  lng: number;
  radiusMiles: number;
  className?: string;
}

function loadLeaflet(): Promise<NonNullable<Window['L']>> {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.L) return Promise.resolve(window.L);

  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.async = true;
    script.onload = () => {
      if (window.L) resolve(window.L);
      else reject(new Error('Leaflet failed to load'));
    };
    script.onerror = () => reject(new Error('Failed to load Leaflet script'));
    document.head.appendChild(script);
  });
}

export function ServiceRadiusMap({ lat, lng, radiusMiles, className = '' }: ServiceRadiusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const circleRef = useRef<LeafletCircle | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const radiusInMeters = radiusMiles * MILES_TO_METERS;

    loadLeaflet()
      .then((L) => {
        if (!mapRef.current) return;

        const markerIcon = L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        });

        if (!mapInstanceRef.current) {
          const map = L.map(mapRef.current).setView([lat, lng], 11);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
          }).addTo(map);

          markerRef.current = L.marker([lat, lng], { icon: markerIcon }).addTo(map);

          circleRef.current = L.circle([lat, lng], {
            radius: radiusInMeters,
            color: '#2563eb',
            fillColor: '#2563eb',
            fillOpacity: 0.2,
            weight: 2,
          }).addTo(map);

          mapInstanceRef.current = map;
          setTimeout(() => map.invalidateSize(), 100);
        } else {
          const map = mapInstanceRef.current;
          map.setView([lat, lng], 11);
          markerRef.current?.setLatLng([lat, lng]);

          if (circleRef.current) {
            circleRef.current.remove();
            circleRef.current = null;
          }
          circleRef.current = L.circle([lat, lng], {
            radius: radiusInMeters,
            color: '#2563eb',
            fillColor: '#2563eb',
            fillOpacity: 0.2,
            weight: 2,
          }).addTo(map);
        }
      })
      .catch(console.error);
  }, [lat, lng, radiusMiles]);

  useEffect(() => {
    return () => {
      circleRef.current?.remove();
      circleRef.current = null;
      markerRef.current?.remove();
      markerRef.current = null;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return <div ref={mapRef} className={`h-full min-h-[192px] rounded-xl z-0 ${className}`} />;
}
