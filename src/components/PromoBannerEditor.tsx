import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Megaphone, Plus, Edit2, Trash2, Calendar, Package } from 'lucide-react';
import { PromoBanner } from '../types';
import { toast } from 'sonner@2.0.3';

interface PromoBannerEditorProps {
  banners?: PromoBanner[];
  onSave?: (banner: PromoBanner) => void;
  onDelete?: (bannerId: string) => void;
}

export function PromoBannerEditor({ banners = [], onSave, onDelete }: PromoBannerEditorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    limitedInventory: '',
    isActive: true,
  });

  const handleCreate = () => {
    setIsCreating(true);
    setEditingBanner(null);
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      limitedInventory: '',
      isActive: true,
    });
  };

  const handleEdit = (banner: PromoBanner) => {
    setEditingBanner(banner);
    setIsCreating(true);
    setFormData({
      title: banner.title,
      description: banner.description,
      startDate: banner.startDate,
      endDate: banner.endDate,
      limitedInventory: banner.limitedInventory?.toString() || '',
      isActive: banner.isActive,
    });
  };

  const handleSave = () => {
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const banner: PromoBanner = {
      id: editingBanner?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      limitedInventory: formData.limitedInventory ? parseInt(formData.limitedInventory) : undefined,
      isActive: formData.isActive,
    };

    onSave?.(banner);
    toast.success(editingBanner ? 'Promo updated!' : 'Promo created!');
    setIsCreating(false);
    setEditingBanner(null);
  };

  const handleDelete = (bannerId: string) => {
    onDelete?.(bannerId);
    toast.success('Promo deleted');
  };

  if (isCreating) {
    return (
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <h3>{editingBanner ? 'Edit Promo Banner' : 'Create Promo Banner'}</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
            Cancel
          </Button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Promo Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Summer Special - 20% Off!"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your promotion and what's included..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 h-20"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Limited Inventory */}
          <div>
            <Label htmlFor="inventory">Limited Inventory (Optional)</Label>
            <Input
              id="inventory"
              type="number"
              placeholder="e.g., 10 spots available"
              value={formData.limitedInventory}
              onChange={(e) => setFormData({ ...formData, limitedInventory: e.target.value })}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Creates urgency by showing limited availability</p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label>Active Status</Label>
              <p className="text-sm text-gray-600">Show this promo on your profile</p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-gradient-to-r from-orange-50 to-pink-50 border-2 border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Megaphone className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="text-orange-900">{formData.title || 'Your Promo Title'}</h4>
              <p className="text-sm text-orange-700 mt-1">
                {formData.description || 'Your promo description will appear here...'}
              </p>
              {formData.limitedInventory && (
                <Badge className="mt-2 bg-orange-600 text-white">
                  Only {formData.limitedInventory} spots left!
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full">
          {editingBanner ? 'Update Promo' : 'Create Promo'}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3>Promo Banners</h3>
            <p className="text-sm text-gray-500">Attract more customers with special offers</p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          New Promo
        </Button>
      </div>

      {/* Existing Banners */}
      {banners.length > 0 ? (
        <div className="space-y-3">
          {banners.map((banner) => (
            <Card key={banner.id} className="p-4 bg-gradient-to-r from-orange-50/50 to-pink-50/50">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4>{banner.title}</h4>
                    {banner.isActive ? (
                      <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{banner.description}</p>
                  
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(banner.startDate).toLocaleDateString()} - {new Date(banner.endDate).toLocaleDateString()}
                    </div>
                    {banner.limitedInventory && (
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {banner.limitedInventory} spots
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(banner)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(banner.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No active promos yet</p>
          <p className="text-sm mt-1">Create your first promo to attract more customers!</p>
        </div>
      )}
    </Card>
  );
}
