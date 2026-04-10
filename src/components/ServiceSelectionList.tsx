import { useEffect } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useServiceOfferings } from '../hooks/useServiceOfferings';
import type { ServiceOfferingWithPrice } from '../types/serviceTypes';

interface ServiceSelectionListProps {
  dealerId: string;
  vehicleCategoryId: string | null;
  selectedOfferingIds: string[];
  onToggleOffering: (offeringId: string, price: number, serviceName: string) => void;
  onOfferingsLoaded?: (offerings: ServiceOfferingWithPrice[]) => void;
  disabled?: boolean;
}

export function ServiceSelectionList({
  dealerId,
  vehicleCategoryId,
  selectedOfferingIds,
  onToggleOffering,
  onOfferingsLoaded,
  disabled = false,
}: ServiceSelectionListProps) {
  const { offerings, loading, error } = useServiceOfferings(dealerId, vehicleCategoryId);

  useEffect(() => {
    onOfferingsLoaded?.(offerings);
  }, [offerings, onOfferingsLoaded]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (!vehicleCategoryId) {
    return (
      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
        Please select your vehicle type above to see available services
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading services...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading services: {error}
      </div>
    );
  }

  if (offerings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        This detailer hasn't configured any services yet. Please check back later.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">
        Select Services <span className="text-red-500">*</span>
      </Label>
      <p className="text-sm text-gray-600">
        Choose one or more services for your vehicle
      </p>

      <div className="space-y-3">
        {offerings.map((offering) => {
          const isSelected = selectedOfferingIds.includes(offering.id);

          return (
            <Card
              key={offering.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'hover:border-gray-400'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && onToggleOffering(offering.id, offering.price, offering.service.name)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{offering.service.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {offering.service.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">
                        {formatPrice(offering.price)}
                      </div>
                      {offering.pricing_model === 'multi-tier' && (
                        <div className="text-xs text-gray-500">for your vehicle</div>
                      )}
                    </div>
                    <Checkbox
                      checked={isSelected}
                      disabled={disabled}
                      onCheckedChange={() => onToggleOffering(offering.id, offering.price, offering.service.name)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
