import { useState } from 'react';
import { Detailer } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { PhotoUpload } from './PhotoUpload';
import { PhotoGallery } from './PhotoGallery';

interface DetailerProfileEditProps {
  detailer: Detailer;
  onSave: (updates: Partial<Detailer>) => void;
  onBack: () => void;
}

export function DetailerProfileEdit({ detailer, onSave, onBack }: DetailerProfileEditProps) {
  const [formData, setFormData] = useState({
    businessName: detailer.businessName,
    bio: detailer.bio,
    serviceArea: detailer.serviceArea,
    priceRange: detailer.priceRange,
    phone: detailer.phone,
    email: detailer.email,
    portfolioPhotos: detailer.portfolioPhotos || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="p-4">
          <Button variant="ghost" onClick={onBack} className="mb-2">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h2>Edit Profile</h2>
          <p className="text-gray-600">Update your business information and portfolio</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto pb-24">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Business Information */}
          <div className="space-y-4">
            <h3>Business Information</h3>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceArea">Service Area</Label>
              <Input
                id="serviceArea"
                value={formData.serviceArea}
                onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceRange">Price Range</Label>
              <Select
                value={formData.priceRange}
                onValueChange={(value) => setFormData({ ...formData, priceRange: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">$ - Budget Friendly</SelectItem>
                  <SelectItem value="$$">$$ - Moderate</SelectItem>
                  <SelectItem value="$$$">$$$ - Premium</SelectItem>
                  <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 border-t pt-6">
            <h3>Contact Information</h3>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Portfolio */}
          <div className="space-y-4 border-t pt-6">
            <PhotoUpload
              photos={formData.portfolioPhotos}
              onChange={(photos) => setFormData({ ...formData, portfolioPhotos: photos })}
              maxPhotos={10}
              folder="portfolio"
              title="Portfolio"
              description="Showcase your best work with Before & After shots to boost trust and credibility"
              showCamera={true}
            />
          </div>

          {/* Current Portfolio Preview */}
          {formData.portfolioPhotos.length > 0 && (
            <div className="border-t pt-6">
              <PhotoGallery
                photos={formData.portfolioPhotos}
                title="Portfolio Preview"
                showVerifiedBadge={detailer.isPro}
              />
            </div>
          )}
        </form>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
