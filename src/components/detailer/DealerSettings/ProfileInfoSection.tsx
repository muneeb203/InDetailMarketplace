import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Loader2, Save, User } from 'lucide-react';
import { DealerImageManager } from '../DealerImageManager';
import { updateDealerProfile, type CommPreference } from '../../../services/dealerSettingsService';
import type { DealerProfileData } from '../../../hooks/useDealerProfile';
import { toast } from 'sonner';

const COMM_OPTIONS: { value: CommPreference; label: string }[] = [
  { value: 'voice-chat', label: 'Voice & Chat' },
  { value: 'voice', label: 'Voice only' },
  { value: 'chat', label: 'Chat only' },
];

interface ProfileInfoSectionProps {
  userId: string;
  data: DealerProfileData | null;
  onUpdate: (updates: Partial<DealerProfileData>) => void;
}

export function ProfileInfoSection({ userId, data, onUpdate }: ProfileInfoSectionProps) {
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [certifications, setCertifications] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState<string>('');
  const [commPreference, setCommPreference] = useState<CommPreference>('voice-chat');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data) {
      setBusinessName(data.business_name ?? '');
      setBio(data.bio ?? '');
      setCertifications(Array.isArray(data.certifications) ? data.certifications.join(', ') : '');
      setYearsInBusiness(String(data.years_in_business ?? ''));
      setCommPreference((data.comm_preference as CommPreference) ?? 'voice-chat');
    }
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const certs = certifications.split(',').map((c) => c.trim()).filter(Boolean);
    const years = yearsInBusiness ? parseInt(yearsInBusiness, 10) : undefined;
    const changed =
      (data.business_name ?? '') !== businessName ||
      (data.bio ?? '') !== bio ||
      JSON.stringify(data.certifications ?? []) !== JSON.stringify(certs) ||
      (data.years_in_business ?? undefined) !== years ||
      (data.comm_preference ?? 'voice-chat') !== commPreference;
    setHasChanges(changed);
  }, [businessName, bio, certifications, yearsInBusiness, commPreference, data]);

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      const certs = certifications.split(',').map((c) => c.trim()).filter(Boolean);
      const years = yearsInBusiness ? parseInt(yearsInBusiness, 10) : undefined;
      if (years !== undefined && (isNaN(years) || years < 0 || years > 100)) {
        toast.error('Years in business must be between 0 and 100');
        return;
      }
      await updateDealerProfile(userId, {
        business_name: businessName.trim() || undefined,
        bio: bio.trim() || undefined,
        certifications: certs.length > 0 ? certs : undefined,
        years_in_business: years,
        comm_preference: commPreference,
      });
      onUpdate({
        business_name: businessName.trim(),
        bio: bio.trim(),
        certifications: certs,
        years_in_business: years,
        comm_preference: commPreference,
      });
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Failed to update profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your business profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., Elite Auto Detailing"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Description</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell customers about your business..."
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Profile Logo</Label>
            <DealerImageManager
              userId={userId}
              showPortfolio={false}
              onLogoChange={(url) => onUpdate({ logo_url: url })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications</Label>
            <Input
              id="certifications"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              placeholder="e.g., IDA Certified, Paint Correction Specialist (comma-separated)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearsInBusiness">Years in Business</Label>
            <Input
              id="yearsInBusiness"
              type="number"
              min={0}
              max={100}
              value={yearsInBusiness}
              onChange={(e) => setYearsInBusiness(e.target.value)}
              placeholder="e.g., 10"
            />
          </div>
          <div className="space-y-2">
            <Label>Communication Preference</Label>
            <div className="flex flex-wrap gap-2">
              {COMM_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={commPreference === opt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCommPreference(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
