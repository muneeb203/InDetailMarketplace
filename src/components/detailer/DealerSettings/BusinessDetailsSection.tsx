import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import { Loader2, Save, Briefcase, Shield, Crown } from 'lucide-react';
import { updateDealerProfile } from '../../../services/dealerSettingsService';
import type { DealerProfileData } from '../../../hooks/useDealerProfile';
import { toast } from 'sonner';

const SPECIALTIES = [
  'Full Detail',
  'Ceramic Coating',
  'Paint Correction',
  'Interior Detailing',
  'Exterior Wash',
  'Wax & Polish',
  'Engine Bay Cleaning',
  'Headlight Restoration',
];

/** Only value ($, $$, $$$, $$$$) is saved to dealer_profiles.price_range */
const PRICE_RANGES = [
  { value: '$', label: '$' },
  { value: '$$', label: '$$' },
  { value: '$$$', label: '$$$' },
  { value: '$$$$', label: '$$$$' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface BusinessDetailsSectionProps {
  userId: string;
  data: DealerProfileData | null;
  onUpdate: (updates: Partial<DealerProfileData>) => void;
  isProAdminControlled?: boolean;
}

export function BusinessDetailsSection({
  userId,
  data,
  onUpdate,
  isProAdminControlled = false,
}: BusinessDetailsSectionProps) {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState('');
  const [operatingHours, setOperatingHours] = useState<
    Record<string, { isOpen: boolean; open: string; close: string }>
  >({});
  const [isInsured, setIsInsured] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data) {
      const so = data.services_offered as { specialties?: string[] } | undefined;
      setSpecialties(so?.specialties ?? []);
      setPriceRange(data.price_range ?? '$$');
      setOperatingHours(
        data.operating_hours ??
          DAYS.reduce(
            (acc, d) => ({
              ...acc,
              [d]: { isOpen: d !== 'Sunday', open: '09:00', close: '18:00' },
            }),
            {} as Record<string, { isOpen: boolean; open: string; close: string }>
          )
      );
      setIsInsured(data.is_insured ?? false);
      setIsPro(data.is_pro ?? false);
    }
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const so = data.services_offered as { specialties?: string[] } | undefined;
    const changed =
      JSON.stringify(so?.specialties ?? []) !== JSON.stringify(specialties) ||
      (data.price_range ?? '') !== priceRange ||
      JSON.stringify(data.operating_hours ?? {}) !== JSON.stringify(operatingHours) ||
      (data.is_insured ?? false) !== isInsured ||
      (data.is_pro ?? false) !== isPro;
    setHasChanges(changed);
  }, [specialties, priceRange, operatingHours, isInsured, isPro, data]);

  const toggleSpecialty = (s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      await updateDealerProfile(userId, {
        services_offered: { specialties },
        price_range: priceRange,
        operating_hours: operatingHours,
        is_insured: isInsured,
        is_pro: isProAdminControlled ? undefined : isPro,
      });
      onUpdate({
        services_offered: { specialties },
        price_range: priceRange,
        operating_hours: operatingHours,
        is_insured: isInsured,
        is_pro: isPro,
      });
      toast.success('Business details updated');
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Failed to update';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Business Details
        </CardTitle>
        <CardDescription>Services, pricing, and operating hours</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-2 block">Services Offered</Label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => (
              <Badge
                key={s}
                variant={specialties.includes(s) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleSpecialty(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Price Range</Label>
          <div className="flex flex-wrap gap-2">
            {PRICE_RANGES.map((r) => (
              <Button
                key={r.value}
                variant={priceRange === r.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPriceRange(r.value)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Operating Hours</Label>
          <div className="space-y-2">
            {DAYS.map((day) => {
              const dayHours = operatingHours[day] ?? {
                isOpen: day !== 'Sunday',
                open: '09:00',
                close: '18:00',
              };
              return (
                <div
                  key={day}
                  className="flex items-center gap-3 p-2 rounded-lg border"
                >
                  <Switch
                    checked={dayHours.isOpen}
                    onCheckedChange={(v) =>
                      setOperatingHours((prev) => ({
                        ...prev,
                        [day]: { ...(prev[day] ?? dayHours), isOpen: v, open: '09:00', close: '18:00' },
                      }))
                    }
                  />
                  <span className="w-24 text-sm">{day}</span>
                  <input
                    type="time"
                    value={dayHours.open}
                    onChange={(e) =>
                      setOperatingHours((prev) => ({
                        ...prev,
                        [day]: { ...(prev[day] ?? dayHours), open: e.target.value },
                      }))
                    }
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={dayHours.close}
                    onChange={(e) =>
                      setOperatingHours((prev) => ({
                        ...prev,
                        [day]: { ...(prev[day] ?? dayHours), close: e.target.value },
                      }))
                    }
                    className="px-2 py-1 border rounded text-sm"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <Label>Insured</Label>
              <p className="text-xs text-gray-500">Display insured badge on profile</p>
            </div>
          </div>
          <Switch checked={isInsured} onCheckedChange={setIsInsured} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <div>
              <Label>Pro Account</Label>
              <p className="text-xs text-gray-500">
                {isProAdminControlled ? 'Managed by admin' : 'Pro features'}
              </p>
            </div>
          </div>
          <Switch
            checked={isPro}
            onCheckedChange={setIsPro}
            disabled={isProAdminControlled}
          />
        </div>

        <Button onClick={handleSave} disabled={!hasChanges || saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Business Details
        </Button>
      </CardContent>
    </Card>
  );
}
