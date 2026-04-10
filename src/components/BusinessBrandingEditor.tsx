import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Building2, Upload, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { compressImage } from '../services/photoStorageService';

interface BusinessBrandingEditorProps {
  initialTagline?: string;
  initialLogoUrl?: string;
  businessName: string;
  onChange: (data: { tagline?: string; logoUrl?: string }) => void;
}

export function BusinessBrandingEditor({
  initialTagline,
  initialLogoUrl,
  businessName,
  onChange,
}: BusinessBrandingEditorProps) {
  const [tagline, setTagline] = useState(initialTagline || '');
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl || '');
  const [uploading, setUploading] = useState(false);

  const maxTaglineLength = 60;
  const remainingChars = maxTaglineLength - tagline.length;

  const handleTaglineChange = (value: string) => {
    if (value.length <= maxTaglineLength) {
      setTagline(value);
      onChange({ tagline: value, logoUrl });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Logo must be under 5MB');
      return;
    }

    try {
      setUploading(true);
      
      // Compress image to 200x200 for logo (small and optimized)
      const compressed = await compressImage(file, 200, 200, 0.85);
      
      // Simulate upload - in production, upload to cloud storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setLogoUrl(url);
        onChange({ tagline, logoUrl: url });
        setUploading(false);
      };
      reader.readAsDataURL(compressed);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    onChange({ tagline, logoUrl: '' });
  };

  const taglineSuggestions = [
    'Mobile Ceramic Coating Specialist',
    'Premium Auto Detailing',
    'Your Car, Perfectly Detailed',
    'Professional Mobile Detailing',
    'Luxury Car Care Expert',
  ];

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center">
            <Building2 className="w-5 h-5 text-orange-600" />
          </div>
          Business Branding
        </CardTitle>
        <CardDescription>
          Make your profile stand out with a logo and tagline
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-3">
          <Label>Business Logo (Optional)</Label>
          
          <div className="flex items-start gap-4">
            {/* Logo Preview */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {logoUrl ? (
                    <motion.img
                      key="logo"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      src={logoUrl}
                      alt="Business logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center p-2"
                    >
                      <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">No logo</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Upload/Remove Controls */}
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="logo-upload"
                className="cursor-pointer inline-block"
              >
                <div className={`
                  border-2 border-dashed rounded-xl p-4 transition-all
                  ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'}
                `}>
                  <div className="flex items-center gap-2 mb-1">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      {uploading ? 'Uploading...' : logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Square image, max 5MB
                  </p>
                </div>
              </Label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="hidden"
              />

              {logoUrl && (
                <Button
                  onClick={handleRemoveLogo}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove Logo
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500">
            A professional logo helps build trust and makes your profile more memorable
          </p>
        </div>

        {/* Tagline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="tagline">Tagline</Label>
            <Badge variant={remainingChars < 10 ? 'destructive' : 'secondary'}>
              {remainingChars} chars left
            </Badge>
          </div>

          <Input
            id="tagline"
            placeholder="e.g., Mobile Ceramic Coating Specialist"
            value={tagline}
            onChange={(e) => handleTaglineChange(e.target.value)}
            maxLength={maxTaglineLength}
            className="text-base"
          />

          <p className="text-xs text-gray-500">
            A catchy tagline that describes your specialty or unique value
          </p>

          {/* Suggestions */}
          {!tagline && (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Try these suggestions:
              </p>
              <div className="flex flex-wrap gap-2">
                {taglineSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleTaglineChange(suggestion)}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Card */}
        {(logoUrl || tagline) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4"
          >
            <p className="text-xs text-gray-600 mb-3">Preview in marketplace:</p>
            
            <div className="bg-white rounded-lg p-3 shadow-sm border">
              <div className="flex items-start gap-3">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    {businessName[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm line-clamp-1">{businessName}</h4>
                  {tagline && (
                    <p className="text-xs text-gray-600 line-clamp-1">{tagline}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Benefits */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h4 className="text-sm mb-2">✨ Branding Benefits</h4>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• <strong>Stand out</strong> in search results with a professional logo</li>
            <li>• <strong>Build trust</strong> with customers looking for credible detailers</li>
            <li>• <strong>Increase bookings</strong> by up to 30% with complete profiles</li>
            <li>• <strong>Look professional</strong> compared to text-only listings</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
