// Promotion Service - Fetch promotion banners for detailers
import { supabase } from '../lib/supabaseClient';

export interface PromotionBanner {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

export class PromotionService {
  /**
   * Get active promotion banner for a detailer
   */
  static async getPromotionBanner(dealerId: string): Promise<PromotionBanner | null> {
    try {
      const { data, error } = await supabase
        .from('dealer_profiles')
        .select('promo')
        .eq('id', dealerId)
        .single();

      if (error || !data?.promo) {
        return null;
      }

      const promo = data.promo as PromotionBanner;
      
      // Check if promotion is active and not expired
      if (!promo.active) {
        return null;
      }

      // Check if promotion has expired
      if (promo.endDate) {
        const endDate = new Date(promo.endDate);
        const now = new Date();
        if (endDate < now) {
          return null;
        }
      }

      // Check if promotion hasn't started yet
      if (promo.startDate) {
        const startDate = new Date(promo.startDate);
        const now = new Date();
        if (startDate > now) {
          return null;
        }
      }

      return promo;
    } catch (error) {
      console.error('Error fetching promotion banner:', error);
      return null;
    }
  }

  /**
   * Check if a detailer has any active promotions
   */
  static async hasActivePromotion(dealerId: string): Promise<boolean> {
    const banner = await this.getPromotionBanner(dealerId);
    return banner !== null;
  }
}