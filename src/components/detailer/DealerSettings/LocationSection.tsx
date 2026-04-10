import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Slider } from '../../ui/slider';
import { Label } from '../../ui/label';
import { MapPin, Loader2, Check, AlertCircle, Minus, Plus, Save } from 'lucide-react';
import { getCurrentLocation } from '../../../services/geolocationService';
import { updateDealerProfile } from '../../../services/dealerSettingsService';
import type { DealerProfileData } from '../../../hooks/useDealerProfile';
import { ServiceRadiusMap } from '../../ServiceRadiusMap';
import { toast } from 'sonner';

const MIN_RADIUS = 5;
const MAX_RADIUS = 100;
const RADIUS_STEP = 5;

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

  const serviceRadius = data?.service_radius_miles ?? 10;
  const [radiusValue, setRadiusValue] = useState(serviceRadius);
  const [radiusInput, setRadiusInput] = useState(String(serviceRadius));
  const [radiusSaving, setRadiusSaving] = useState(false);
  const [radiusHasChanges, setRadiusHasChanges] = useState(false);

  useEffect(() => {
    const val = data?.service_radius_miles ?? 10;
    setRadiusValue(val);
    setRadiusInput(String(val));
  }, [data?.service_radius_miles]);

  useEffect(() => {
    setRadiusInput(String(radiusValue));
  }, [radiusValue]);

  useEffect(() => {
    setRadiusHasChanges(radiusValue !== (data?.service_radius_miles ?? 10));
  }, [radiusValue, data?.service_radius_miles]);

  const clampToStep = (n: number) =>
    Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, Math.round(n / RADIUS_STEP) * RADIUS_STEP));

  const handleRadiusInputChange = (value: string) => setRadiusInput(value);

  const handleRadiusBlur = () => {
    const num = parseInt(radiusInput, 10);
    if (isNaN(num) || num < MIN_RADIUS) {
      setRadiusValue(MIN_RADIUS);
      setRadiusInput(String(MIN_RADIUS));
    } else if (num > MAX_RADIUS) {
      setRadiusValue(MAX_RADIUS);
      setRadiusInput(String(MAX_RADIUS));
    } else {
      const stepped = clampToStep(num);
      setRadiusValue(stepped);
      setRadiusInput(String(stepped));
    }
  };

  const handleSaveRadius = async () => {
    if (!radiusHasChanges) return;
    setRadiusSaving(true);
    try {
      await updateDealerProfile(userId, { service_radius_miles: radiusValue });
      onUpdate({ service_radius_miles: radiusValue });
      toast.success('Service radius updated');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to update');
    } finally {
      setRadiusSaving(false);
    }
  };

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

  const hasLocation =
    data?.base_location && data?.location_lat != null && data?.location_lng != null;
  const lat = typeof data?.location_lat === 'number' ? data.location_lat : 0;
  const lng = typeof data?.location_lng === 'number' ? data.location_lng : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location Settings
        </CardTitle>
        <CardDescription>
          Your base location and service radius. You will receive job requests within your radius.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasLocation && (
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-1">Current Location</p>
            <p className="text-sm text-gray-600">{data.base_location}</p>
            <p className="text-xs text-gray-500 mt-1">
              {data.location_lat?.toFixed(4)}, {data.location_lng?.toFixed(4)}
            </p>
          </div>
        )}

        {/* Service Radius */}
        <div className="space-y-4">
          <Label>Service Radius (Miles)</Label>
          {!hasLocation ? (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              Please set your business location first.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => setRadiusValue((r) => Math.max(MIN_RADIUS, r - RADIUS_STEP))}
                  disabled={radiusValue <= MIN_RADIUS}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Slider
                  value={[radiusValue]}
                  onValueChange={([v]) => setRadiusValue(v)}
                  min={MIN_RADIUS}
                  max={MAX_RADIUS}
                  step={RADIUS_STEP}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => setRadiusValue((r) => Math.min(MAX_RADIUS, r + RADIUS_STEP))}
                  disabled={radiusValue >= MAX_RADIUS}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={MIN_RADIUS}
                  max={MAX_RADIUS}
                  step={RADIUS_STEP}
                  value={radiusInput}
                  onChange={(e) => handleRadiusInputChange(e.target.value)}
                  onBlur={handleRadiusBlur}
                  onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                  className="w-20 h-9 text-center"
                />
                <span className="text-sm text-gray-600">miles</span>
              </div>
              <p className="text-sm text-gray-600">
                You will receive job requests within {radiusValue} miles.
              </p>
              <Button
                onClick={handleSaveRadius}
                disabled={!radiusHasChanges || radiusSaving}
                className="gap-2"
              >
                {radiusSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Service Radius
              </Button>
            </>
          )}
        </div>

        {/* Map Preview */}
        <div className="h-48 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 relative">
          {hasLocation ? (
            <>
              <ServiceRadiusMap lat={lat} lng={lng} radiusMiles={radiusValue} className="w-full h-full" />
              <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-white/95 shadow text-sm font-medium">
                Radius: {radiusValue} miles
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Map preview</p>
                <p className="text-xs">Set your location to see your service area</p>
              </div>
            </div>
          )}
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
