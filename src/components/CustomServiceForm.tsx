import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import type { CustomServiceFormData } from '../types/serviceTypes';

interface CustomServiceFormProps {
  onSubmit: (data: CustomServiceFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: CustomServiceFormData;
  submitLabel?: string;
}

export function CustomServiceForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Create Service',
}: CustomServiceFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: { name?: string; description?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Service name is required';
    } else if (name.length > 100) {
      newErrors.name = 'Service name must be 100 characters or less';
    }

    if (!description.trim()) {
      newErrors.description = 'Service description is required';
    } else if (description.length > 500) {
      newErrors.description = 'Service description must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
      // Reset form on success
      setName('');
      setDescription('');
      setErrors({});
    } catch (err) {
      // Error handling is done by parent component
      console.error('Error submitting custom service:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Custom Service</CardTitle>
        <CardDescription>
          Create a custom service that's not in the predefined catalog
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service-name">
              Service Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="service-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Ceramic Coating Pro"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
            <p className="text-xs text-gray-500">
              {name.length}/100 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="service-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this service includes..."
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500">
              {description.length}/500 characters
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
