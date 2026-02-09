import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Plus, GripVertical, Trash2, Tag, Check } from 'lucide-react';
import { Reorder } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface PortfolioImage {
  url: string;
  label?: string;
  category?: string;
}

interface PortfolioManagerProps {
  images: PortfolioImage[];
  onChange: (images: PortfolioImage[]) => void;
}

const CATEGORIES = [
  'Before/After',
  'Interior',
  'Exterior',
  'Ceramic Coating',
  'Paint Correction',
  'Detailing',
  'Engine Bay',
  'Wheels & Tires',
];

export function PortfolioManager({ images, onChange }: PortfolioManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const handleAdd = () => {
    // In real app, would trigger file picker
    const mockImage: PortfolioImage = {
      url: `https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80`,
      label: '',
      category: '',
    };
    onChange([...images, mockImage]);
    toast.success('Image added', {
      description: 'Add a label to help customers find your work',
    });
  };

  const handleDelete = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    toast.success('Image removed');
  };

  const handleReorder = (newImages: PortfolioImage[]) => {
    onChange(newImages);
  };

  const handleSaveLabel = (index: number) => {
    const newImages = [...images];
    newImages[index] = {
      ...newImages[index],
      label: editLabel,
      category: editCategory,
    };
    onChange(newImages);
    setEditingIndex(null);
    setEditLabel('');
    setEditCategory('');
    toast.success('Label saved');
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditLabel(images[index].label || '');
    setEditCategory(images[index].category || '');
  };

  if (images.length === 0) {
    return (
      <Card className="p-12 text-center border-2 border-dashed">
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="mb-2">Build Your Portfolio</h3>
          <p className="text-gray-500 text-sm mb-6">
            Showcase your best work to attract more customers. Add before/after photos,
            specialty services, and detailed shots.
          </p>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Add First Image
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3>Portfolio Manager</h3>
          <p className="text-sm text-gray-600">
            Drag to reorder, click to edit labels
          </p>
        </div>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Image
        </Button>
      </div>

      {/* Image Grid with Reorder */}
      <Reorder.Group
        axis="y"
        values={images}
        onReorder={handleReorder}
        className="space-y-3"
      >
        {images.map((image, index) => (
          <Reorder.Item key={image.url + index} value={image}>
            <Card className="p-4">
              <div className="flex items-start gap-4">
                {/* Drag Handle */}
                <button className="mt-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                  <GripVertical className="w-5 h-5" />
                </button>

                {/* Image Preview */}
                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={image.url}
                    alt={image.label || `Portfolio ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  {editingIndex === index ? (
                    <>
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        placeholder="e.g., Tesla Model 3 - Full Detail"
                        className="text-sm"
                      />
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <Badge
                            key={cat}
                            variant={editCategory === cat ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => setEditCategory(cat)}
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveLabel(index)}
                          className="gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingIndex(null);
                            setEditLabel('');
                            setEditCategory('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <p className="text-sm">
                          {image.label || (
                            <span className="text-gray-400">No label</span>
                          )}
                        </p>
                        {image.category && (
                          <Badge variant="secondary" className="text-xs">
                            {image.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEdit(index)}
                          className="gap-1 text-xs"
                        >
                          <Tag className="w-3 h-3" />
                          Edit Label
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Delete Button */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Tips */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="text-sm mb-2">Portfolio Tips</h4>
        <ul className="text-xs text-gray-700 space-y-1">
          <li>• Use before/after photos to show transformation</li>
          <li>• Add labels to help customers find specific services</li>
          <li>• Showcase a variety of work (interior, exterior, specialty)</li>
          <li>• High-quality photos get 3x more engagement</li>
        </ul>
      </Card>
    </div>
  );
}
