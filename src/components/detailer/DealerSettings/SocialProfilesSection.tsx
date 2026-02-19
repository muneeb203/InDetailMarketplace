import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Instagram, Share2, Facebook, Loader2, Trash2 } from 'lucide-react';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}
import {
  fetchDealerSocialLinks,
  saveDealerSocialLink,
  validateSocialUrl,
  type SocialPlatform,
} from '../../../services/dealerSocialService';
import { toast } from 'sonner';

const PLATFORMS: { key: SocialPlatform; label: string; icon: typeof Instagram | typeof TikTokIcon }[] = [
  { key: 'instagram', label: 'Instagram', icon: Instagram },
  { key: 'tiktok', label: 'TikTok', icon: TikTokIcon },
  { key: 'facebook', label: 'Facebook', icon: Facebook },
];

interface SocialProfilesSectionProps {
  dealerId: string;
}

export function SocialProfilesSection({ dealerId }: SocialProfilesSectionProps) {
  const [links, setLinks] = useState<Record<SocialPlatform, string>>({
    instagram: '',
    tiktok: '',
    facebook: '',
  });
  const [initialLinks, setInitialLinks] = useState<Record<SocialPlatform, string>>({
    instagram: '',
    tiktok: '',
    facebook: '',
  });
  const [loading, setLoading] = useState(true);
  const [savingPlatform, setSavingPlatform] = useState<SocialPlatform | null>(null);
  const [errors, setErrors] = useState<Record<SocialPlatform, string>>({
    instagram: '',
    tiktok: '',
    facebook: '',
  });

  useEffect(() => {
    let mounted = true;
    fetchDealerSocialLinks(dealerId)
      .then((data) => {
        if (!mounted) return;
        const next: Record<SocialPlatform, string> = { instagram: '', tiktok: '', facebook: '' };
        const init: Record<SocialPlatform, string> = { instagram: '', tiktok: '', facebook: '' };
        data.forEach((l) => {
          next[l.platform] = l.url;
          init[l.platform] = l.url;
        });
        setLinks(next);
        setInitialLinks(init);
      })
      .catch(() => {
        if (mounted) toast.error('Failed to load social links');
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [dealerId]);

  const hasChanges = (platform: SocialPlatform) => links[platform] !== initialLinks[platform];

  const handleSave = async (platform: SocialPlatform) => {
    const url = links[platform].trim();
    const err = url ? validateSocialUrl(platform, url) : null;
    if (err) {
      setErrors((e) => ({ ...e, [platform]: err }));
      toast.error(err);
      return;
    }
    setErrors((e) => ({ ...e, [platform]: '' }));
    setSavingPlatform(platform);
    try {
      const saved = await saveDealerSocialLink(dealerId, platform, url);
      setInitialLinks((prev) => ({ ...prev, [platform]: url }));
      if (saved) {
        toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} link saved`);
      } else {
        toast.success('Link removed');
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Failed to save';
      toast.error(msg);
    } finally {
      setSavingPlatform(null);
    }
  };

  const handleRemove = async (platform: SocialPlatform) => {
    setLinks((prev) => ({ ...prev, [platform]: '' }));
    setErrors((e) => ({ ...e, [platform]: '' }));
    setSavingPlatform(platform);
    try {
      await saveDealerSocialLink(dealerId, platform, '');
      setInitialLinks((prev) => ({ ...prev, [platform]: '' }));
      toast.success('Link removed');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to remove');
    } finally {
      setSavingPlatform(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Social Profiles
        </CardTitle>
        <CardDescription>
          Add your social media profile URLs. Links will appear on your public gig page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {PLATFORMS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {label}
            </Label>
            <div className="flex gap-2">
              <Input
                id={key}
                type="url"
                value={links[key]}
                onChange={(e) => {
                  setLinks((prev) => ({ ...prev, [key]: e.target.value }));
                  setErrors((err) => ({ ...err, [key]: '' }));
                }}
                placeholder={`https://${key === 'instagram' ? 'instagram.com' : key === 'tiktok' ? 'tiktok.com' : 'facebook.com'}/...`}
                className="flex-1"
              />
              <Button
                onClick={() => handleSave(key)}
                disabled={!hasChanges(key) || !!savingPlatform}
              >
                {savingPlatform === key ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Save'
                )}
              </Button>
              {initialLinks[key] && (
                <Button
                  variant="outline"
                  onClick={() => handleRemove(key)}
                  disabled={!!savingPlatform}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            {errors[key] && (
              <p className="text-sm text-red-600">{errors[key]}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
