import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import type { Service } from '../types/serviceTypes';

interface ServiceCatalogGridProps {
  services: Service[];
  selectedServiceIds: string[];
  onToggleService: (serviceId: string) => void;
  disabled?: boolean;
}

export function ServiceCatalogGrid({
  services,
  selectedServiceIds,
  onToggleService,
  disabled = false,
}: ServiceCatalogGridProps) {
  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No services available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => {
        const isSelected = selectedServiceIds.includes(service.id);

        return (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'hover:border-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onToggleService(service.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{service.name}</CardTitle>
                  {!service.is_predefined && (
                    <span className="text-xs text-gray-500 mt-1 inline-block">
                      Custom Service
                    </span>
                  )}
                </div>
                <Checkbox
                  checked={isSelected}
                  disabled={disabled}
                  onCheckedChange={() => onToggleService(service.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="ml-2"
                />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {service.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
