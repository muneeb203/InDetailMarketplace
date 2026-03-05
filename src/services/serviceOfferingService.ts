import { supabase } from '../lib/supabaseClient';
import type {
  ServiceOffering,
  ServiceOfferingWithPrices,
  ServiceOfferingWithPrice,
  ServicePrice,
  PricingModel,
  PricingConfigurationData,
} from '../types/serviceTypes';

/**
 * Create a service offering for a detailer
 */
export async function createServiceOffering(
  dealerId: string,
  serviceId: string,
  pricingModel: PricingModel = 'single'
): Promise<ServiceOffering> {
  try {
    const { data, error } = await supabase
      .from('service_offerings')
      .insert({
        dealer_id: dealerId,
        service_id: serviceId,
        pricing_model: pricingModel,
        is_active: false, // Inactive until pricing is configured
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating service offering:', error);
      throw new Error(`Failed to create service offering: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in createServiceOffering:', err);
    throw err;
  }
}

/**
 * Get all service offerings for a detailer with prices and service details
 */
export async function getDetailerOfferings(
  dealerId: string
): Promise<ServiceOfferingWithPrices[]> {
  try {
    const { data, error } = await supabase
      .from('service_offerings')
      .select(`
        *,
        service:services(*),
        prices:service_prices(*)
      `)
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching detailer offerings:', error);
      throw new Error(`Failed to fetch service offerings: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getDetailerOfferings:', err);
    throw err;
  }
}

/**
 * Configure pricing for a service offering
 */
export async function configurePricing(
  offeringId: string,
  dealerId: string,
  pricingData: PricingConfigurationData
): Promise<void> {
  // Validate pricing data
  if (pricingData.pricing_model === 'single' && pricingData.prices.length !== 1) {
    throw new Error('Single pricing model requires exactly 1 price');
  }
  if (pricingData.pricing_model === 'multi-tier' && pricingData.prices.length !== 5) {
    throw new Error('Multi-tier pricing model requires exactly 5 prices (one per vehicle category)');
  }

  // Validate all prices are positive
  for (const priceEntry of pricingData.prices) {
    if (priceEntry.price <= 0) {
      throw new Error('All prices must be greater than 0');
    }
  }

  try {
    // First, verify the offering belongs to this dealer
    const { data: offering, error: offeringError } = await supabase
      .from('service_offerings')
      .select('id')
      .eq('id', offeringId)
      .eq('dealer_id', dealerId)
      .single();

    if (offeringError || !offering) {
      throw new Error('Service offering not found or access denied');
    }

    // Update pricing model if changed
    const { error: updateError } = await supabase
      .from('service_offerings')
      .update({ pricing_model: pricingData.pricing_model })
      .eq('id', offeringId);

    if (updateError) {
      throw new Error(`Failed to update pricing model: ${updateError.message}`);
    }

    // Delete existing prices
    const { error: deleteError } = await supabase
      .from('service_prices')
      .delete()
      .eq('service_offering_id', offeringId);

    if (deleteError) {
      throw new Error(`Failed to delete existing prices: ${deleteError.message}`);
    }

    // Insert new prices
    const priceRecords = pricingData.prices.map(p => ({
      service_offering_id: offeringId,
      vehicle_category_id: p.vehicle_category_id,
      price: p.price,
    }));

    const { error: insertError } = await supabase
      .from('service_prices')
      .insert(priceRecords);

    if (insertError) {
      throw new Error(`Failed to insert prices: ${insertError.message}`);
    }

    // The trigger will automatically activate the offering if pricing is complete
  } catch (err) {
    console.error('Unexpected error in configurePricing:', err);
    throw err;
  }
}

/**
 * Update prices for an existing service offering
 */
export async function updateOfferingPrices(
  offeringId: string,
  dealerId: string,
  prices: { vehicle_category_id: string; price: number }[]
): Promise<void> {
  // Validate all prices are positive
  for (const priceEntry of prices) {
    if (priceEntry.price <= 0) {
      throw new Error('All prices must be greater than 0');
    }
  }

  try {
    // Verify the offering belongs to this dealer
    const { data: offering, error: offeringError } = await supabase
      .from('service_offerings')
      .select('id, pricing_model')
      .eq('id', offeringId)
      .eq('dealer_id', dealerId)
      .single();

    if (offeringError || !offering) {
      throw new Error('Service offering not found or access denied');
    }

    // Validate price count matches pricing model
    if (offering.pricing_model === 'single' && prices.length !== 1) {
      throw new Error('Single pricing model requires exactly 1 price');
    }
    if (offering.pricing_model === 'multi-tier' && prices.length !== 5) {
      throw new Error('Multi-tier pricing model requires exactly 5 prices');
    }

    // Update each price
    for (const priceEntry of prices) {
      const { error: updateError } = await supabase
        .from('service_prices')
        .update({ price: priceEntry.price })
        .eq('service_offering_id', offeringId)
        .eq('vehicle_category_id', priceEntry.vehicle_category_id);

      if (updateError) {
        throw new Error(`Failed to update price: ${updateError.message}`);
      }
    }
  } catch (err) {
    console.error('Unexpected error in updateOfferingPrices:', err);
    throw err;
  }
}

/**
 * Get active service offerings for a detailer filtered by vehicle category
 * Returns offerings with the price specific to the selected vehicle category
 */
export async function getActiveOfferings(
  dealerId: string,
  vehicleCategoryId: string
): Promise<ServiceOfferingWithPrice[]> {
  try {
    // Fetch active offerings with service details and prices
    const { data: offerings, error: offeringsError } = await supabase
      .from('service_offerings')
      .select(`
        *,
        service:services(*),
        prices:service_prices(*)
      `)
      .eq('dealer_id', dealerId)
      .eq('is_active', true);

    if (offeringsError) {
      console.error('Error fetching active offerings:', offeringsError);
      throw new Error(`Failed to fetch active offerings: ${offeringsError.message}`);
    }

    if (!offerings) {
      return [];
    }

    // Transform to ServiceOfferingWithPrice format
    const result: ServiceOfferingWithPrice[] = [];

    for (const offering of offerings) {
      let price: number;

      if (offering.pricing_model === 'single') {
        // Single pricing: use the one price for all categories
        price = offering.prices[0]?.price || 0;
      } else {
        // Multi-tier: find price for specific vehicle category
        const categoryPrice = offering.prices.find(
          (p: ServicePrice) => p.vehicle_category_id === vehicleCategoryId
        );
        price = categoryPrice?.price || 0;
      }

      result.push({
        ...offering,
        price,
        vehicle_category_id: vehicleCategoryId,
      });
    }

    return result;
  } catch (err) {
    console.error('Unexpected error in getActiveOfferings:', err);
    throw err;
  }
}

/**
 * Deactivate a service offering
 */
export async function deactivateOffering(
  offeringId: string,
  dealerId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('service_offerings')
      .update({ is_active: false })
      .eq('id', offeringId)
      .eq('dealer_id', dealerId);

    if (error) {
      console.error('Error deactivating offering:', error);
      throw new Error(`Failed to deactivate offering: ${error.message}`);
    }
  } catch (err) {
    console.error('Unexpected error in deactivateOffering:', err);
    throw err;
  }
}

/**
 * Delete a service offering and its prices
 */
export async function deleteServiceOffering(
  offeringId: string,
  dealerId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('service_offerings')
      .delete()
      .eq('id', offeringId)
      .eq('dealer_id', dealerId);

    if (error) {
      console.error('Error deleting offering:', error);
      throw new Error(`Failed to delete offering: ${error.message}`);
    }
  } catch (err) {
    console.error('Unexpected error in deleteServiceOffering:', err);
    throw err;
  }
}
