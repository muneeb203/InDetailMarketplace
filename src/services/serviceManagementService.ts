import { supabase } from '../lib/supabaseClient';
import type { Service, CustomServiceFormData } from '../types/serviceTypes';

/**
 * Fetch all predefined services from the catalog
 */
export async function getServiceCatalog(): Promise<Service[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_predefined', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching service catalog:', error);
      throw new Error(`Failed to fetch service catalog: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getServiceCatalog:', err);
    throw err;
  }
}

/**
 * Fetch all services available to a detailer (predefined + their custom services)
 */
export async function getDetailerAvailableServices(dealerId: string): Promise<Service[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .or(`is_predefined.eq.true,dealer_id.eq.${dealerId}`)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching detailer available services:', error);
      throw new Error(`Failed to fetch available services: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getDetailerAvailableServices:', err);
    throw err;
  }
}

/**
 * Create a custom service for a detailer
 */
export async function createCustomService(
  dealerId: string,
  serviceData: CustomServiceFormData
): Promise<Service> {
  // Validate inputs
  if (!serviceData.name || serviceData.name.trim().length === 0) {
    throw new Error('Service name is required');
  }
  if (!serviceData.description || serviceData.description.trim().length === 0) {
    throw new Error('Service description is required');
  }
  if (serviceData.name.length > 100) {
    throw new Error('Service name must be 100 characters or less');
  }
  if (serviceData.description.length > 500) {
    throw new Error('Service description must be 500 characters or less');
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .insert({
        name: serviceData.name.trim(),
        description: serviceData.description.trim(),
        is_predefined: false,
        dealer_id: dealerId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating custom service:', error);
      throw new Error(`Failed to create custom service: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in createCustomService:', err);
    throw err;
  }
}

/**
 * Update a custom service
 */
export async function updateCustomService(
  serviceId: string,
  dealerId: string,
  serviceData: Partial<CustomServiceFormData>
): Promise<Service> {
  // Validate inputs if provided
  if (serviceData.name !== undefined) {
    if (serviceData.name.trim().length === 0) {
      throw new Error('Service name cannot be empty');
    }
    if (serviceData.name.length > 100) {
      throw new Error('Service name must be 100 characters or less');
    }
  }
  if (serviceData.description !== undefined) {
    if (serviceData.description.trim().length === 0) {
      throw new Error('Service description cannot be empty');
    }
    if (serviceData.description.length > 500) {
      throw new Error('Service description must be 500 characters or less');
    }
  }

  try {
    const updateData: any = {};
    if (serviceData.name !== undefined) {
      updateData.name = serviceData.name.trim();
    }
    if (serviceData.description !== undefined) {
      updateData.description = serviceData.description.trim();
    }

    const { data, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', serviceId)
      .eq('dealer_id', dealerId)
      .eq('is_predefined', false)
      .select()
      .single();

    if (error) {
      console.error('Error updating custom service:', error);
      throw new Error(`Failed to update custom service: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in updateCustomService:', err);
    throw err;
  }
}

/**
 * Delete a custom service
 */
export async function deleteCustomService(
  serviceId: string,
  dealerId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId)
      .eq('dealer_id', dealerId)
      .eq('is_predefined', false);

    if (error) {
      console.error('Error deleting custom service:', error);
      throw new Error(`Failed to delete custom service: ${error.message}`);
    }
  } catch (err) {
    console.error('Unexpected error in deleteCustomService:', err);
    throw err;
  }
}
