import { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { MapPin, Loader2, Check, AlertCircle } from 'lucide-react';
import { getCurrentLocation } from '../../../services/geolocationService';
import { updateDealerProfile } from '../../../services/dealerSettingsService';
import type { DealerProfileData } from '../../../hooks/useDealerProfile';
import { toast } from 'sonner';

interface LocationSectionProps {
  userId: string;
  data: DealerProfileData | null;
  onUpdate: (updates: Partial<DealerProfileData>) => void;
}

export function LocationSection({ userId, data, onUpdate }: LocationSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpdateLocation = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await getCurrentLocation();
      setSaving(true);
      await updateDealerProfile(userId, {
        base_location: result.address,
        location_lat: result.latitude,
        location_lng: result.longitude,
      });
      onUpdate({
        base_location: result.address,
        location_lat: result.latitude,
        location_lng: result.longitude,
      });
      setSuccess(true);
      toast.success('Location updated successfully');
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Unable to fetch location';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  const hasLocation = data?.base_location && data?.location_lat != null && data?.location_lng != null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location Settings
        </CardTitle>
        <CardDescription>
          Your base location helps customers find you. Update using GPS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasLocation && (
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-1">Current Location</p>
            <p className="text-sm text-gray-600">{data.base_location}</p>
            <p className="text-xs text-gray-500 mt-1">
              {data.location_lat?.toFixed(4)}, {data.location_lng?.toFixed(4)}
            </p>
          </div>
        )}

        <div className="h-40 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Map preview</p>
            <p className="text-xs">Location: {hasLocation ? data?.base_location : 'Not set'}</p>
          </div>
        </div>

        <Button
          onClick={handleUpdateLocation}
          disabled={loading || saving}
          className="w-full gap-2"
        >
          {(loading || saving) ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          {loading ? 'Fetching location...' : saving ? 'Saving...' : 'Update Current Location'}
        </Button>

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
            <Check className="w-4 h-4 flex-shrink-0" />
            Location updated successfully
          </div>
        )}

        {error && (
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-red-300 text-red-700 hover:bg-red-100"
              onClick={handleUpdateLocation}
              disabled={loading}
            >
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
