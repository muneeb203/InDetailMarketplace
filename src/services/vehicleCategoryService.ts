import { supabase } from '../lib/supabaseClient';
import type { VehicleCategory } from '../types/serviceTypes';

/**
 * Fetch all vehicle categories ordered by display_order
 */
export async function getVehicleCategories(): Promise<VehicleCategory[]> {
  try {
    const { data, error } = await supabase
      .from('vehicle_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching vehicle categories:', error);
      throw new Error(`Failed to fetch vehicle categories: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getVehicleCategories:', err);
    throw err;
  }
}

/**
 * Fetch a single vehicle category by ID
 */
export async function getVehicleCategoryById(id: string): Promise<VehicleCategory | null> {
  try {
    const { data, error } = await supabase
      .from('vehicle_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error fetching vehicle category:', error);
      throw new Error(`Failed to fetch vehicle category: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in getVehicleCategoryById:', err);
    throw err;
  }
}
