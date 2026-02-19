import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Instagram, Youtube, Facebook, Share2 } from 'lucide-react';
import { updateDealerProfile } from '../../../services/dealerSettingsService';
import { toast } from 'sonner';

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@yourhandle' },
  { key: 'tiktok', label: 'TikTok', icon: Share2, placeholder: '@yourhandle' },
  { key: 'youtube', label: 'YouTube Channel', icon: Youtube, placeholder: 'Channel URL or @handle' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'Page URL or username' },
  { key: 'google_business', label: 'Google Business', icon: Share2, placeholder: 'Business profile URL' },
] as const;

type SocialKey = (typeof SOCIAL_PLATFORMS)[number]['key'];

interface SocialHandles {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  facebook?: string;
  google_business?: string;
}

interface SocialSectionProps {
  userId: string;
  data: { social_handles?: SocialHandles } | null;
  onUpdate: (updates: { social_handles?: SocialHandles }) => void;
}

export function SocialSection({ userId, data, onUpdate }: SocialSectionProps) {
  const [handles, setHandles] = useState<SocialHandles>({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const sh = (data?.social_handles as SocialHandles) || {};
    setHandles(sh);
  }, [data?.social_handles]);

  useEffect(() => {
    const current = (data?.social_handles as SocialHandles) || {};
    const changed = SOCIAL_PLATFORMS.some((p) => (handles[p.key] ?? '') !== (current[p.key] ?? ''));
    setHasChanges(changed);
  }, [handles, data?.social_handles]);

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      await updateDealerProfile(userId, { social_handles: handles });
      onUpdate({ social_handles: handles });
      toast.success('Social links saved');
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Social Media & Links
        </CardTitle>
        <CardDescription>
          Add your social media handles to display on your public profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
              <Input
                id={key}
                value={handles[key as SocialKey] ?? ''}
                onChange={(e) =>
                  setHandles((prev) => ({ ...prev, [key]: e.target.value.trim() || undefined }))
                }
                placeholder={placeholder}
                className="flex-1"
              />
            </div>
          </div>
        ))}
        <Button onClick={handleSave} disabled={!hasChanges || saving} className="gap-2">
          {saving ? 'Saving...' : 'Save Social Links'}
        </Button>
      </CardContent>
    </Card>
  );
}
