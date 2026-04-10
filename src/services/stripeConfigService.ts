import { supabase } from '../lib/supabaseClient';

export interface StripeConfig {
  id?: string;
  publishable_key?: string;
  secret_key_encrypted?: string;
  webhook_secret_encrypted?: string;
  is_live_mode: boolean;
  account_id?: string;
  account_name?: string;
  setup_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StripeConfigInput {
  publishable_key: string;
  secret_key: string;
  webhook_secret?: string;
  is_live_mode: boolean;
  account_name?: string;
}

class StripeConfigService {
  async getConfig(): Promise<StripeConfig | null> {
    try {
      const { data, error } = await supabase
        .from('stripe_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error:', error);
        // If it's a permission error, try to create a default config
        if (error.code === 'PGRST301' || error.message.includes('permission')) {
          return await this.createDefaultConfig();
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching Stripe config:', error);
      return null;
    }
  }

  private async createDefaultConfig(): Promise<StripeConfig | null> {
    try {
      const { data, error } = await supabase
        .from('stripe_config')
        .insert([{ setup_completed: false }])
        .select()
        .single();

      if (error) {
        console.error('Error creating default config:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating default config:', error);
      return null;
    }
  }

  async updateConfig(config: StripeConfigInput): Promise<boolean> {
    try {
      // Simple encryption (in production, use proper encryption)
      const encryptedSecretKey = btoa(config.secret_key);
      const encryptedWebhookSecret = config.webhook_secret ? btoa(config.webhook_secret) : null;

      const updateData = {
        publishable_key: config.publishable_key,
        secret_key_encrypted: encryptedSecretKey,
        webhook_secret_encrypted: encryptedWebhookSecret,
        is_live_mode: config.is_live_mode,
        account_name: config.account_name || 'Main Account',
        setup_completed: true,
        updated_at: new Date().toISOString()
      };

      // Check if config exists
      const existingConfig = await this.getConfig();
      
      let result;
      if (existingConfig?.id) {
        // Update existing
        result = await supabase
          .from('stripe_config')
          .update(updateData)
          .eq('id', existingConfig.id);
      } else {
        // Insert new
        result = await supabase
          .from('stripe_config')
          .insert([updateData]);
      }

      if (result.error) {
        throw result.error;
      }

      return true;
    } catch (error) {
      console.error('Error updating Stripe config:', error);
      return false;
    }
  }

  async validateKeys(publishableKey: string, secretKey: string): Promise<{ valid: boolean; error?: string }> {
    try {
      // Basic validation
      if (!publishableKey.startsWith('pk_')) {
        return { valid: false, error: 'Invalid publishable key format' };
      }

      if (!secretKey.startsWith('sk_')) {
        return { valid: false, error: 'Invalid secret key format' };
      }

      // Check if keys match (test vs live)
      const pubKeyMode = publishableKey.includes('test') ? 'test' : 'live';
      const secretKeyMode = secretKey.includes('test') ? 'test' : 'live';

      if (pubKeyMode !== secretKeyMode) {
        return { valid: false, error: 'Publishable key and secret key must be from the same mode (test or live)' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Error validating keys' };
    }
  }

  async testConnection(publishableKey: string, secretKey: string): Promise<{ success: boolean; accountInfo?: any; error?: string }> {
    try {
      // This would typically make a test API call to Stripe
      // For now, we'll just validate the format
      const validation = await this.validateKeys(publishableKey, secretKey);
      
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Mock account info (in production, fetch from Stripe API)
      const accountInfo = {
        id: 'acct_' + Math.random().toString(36).substr(2, 16),
        business_profile: {
          name: 'Test Business'
        },
        country: 'US',
        default_currency: 'usd'
      };

      return { success: true, accountInfo };
    } catch (error) {
      return { success: false, error: 'Failed to test connection' };
    }
  }

  getDecryptedSecretKey(encryptedKey: string): string {
    try {
      return atob(encryptedKey);
    } catch {
      return '';
    }
  }
}

export const stripeConfigService = new StripeConfigService();