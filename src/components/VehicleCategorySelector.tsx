import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useVehicleCategories } from '../hooks/useVehicleCategories';

interface VehicleCategorySelectorProps {
  value: string | null;
  onChange: (categoryId: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export function VehicleCategorySelector({
  value,
  onChange,
  disabled = false,
  required = false,
}: VehicleCategorySelectorProps) {
  const { categories, loading, error } = useVehicleCategories();

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Vehicle Type</Label>
        <div className="text-sm text-gray-500">Loading vehicle categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label>Vehicle Type</Label>
        <div className="text-sm text-red-500">Error loading categories: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="vehicle-category">
        Vehicle Type {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="vehicle-category" className="w-full">
          <SelectValue placeholder="Select your vehicle type" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex flex-col">
                <span className="font-medium">{category.name}</span>
                <span className="text-xs text-gray-500">{category.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!value && (
        <p className="text-sm text-gray-500">
          Select your vehicle type to see available services and pricing
        </p>
      )}
    </div>
  );
}
