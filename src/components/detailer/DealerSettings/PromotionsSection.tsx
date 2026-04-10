import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Percent, Calendar, Tag } from 'lucide-react';
import { updateDealerProfile } from '../../../services/dealerSettingsService';
import { PromoCodeManager } from '../../PromoCodeManager';
import { toast } from 'sonner';

interface PromoData {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

interface PromotionsSectionProps {
  userId: string;
  data: { promo?: PromoData } | null;
  onUpdate: (updates: { promo?: PromoData }) => void;
}

export function PromotionsSection({ userId, data, onUpdate }: PromotionsSectionProps) {
  const [promo, setPromo] = useState<PromoData>({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const p = (data?.promo as PromoData) || {};
    setPromo(p);
  }, [data?.promo]);

  useEffect(() => {
    const current = (data?.promo as PromoData) || {};
    const changed =
      (promo.title ?? '') !== (current.title ?? '') ||
      (promo.description ?? '') !== (current.description ?? '') ||
      (promo.startDate ?? '') !== (current.startDate ?? '') ||
      (promo.endDate ?? '') !== (current.endDate ?? '') ||
      (promo.active ?? false) !== (current.active ?? false);
    setHasChanges(changed);
  }, [promo, data?.promo]);

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      await updateDealerProfile(userId, { promo });
      onUpdate({ promo });
      toast.success('Promotion saved');
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="banner" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="banner" className="flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Promotion Banner
          </TabsTrigger>
          <TabsTrigger value="codes" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Promo Codes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="banner" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Promotion Banner
              </CardTitle>
              <CardDescription>
                Create a limited-time offer banner to display on your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <input
                  type="checkbox"
                  id="promo-active"
                  checked={promo.active ?? false}
                  onChange={(e) => setPromo((prev) => ({ ...prev, active: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600"
                />
                <Label htmlFor="promo-active" className="cursor-pointer">
                  Enable active promotion banner on my profile
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="promo-title">Offer Title</Label>
                <Input
                  id="promo-title"
                  value={promo.title ?? ''}
                  onChange={(e) => setPromo((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., 20% Off First Service"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="promo-desc">Description</Label>
                <Input
                  id="promo-desc"
                  value={promo.description ?? ''}
                  onChange={(e) => setPromo((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., New customers get 20% off their first detailing service"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="promo-start" className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Start Date
                  </Label>
                  <Input
                    id="promo-start"
                    type="date"
                    value={promo.startDate ?? ''}
                    onChange={(e) => setPromo((prev) => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo-end">End Date</Label>
                  <Input
                    id="promo-end"
                    type="date"
                    value={promo.endDate ?? ''}
                    onChange={(e) => setPromo((prev) => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleSave} disabled={!hasChanges || saving} className="gap-2">
                {saving ? 'Saving...' : 'Save Promotion Banner'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="codes" className="mt-6">
          <PromoCodeManager dealerId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
