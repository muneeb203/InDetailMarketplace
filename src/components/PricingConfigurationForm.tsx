import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useVehicleCategories } from '../hooks/useVehicleCategories';
import type { PricingModel, PricingConfigurationData } from '../types/serviceTypes';

interface PricingConfigurationFormProps {
  serviceName: string;
  initialData?: PricingConfigurationData;
  onSubmit: (data: PricingConfigurationData) => Promise<void>;
  onCancel: () => void;
}

export function PricingConfigurationForm({
  serviceName,
  initialData,
  onSubmit,
  onCancel,
}: PricingConfigurationFormProps) {
  const { categories, loading: categoriesLoading } = useVehicleCategories();
  const [pricingModel, setPricingModel] = useState<PricingModel>(
    initialData?.pricing_model || 'single'
  );
  const [prices, setPrices] = useState<{ [categoryId: string]: string }>({});
  const [errors, setErrors] = useState<{ [categoryId: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && categories.length > 0) {
      const priceMap: { [categoryId: string]: string } = {};
      initialData.prices.forEach((p) => {
        priceMap[p.vehicle_category_id] = p.price.toString();
      });
      setPrices(priceMap);
    } else if (categories.length > 0 && Object.keys(prices).length === 0) {
      // Initialize with empty strings for all categories
      const priceMap: { [categoryId: string]: string } = {};
      categories.forEach((cat) => {
        priceMap[cat.id] = '';
      });
      setPrices(priceMap);
    }
  }, [categories, initialData]);

  const validate = (): boolean => {
    const newErrors: { [categoryId: string]: string } = {};

    if (pricingModel === 'single') {
      // For single pricing, only validate the first category
      const firstCategoryId = categories[0]?.id;
      if (firstCategoryId) {
        const price = parseFloat(prices[firstCategoryId] || '0');
        if (isNaN(price) || price <= 0) {
          newErrors[firstCategoryId] = 'Price must be greater than 0';
        }
      }
    } else {
      // For multi-tier, validate all categories
      categories.forEach((cat) => {
        const price = parseFloat(prices[cat.id] || '0');
        if (isNaN(price) || price <= 0) {
          newErrors[cat.id] = 'Price must be greater than 0';
        }
      });
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
      const priceData: PricingConfigurationData = {
        pricing_model: pricingModel,
        prices: [],
      };

      if (pricingModel === 'single') {
        // For single pricing, use the first category's price for all categories
        const firstCategoryId = categories[0]?.id;
        const price = parseFloat(prices[firstCategoryId] || '0');
        priceData.prices = [
          {
            vehicle_category_id: firstCategoryId,
            price,
          },
        ];
      } else {
        // For multi-tier, include all category prices
        priceData.prices = categories.map((cat) => ({
          vehicle_category_id: cat.id,
          price: parseFloat(prices[cat.id] || '0'),
        }));
      }

      await onSubmit(priceData);
    } catch (err) {
      console.error('Error submitting pricing configuration:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (categoriesLoading) {
    return <div className="text-center py-8">Loading vehicle categories...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Pricing: {serviceName}</CardTitle>
        <CardDescription>
          Set up pricing for this service. Choose single pricing for one price across all vehicle
          types, or multi-tier for different prices per vehicle category.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pricing Model Selection */}
          <div className="space-y-3">
            <Label>Pricing Model <span className="text-red-500">*</span></Label>
            <RadioGroup
              value={pricingModel}
              onValueChange={(value) => setPricingModel(value as PricingModel)}
              disabled={isSubmitting}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single" className="font-normal cursor-pointer">
                  Single Pricing - Same price for all vehicle types
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multi-tier" id="multi-tier" />
                <Label htmlFor="multi-tier" className="font-normal cursor-pointer">
                  Multi-Tier Pricing - Different prices per vehicle category
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Price Inputs */}
          <div className="space-y-4">
            <Label>
              {pricingModel === 'single' ? 'Price' : 'Prices by Vehicle Category'}{' '}
              <span className="text-red-500">*</span>
            </Label>

            {pricingModel === 'single' ? (
              // Single pricing: show only one input
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={prices[categories[0]?.id] || ''}
                    onChange={(e) =>
                      setPrices({ ...prices, [categories[0]?.id]: e.target.value })
                    }
                    placeholder="0.00"
                    disabled={isSubmitting}
                    className="max-w-xs"
                  />
                </div>
                {errors[categories[0]?.id] && (
                  <p className="text-sm text-red-500">{errors[categories[0]?.id]}</p>
                )}
              </div>
            ) : (
              // Multi-tier: show input for each category
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-gray-500">{category.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={prices[category.id] || ''}
                          onChange={(e) =>
                            setPrices({ ...prices, [category.id]: e.target.value })
                          }
                          placeholder="0.00"
                          disabled={isSubmitting}
                          className="w-32"
                        />
                      </div>
                    </div>
                    {errors[category.id] && (
                      <p className="text-sm text-red-500">{errors[category.id]}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Pricing'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
