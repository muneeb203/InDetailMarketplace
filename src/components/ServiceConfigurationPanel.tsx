import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ServiceCatalogGrid } from './ServiceCatalogGrid';
import { CustomServiceForm } from './CustomServiceForm';
import { PricingConfigurationForm } from './PricingConfigurationForm';
import { ServiceOfferingsList } from './ServiceOfferingsList';
import { useServiceConfiguration } from '../hooks/useServiceConfiguration';
import type {
  ServiceOfferingWithPrices,
  PricingConfigurationData,
  CustomServiceFormData,
} from '../types/serviceTypes';

interface ServiceConfigurationPanelProps {
  dealerId: string;
  mode: 'onboarding' | 'settings';
  onComplete?: () => void;
  onSkip?: () => void;
}

export function ServiceConfigurationPanel({
  dealerId,
  mode,
  onComplete,
  onSkip,
}: ServiceConfigurationPanelProps) {
  const {
    services,
    offerings,
    loading,
    error,
    refresh,
    createCustomService,
    toggleServiceOffering,
    configurePricing,
    deactivateOffering,
  } = useServiceConfiguration(dealerId);

  const [showCustomServiceForm, setShowCustomServiceForm] = useState(false);
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<ServiceOfferingWithPrices | null>(null);
  const [activeTab, setActiveTab] = useState('catalog');

  // Get IDs of services that have offerings
  const offeredServiceIds = offerings.map((o) => o.service_id);

  // Separate predefined and custom services
  const predefinedServices = services.filter((s) => s.is_predefined);
  const customServices = services.filter((s) => !s.is_predefined);

  const handleToggleService = async (serviceId: string) => {
    try {
      await toggleServiceOffering(serviceId);
      
      // If service was just added, open pricing dialog
      const wasAdded = !offeredServiceIds.includes(serviceId);
      if (wasAdded) {
        // Wait for refresh to complete
        await refresh();
        // Find the newly created offering
        const newOffering = offerings.find((o) => o.service_id === serviceId);
        if (newOffering) {
          setSelectedOffering(newOffering);
          setShowPricingDialog(true);
        }
      }
    } catch (err) {
      console.error('Error toggling service:', err);
      alert(err instanceof Error ? err.message : 'Failed to toggle service');
    }
  };

  const handleCreateCustomService = async (data: CustomServiceFormData) => {
    try {
      await createCustomService(data);
      setShowCustomServiceForm(false);
      setActiveTab('catalog'); // Switch back to catalog tab
    } catch (err) {
      console.error('Error creating custom service:', err);
      alert(err instanceof Error ? err.message : 'Failed to create custom service');
      throw err;
    }
  };

  const handleEditOffering = (offering: ServiceOfferingWithPrices) => {
    setSelectedOffering(offering);
    setShowPricingDialog(true);
  };

  const handleConfigurePricing = async (data: PricingConfigurationData) => {
    if (!selectedOffering) return;

    try {
      await configurePricing(selectedOffering.id, data);
      setShowPricingDialog(false);
      setSelectedOffering(null);
    } catch (err) {
      console.error('Error configuring pricing:', err);
      alert(err instanceof Error ? err.message : 'Failed to configure pricing');
      throw err;
    }
  };

  const handleDeactivate = async (offeringId: string) => {
    if (!confirm('Are you sure you want to deactivate this service offering?')) {
      return;
    }

    try {
      await deactivateOffering(offeringId);
    } catch (err) {
      console.error('Error deactivating offering:', err);
      alert(err instanceof Error ? err.message : 'Failed to deactivate offering');
    }
  };

  const handleComplete = () => {
    // Check if at least one offering is active
    const hasActiveOfferings = offerings.some((o) => o.is_active);
    
    if (!hasActiveOfferings && mode === 'onboarding') {
      if (!confirm('You haven\'t configured any services yet. Are you sure you want to continue?')) {
        return;
      }
    }

    onComplete?.();
  };

  if (loading) {
    return <div className="text-center py-8">Loading services...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: {error}
        <Button onClick={refresh} className="ml-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">
          {mode === 'onboarding' ? 'Configure Your Services' : 'Manage Services'}
        </h2>
        <p className="text-gray-600 mt-1">
          {mode === 'onboarding'
            ? 'Select services you offer and set pricing for each vehicle category'
            : 'Update your service offerings and pricing'}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalog">Service Catalog</TabsTrigger>
          <TabsTrigger value="custom">Custom Services</TabsTrigger>
          <TabsTrigger value="offerings">
            My Offerings ({offerings.length})
          </TabsTrigger>
        </TabsList>

        {/* Predefined Services Tab */}
        <TabsContent value="catalog" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Select from our predefined service catalog
            </p>
          </div>
          <ServiceCatalogGrid
            services={predefinedServices}
            selectedServiceIds={offeredServiceIds}
            onToggleService={handleToggleService}
          />
        </TabsContent>

        {/* Custom Services Tab */}
        <TabsContent value="custom" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Create custom services not in the catalog
            </p>
            <Button onClick={() => setShowCustomServiceForm(true)}>
              Add Custom Service
            </Button>
          </div>

          {showCustomServiceForm ? (
            <CustomServiceForm
              onSubmit={handleCreateCustomService}
              onCancel={() => setShowCustomServiceForm(false)}
            />
          ) : (
            <>
              {customServices.length > 0 ? (
                <ServiceCatalogGrid
                  services={customServices}
                  selectedServiceIds={offeredServiceIds}
                  onToggleService={handleToggleService}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No custom services yet. Click "Add Custom Service" to create one.
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* My Offerings Tab */}
        <TabsContent value="offerings" className="space-y-4">
          <p className="text-sm text-gray-600">
            Manage pricing for your selected services
          </p>
          <ServiceOfferingsList
            offerings={offerings}
            onEdit={handleEditOffering}
            onDeactivate={handleDeactivate}
          />
        </TabsContent>
      </Tabs>

      {/* Pricing Configuration Dialog */}
      <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Pricing</DialogTitle>
          </DialogHeader>
          {selectedOffering && (
            <PricingConfigurationForm
              serviceName={selectedOffering.service.name}
              initialData={
                selectedOffering.prices.length > 0
                  ? {
                      pricing_model: selectedOffering.pricing_model,
                      prices: selectedOffering.prices.map((p) => ({
                        vehicle_category_id: p.vehicle_category_id,
                        price: p.price,
                      })),
                    }
                  : undefined
              }
              onSubmit={handleConfigurePricing}
              onCancel={() => {
                setShowPricingDialog(false);
                setSelectedOffering(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Action Buttons (for onboarding mode) */}
      {mode === 'onboarding' && (
        <div className="flex justify-between pt-6 border-t">
          {onSkip && (
            <Button variant="outline" onClick={onSkip}>
              Skip for Now
            </Button>
          )}
          <Button onClick={handleComplete} className="ml-auto">
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
