// Promo Code Service
import { supabase } from '../lib/supabaseClient';

export interface PromoCode {
  id: string;
  dealer_id: string;
  code: string;
  type: 'public' | 'private';
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expiration_date?: string;
  is_active: boolean;
  usage_count: number;
  max_uses?: number;
  created_at: string;
  updated_at: string;
}

export interface PromoCodeUsage {
  id: string;
  promo_code_id: string;
  order_id?: string;
  client_id: string;
  discount_amount: number;
  used_at: string;
}

export interface CreatePromoCodeData {
  code: string;
  type: 'public' | 'private';
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expiration_date?: string;
  is_active: boolean;
  max_uses?: number;
}

export interface ValidatePromoCodeResult {
  valid: boolean;
  discount_amount: number;
  error_message?: string;
  promo_code_id?: string;
}

export class PromoCodeService {
  /**
   * Get all promo codes for a dealer
   */
  static async getPromoCodesByDealer(dealerId: string): Promise<PromoCode[]> {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('dealer_id', dealerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching promo codes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      return [];
    }
  }

  /**
   * Create a new promo code
   */
  static async createPromoCode(
    dealerId: string, 
    promoData: CreatePromoCodeData
  ): Promise<{ success: boolean; data?: PromoCode; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .insert({
          dealer_id: dealerId,
          ...promoData
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message.includes('duplicate') 
            ? 'A promo code with this name already exists'
            : error.message
        };
      }

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create promo code'
      };
    }
  }

  /**
   * Update an existing promo code
   */
  static async updatePromoCode(
    promoCodeId: string,
    updates: Partial<CreatePromoCodeData>
  ): Promise<{ success: boolean; data?: PromoCode; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', promoCodeId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update promo code'
      };
    }
  }

  /**
   * Delete a promo code
   */
  static async deletePromoCode(promoCodeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', promoCodeId);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete promo code'
      };
    }
  }

  /**
   * Validate a promo code for an order
   */
  static async validatePromoCode(
    code: string,
    dealerId: string,
    clientId: string,
    orderTotal: number
  ): Promise<ValidatePromoCodeResult> {
    try {
      const { data, error } = await supabase
        .rpc('validate_promo_code', {
          p_code: code,
          p_dealer_id: dealerId,
          p_client_id: clientId,
          p_order_total: orderTotal
        });

      if (error) {
        console.warn('Database function validate_promo_code not available, using fallback:', error.message);
        // Fallback to manual validation
        return await this.validatePromoCodeFallback(code, dealerId, clientId, orderTotal);
      }

      // Check if data exists and has the expected structure
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('Invalid response from validate_promo_code, using fallback');
        return await this.validatePromoCodeFallback(code, dealerId, clientId, orderTotal);
      }

      const result = data[0];
      
      // Ensure the result has the expected properties
      if (typeof result !== 'object' || result === null || typeof result.valid !== 'boolean') {
        console.warn('Invalid result structure from validate_promo_code, using fallback');
        return await this.validatePromoCodeFallback(code, dealerId, clientId, orderTotal);
      }

      return {
        valid: result.valid,
        discount_amount: result.discount_amount || 0,
        error_message: result.error_message,
        promo_code_id: result.promo_code_id
      };
    } catch (error) {
      console.error('Error validating promo code:', error);
      // Fallback to manual validation
      return await this.validatePromoCodeFallback(code, dealerId, clientId, orderTotal);
    }
  }

  /**
   * Fallback validation when database function is not available
   */
  private static async validatePromoCodeFallback(
    code: string,
    dealerId: string,
    clientId: string,
    orderTotal: number
  ): Promise<ValidatePromoCodeResult> {
    try {
      // Get the promo code from the database
      const { data: promoCode, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('dealer_id', dealerId)
        .eq('is_active', true)
        .single();

      if (error || !promoCode) {
        return {
          valid: false,
          discount_amount: 0,
          error_message: 'Promo code not found or inactive'
        };
      }

      // Check expiration date
      if (promoCode.expiration_date) {
        const expirationDate = new Date(promoCode.expiration_date);
        const now = new Date();
        if (expirationDate < now) {
          return {
            valid: false,
            discount_amount: 0,
            error_message: 'Promo code has expired'
          };
        }
      }

      // Check usage limits
      if (promoCode.max_uses && promoCode.usage_count >= promoCode.max_uses) {
        return {
          valid: false,
          discount_amount: 0,
          error_message: 'Promo code usage limit reached'
        };
      }

      // Check if client has already used this promo code
      const { data: existingUsage } = await supabase
        .from('promo_code_usage')
        .select('id')
        .eq('promo_code_id', promoCode.id)
        .eq('client_id', clientId)
        .limit(1);

      if (existingUsage && existingUsage.length > 0) {
        return {
          valid: false,
          discount_amount: 0,
          error_message: 'You have already used this promo code'
        };
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (promoCode.discount_type === 'percentage') {
        discountAmount = (orderTotal * promoCode.discount_value) / 100;
      } else if (promoCode.discount_type === 'fixed') {
        discountAmount = Math.min(promoCode.discount_value, orderTotal);
      }

      return {
        valid: true,
        discount_amount: discountAmount,
        promo_code_id: promoCode.id
      };
    } catch (error) {
      console.error('Error in fallback promo code validation:', error);
      return {
        valid: false,
        discount_amount: 0,
        error_message: 'Failed to validate promo code'
      };
    }
  }

  /**
   * Apply a promo code to an order (record usage)
   */
  static async applyPromoCode(
    promoCodeId: string,
    orderId: string,
    clientId: string,
    discountAmount: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('apply_promo_code', {
          p_promo_code_id: promoCodeId,
          p_order_id: orderId,
          p_client_id: clientId,
          p_discount_amount: discountAmount
        });

      if (error) {
        console.warn('Database function apply_promo_code not available, using fallback:', error.message);
        return await this.applyPromoCodeFallback(promoCodeId, orderId, clientId, discountAmount);
      }

      if (!data) {
        console.warn('Invalid response from apply_promo_code, using fallback');
        return await this.applyPromoCodeFallback(promoCodeId, orderId, clientId, discountAmount);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error applying promo code:', error);
      return await this.applyPromoCodeFallback(promoCodeId, orderId, clientId, discountAmount);
    }
  }

  /**
   * Fallback for applying promo code when database function is not available
   */
  private static async applyPromoCodeFallback(
    promoCodeId: string,
    orderId: string,
    clientId: string,
    discountAmount: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Insert into promo_code_usage table
      const { error: usageError } = await supabase
        .from('promo_code_usage')
        .insert({
          promo_code_id: promoCodeId,
          order_id: orderId,
          client_id: clientId,
          discount_amount: discountAmount,
          used_at: new Date().toISOString()
        });

      if (usageError) {
        return {
          success: false,
          error: 'Failed to record promo code usage'
        };
      }

      // Update usage count in promo_codes table
      const { error: updateError } = await supabase
        .rpc('increment', {
          table_name: 'promo_codes',
          row_id: promoCodeId,
          column_name: 'usage_count'
        });

      if (updateError) {
        // If the increment function doesn't exist, try manual update
        const { data: currentPromo } = await supabase
          .from('promo_codes')
          .select('usage_count')
          .eq('id', promoCodeId)
          .single();

        if (currentPromo) {
          await supabase
            .from('promo_codes')
            .update({ usage_count: (currentPromo.usage_count || 0) + 1 })
            .eq('id', promoCodeId);
        }
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to apply promo code'
      };
    }
  }

  /**
   * Get promo code usage statistics
   */
  static async getPromoCodeUsage(promoCodeId: string): Promise<PromoCodeUsage[]> {
    try {
      const { data, error } = await supabase
        .from('promo_code_usage')
        .select(`
          *,
          profiles:client_id (
            name,
            email
          )
        `)
        .eq('promo_code_id', promoCodeId)
        .order('used_at', { ascending: false });

      if (error) {
        console.error('Error fetching promo code usage:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching promo code usage:', error);
      return [];
    }
  }

  /**
   * Get active public promo codes for a dealer (for clients to see)
   */
  static async getActivePublicPromoCodes(dealerId: string): Promise<PromoCode[]> {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('dealer_id', dealerId)
        .eq('type', 'public')
        .eq('is_active', true)
        .or('expiration_date.is.null,expiration_date.gt.' + new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching public promo codes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching public promo codes:', error);
      return [];
    }
  }

  /**
   * Toggle promo code active status
   */
  static async togglePromoCodeStatus(
    promoCodeId: string,
    isActive: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', promoCodeId);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update promo code status'
      };
    }
  }
}