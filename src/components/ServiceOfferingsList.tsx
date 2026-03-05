import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useVehicleCategories } from '../hooks/useVehicleCategories';
import type { ServiceOfferingWithPrices } from '../types/serviceTypes';

interface ServiceOfferingsListProps {
  offerings: ServiceOfferingWithPrices[];
  onEdit: (offering: ServiceOfferingWithPrices) => void;
  onDeactivate: (offeringId: string) => void;
  loading?: boolean;
}

export function ServiceOfferingsList({
  offerings,
  onEdit,
  onDeactivate,
  loading = false,
}: ServiceOfferingsListProps) {
  const { categories } = useVehicleCategories();

  if (loading) {
    return <div className="text-center py-8">Loading offerings...</div>;
  }

  if (offerings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No service offerings configured yet. Select services above to get started.
      </div>
    );
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {offerings.map((offering) => {
        const isComplete = offering.is_active;
        const hasPricing = offering.prices.length > 0;

        return (
          <Card key={offering.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{offering.service.name}</CardTitle>
                    {!isComplete && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Incomplete
                      </Badge>
                    )}
                    {isComplete && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1">
                    {offering.service.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(offering)}
                  >
                    {hasPricing ? 'Edit Pricing' : 'Configure Pricing'}
                  </Button>
                  {isComplete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeactivate(offering.id)}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {hasPricing ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Pricing Model:{' '}
                    <span className="font-normal">
                      {offering.pricing_model === 'single'
                        ? 'Single Pricing'
                        : 'Multi-Tier Pricing'}
                    </span>
                  </p>

                  {offering.pricing_model === 'single' ? (
                    <div className="text-sm">
                      <span className="font-medium">Price: </span>
                      <span className="text-lg font-semibold text-blue-600">
                        {formatPrice(offering.prices[0]?.price || 0)}
                      </span>
                      <span className="text-gray-500 ml-1">(all vehicle types)</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Prices by Vehicle Category:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {categories.map((category) => {
                          const price = offering.prices.find(
                            (p) => p.vehicle_category_id === category.id
                          );
                          return (
                            <div
                              key={category.id}
                              className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded"
                            >
                              <span className="text-sm">{category.name}</span>
                              <span className="font-semibold text-blue-600">
                                {price ? formatPrice(price.price) : 'N/A'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-yellow-600">
                  ⚠️ Pricing not configured. Click "Configure Pricing" to set up prices.
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
