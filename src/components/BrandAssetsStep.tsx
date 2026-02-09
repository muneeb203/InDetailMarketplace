import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { ImageUpload } from './ImageUpload';
import { Upload, Palette, Type, FileText, Sparkles } from 'lucide-react';
import { BrandAssets } from '../types';
import { toast } from 'sonner@2.0.3';

interface BrandAssetsStepProps {
  onSave: (assets: BrandAssets) => void;
  initialAssets?: BrandAssets;
}

export function BrandAssetsStep({ onSave, initialAssets }: BrandAssetsStepProps) {
  const [assets, setAssets] = useState<BrandAssets>(
    initialAssets || {
      logo: '',
      bannerImage: '',
      accentColor: '#0078FF',
      tagline: '',
      shortBio: '',
    }
  );

  const presetColors = [
    { name: 'InDetail Blue', value: '#0078FF' },
    { name: 'Sky Blue', value: '#38BDF8' },
    { name: 'Purple', value: '#A855F7' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Rose', value: '#F43F5E' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Black', value: '#000000' },
  ];

  const handleSave = () => {
    if (!assets.tagline || assets.tagline.length === 0) {
      toast.error('Please add a tagline for your business');
      return;
    }

    if (assets.tagline.length > 70) {
      toast.error('Tagline must be 70 characters or less');
      return;
    }

    if (assets.shortBio && assets.shortBio.length > 240) {
      toast.error('Short bio must be 240 characters or less');
      return;
    }

    onSave(assets);
    toast.success('Brand assets saved!');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2>Build Your Brand</h2>
        <p className="text-gray-600">
          Create a memorable brand identity that stands out to customers and builds trust.
        </p>
      </div>

      {/* Logo Upload */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3>Business Logo</h3>
            <p className="text-sm text-gray-500">Square format works best (recommended: 512x512px)</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {assets.logo ? (
            <div className="relative w-24 h-24 rounded-xl border-2 border-blue-200 overflow-hidden">
              <img
                src={assets.logo}
                alt="Logo preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          <div className="flex-1">
            <ImageUpload
              onUpload={(url) => setAssets({ ...assets, logo: url })}
              label="Upload Logo"
              maxSizeInMB={5}
              accept="image/png,image/jpeg,image/webp"
            />
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG or WebP (max 5MB)
            </p>
          </div>
        </div>
      </Card>

      {/* Banner Image */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3>Profile Banner</h3>
            <p className="text-sm text-gray-500">Showcase your work (recommended: 1200x400px)</p>
          </div>
        </div>

        <div className="space-y-3">
          {assets.bannerImage ? (
            <div className="relative w-full aspect-[3/1] rounded-xl border-2 border-blue-200 overflow-hidden">
              <img
                src={assets.bannerImage}
                alt="Banner preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full aspect-[3/1] rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No banner uploaded yet</p>
              </div>
            </div>
          )}
          
          <ImageUpload
            onUpload={(url) => setAssets({ ...assets, bannerImage: url })}
            label="Upload Banner"
            maxSizeInMB={10}
            accept="image/png,image/jpeg,image/webp"
          />
        </div>
      </Card>

      {/* Accent Color */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3>Brand Color</h3>
            <p className="text-sm text-gray-500">Choose a color that represents your brand</p>
          </div>
        </div>

        {/* Color Presets */}
        <div className="grid grid-cols-4 gap-3">
          {presetColors.map((color) => (
            <button
              key={color.value}
              onClick={() => setAssets({ ...assets, accentColor: color.value })}
              className={`relative aspect-square rounded-lg border-4 transition-all ${
                assets.accentColor === color.value
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ backgroundColor: color.value }}
            >
              {assets.accentColor === color.value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Custom Color Picker */}
        <div className="flex items-center gap-3">
          <Label htmlFor="customColor">Custom Color:</Label>
          <div className="flex items-center gap-2">
            <input
              id="customColor"
              type="color"
              value={assets.accentColor || '#0078FF'}
              onChange={(e) => setAssets({ ...assets, accentColor: e.target.value })}
              className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
            />
            <span className="text-sm font-mono text-gray-600">
              {assets.accentColor}
            </span>
          </div>
        </div>
      </Card>

      {/* Tagline */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
            <Type className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3>Business Tagline *</h3>
            <p className="text-sm text-gray-500">A short, catchy phrase (max 70 characters)</p>
          </div>
        </div>

        <div>
          <Input
            placeholder="e.g., Premium Mobile Detailing - Your Car, Elevated"
            value={assets.tagline}
            onChange={(e) => setAssets({ ...assets, tagline: e.target.value })}
            maxLength={70}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {assets.tagline?.length || 0} / 70 characters
          </p>
        </div>

        {/* Examples */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-medium text-blue-900 mb-2">Example taglines:</p>
          <div className="space-y-1 text-xs text-blue-700">
            <p>• "Luxury Auto Detailing at Your Doorstep"</p>
            <p>• "Perfection in Every Detail"</p>
            <p>• "Mobile Detailing Done Right"</p>
          </div>
        </div>
      </Card>

      {/* Short Bio */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3>Short Bio</h3>
            <p className="text-sm text-gray-500">Quick intro to your business (max 240 characters)</p>
          </div>
        </div>

        <div>
          <Textarea
            placeholder="Tell customers what makes your service special. Focus on your expertise, approach, and what sets you apart..."
            value={assets.shortBio}
            onChange={(e) => setAssets({ ...assets, shortBio: e.target.value })}
            maxLength={240}
            className="h-24"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {assets.shortBio?.length || 0} / 240 characters
          </p>
        </div>
      </Card>

      {/* Preview Card */}
      <Card className="p-6 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-2 border-blue-100">
        <h4 className="mb-4">Brand Preview</h4>
        
        <div className="space-y-4">
          {/* Header Preview */}
          <div className="flex gap-4 p-4 bg-white rounded-lg border-2 border-gray-200">
            {/* Logo */}
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 border-2"
              style={{
                backgroundColor: assets.logo ? 'transparent' : assets.accentColor,
                borderColor: assets.accentColor,
              }}
            >
              {assets.logo ? (
                <img
                  src={assets.logo}
                  alt="Logo"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Sparkles className="w-8 h-8 text-white" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h4>Your Business Name</h4>
              {assets.tagline && (
                <p className="text-sm text-gray-600 mt-1">{assets.tagline}</p>
              )}
              {assets.shortBio && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  {assets.shortBio}
                </p>
              )}
            </div>
          </div>

          {/* Accent Color Preview */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200">
            <div
              className="w-10 h-10 rounded-lg"
              style={{ backgroundColor: assets.accentColor }}
            />
            <div className="flex-1">
              <p className="text-sm">Your brand color will appear throughout your profile</p>
              <p className="text-xs text-gray-500">Buttons, badges, and highlights</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleSave}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
        >
          Continue
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500">
        You can update your brand assets anytime in your profile settings
      </p>
    </div>
  );
}
