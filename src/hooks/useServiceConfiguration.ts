import { useState, useEffect, useCallback } from 'react';
import {
  getDetailerAvailableServices,
  createCustomService,
  updateCustomService,
  deleteCustomService,
} from '../services/serviceManagementService';
import {
  getDetailerOfferings,
  createServiceOffering,
  configurePricing,
  updateOfferingPrices,
  deactivateOffering,
  deleteServiceOffering,
} from '../services/serviceOfferingService';
import type {
  Service,
  ServiceOfferingWithPrices,
  CustomServiceFormData,
  PricingConfigurationData,
  PricingModel,
} from '../types/serviceTypes';

export function useServiceConfiguration(dealerId: string) {
  const [services, setServices] = useState<Service[]>([]);
  const [offerings, setOfferings] = useState<ServiceOfferingWithPrices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [servicesData, offeringsData] = await Promise.all([
        getDetailerAvailableServices(dealerId),
        getDetailerOfferings(dealerId),
      ]);

      setServices(servicesData);
      setOfferings(offeringsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch service configuration');
    } finally {
      setLoading(false);
    }
  }, [dealerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCustomService = useCallback(
    async (serviceData: CustomServiceFormData): Promise<Service> => {
      try {
        const newService = await createCustomService(dealerId, serviceData);
        setServices((prev) => [...prev, newService]);
        return newService;
      } catch (err) {
        throw err;
      }
    },
    [dealerId]
  );

  const handleUpdateCustomService = useCallback(
    async (serviceId: string, serviceData: Partial<CustomServiceFormData>): Promise<Service> => {
      try {
        const updatedService = await updateCustomService(serviceId, dealerId, serviceData);
        setServices((prev) =>
          prev.map((s) => (s.id === serviceId ? updatedService : s))
        );
        return updatedService;
      } catch (err) {
        throw err;
      }
    },
    [dealerId]
  );

  const handleDeleteCustomService = useCallback(
    async (serviceId: string): Promise<void> => {
      try {
        await deleteCustomService(serviceId, dealerId);
        setServices((prev) => prev.filter((s) => s.id !== serviceId));
      } catch (err) {
        throw err;
      }
    },
    [dealerId]
  );

  const handleToggleServiceOffering = useCallback(
    async (serviceId: string, pricingModel: PricingModel = 'single'): Promise<void> => {
      try {
        // Check if offering already exists
        const existingOffering = offerings.find((o) => o.service_id === serviceId);

        if (existingOffering) {
          // Remove offering
          await deleteServiceOffering(existingOffering.id, dealerId);
          setOfferings((prev) => prev.filter((o) => o.id !== existingOffering.id));
        } else {
          // Create offering
          const newOffering = await createServiceOffering(dealerId, serviceId, pricingModel);
          // Fetch full offering with service and prices
          await fetchData();
        }
      } catch (err) {
        throw err;
      }
    },
    [dealerId, offerings, fetchData]
  );

  const handleConfigurePricing = useCallback(
    async (offeringId: string, pricingData: PricingConfigurationData): Promise<void> => {
      try {
        await configurePricing(offeringId, dealerId, pricingData);
        // Refresh offerings to get updated data
        await fetchData();
      } catch (err) {
        throw err;
      }
    },
    [dealerId, fetchData]
  );

  const handleUpdatePrices = useCallback(
    async (
      offeringId: string,
      prices: { vehicle_category_id: string; price: number }[]
    ): Promise<void> => {
      try {
        await updateOfferingPrices(offeringId, dealerId, prices);
        // Refresh offerings to get updated data
        await fetchData();
      } catch (err) {
        throw err;
      }
    },
    [dealerId, fetchData]
  );

  const handleDeactivateOffering = useCallback(
    async (offeringId: string): Promise<void> => {
      try {
        await deactivateOffering(offeringId, dealerId);
        setOfferings((prev) =>
          prev.map((o) => (o.id === offeringId ? { ...o, is_active: false } : o))
        );
      } catch (err) {
        throw err;
      }
    },
    [dealerId]
  );

  return {
    services,
    offerings,
    loading,
    error,
    refresh: fetchData,
    createCustomService: handleCreateCustomService,
    updateCustomService: handleUpdateCustomService,
    deleteCustomService: handleDeleteCustomService,
    toggleServiceOffering: handleToggleServiceOffering,
    configurePricing: handleConfigurePricing,
    updatePrices: handleUpdatePrices,
    deactivateOffering: handleDeactivateOffering,
  };
}
