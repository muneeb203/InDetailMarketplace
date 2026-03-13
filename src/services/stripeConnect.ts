// Stripe Connect Account Management Service
import { supabase } from '../lib/supabaseClient';
import {
  StripeConnectedAccount,
  ConnectOnboardingFlow,
  ConnectAccountFormData,
  ApiResponse,
  PaymentError
} from '../types/marketplacePayments';

// Stripe Connect API endpoints (Supabase Edge Functions)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const STRIPE_CONNECT_API_BASE = `${SUPABASE_URL}/functions/v1`;

export class StripeConnectService {
  /**
   * Create a new Stripe Connect account for a detailer
   */
  static async createConnectAccount(
    detailerId: string,
    accountData: ConnectAccountFormData
  ): Promise<ApiResponse<StripeConnectedAccount>> {
    try {
      // Call Supabase Edge Function to create Stripe Connect account
      const response = await fetch(`${STRIPE_CONNECT_API_BASE}/stripe-connect-create-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          detailer_id: detailerId,
          ...accountData
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'CONNECT_ACCOUNT_CREATION_FAILED',
            message: result.error || 'Failed to create Connect account',
            type: 'stripe'
          }
        };
      }

      // Store the account data in our database
      const { data: accountRecord, error: dbError } = await supabase
        .from('stripe_connected_accounts')
        .insert({
          detailer_id: detailerId,
          stripe_account_id: result.account_id,
          account_status: 'pending',
          capabilities_enabled: false,
          payouts_enabled: false,
          onboarding_completed: false
        })
        .select()
        .single();

      if (dbError) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to store account data',
            type: 'database',
            details: dbError
          }
        };
      }

      return {
        success: true,
        data: accountRecord
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to create Connect account',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Create onboarding flow for existing Connect account
   */
  static async createOnboardingFlow(
    detailerId: string,
    returnUrl: string,
    refreshUrl: string
  ): Promise<ApiResponse<ConnectOnboardingFlow>> {
    try {
      // Get the existing account
      const { data: account, error: accountError } = await supabase
        .from('stripe_connected_accounts')
        .select('*')
        .eq('detailer_id', detailerId)
        .single();

      if (accountError || !account) {
        return {
          success: false,
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Connect account not found for this detailer',
            type: 'validation'
          }
        };
      }

      // Call Supabase Edge Function to create onboarding link
      const response = await fetch(`${STRIPE_CONNECT_API_BASE}/stripe-connect-onboarding-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          account_id: account.stripe_account_id,
          return_url: returnUrl,
          refresh_url: refreshUrl
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'ONBOARDING_LINK_FAILED',
            message: result.error || 'Failed to create onboarding link',
            type: 'stripe'
          }
        };
      }

      return {
        success: true,
        data: {
          account_id: account.stripe_account_id,
          onboarding_url: result.url,
          return_url: returnUrl,
          refresh_url: refreshUrl
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to create onboarding flow',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Get Connect account status for a detailer
   */
  static async getAccountStatus(detailerId: string): Promise<ApiResponse<StripeConnectedAccount>> {
    try {
      const { data: account, error } = await supabase
        .from('stripe_connected_accounts')
        .select('*')
        .eq('detailer_id', detailerId)
        .single();

      if (error) {
        return {
          success: false,
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Connect account not found',
            type: 'database',
            details: error
          }
        };
      }

      return {
        success: true,
        data: account
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch account status',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Update Connect account status (typically called by webhooks)
   */
  static async updateAccountStatus(
    stripeAccountId: string,
    updates: Partial<StripeConnectedAccount>
  ): Promise<ApiResponse<StripeConnectedAccount>> {
    try {
      const { data: account, error } = await supabase
        .from('stripe_connected_accounts')
        .update(updates)
        .eq('stripe_account_id', stripeAccountId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update account status',
            type: 'database',
            details: error
          }
        };
      }

      return {
        success: true,
        data: account
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to update account status',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Validate if account is ready for payouts
   */
  static async validateAccountForPayouts(detailerId: string): Promise<ApiResponse<boolean>> {
    try {
      const accountResult = await this.getAccountStatus(detailerId);
      
      if (!accountResult.success || !accountResult.data) {
        return {
          success: false,
          error: accountResult.error || {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Account not found',
            type: 'validation'
          }
        };
      }

      const account = accountResult.data;
      const isValid = account.account_status === 'active' && 
                     account.capabilities_enabled && 
                     account.payouts_enabled &&
                     account.onboarding_completed;

      if (!isValid) {
        return {
          success: false,
          error: {
            code: 'ACCOUNT_NOT_READY',
            message: 'Account is not ready for payouts',
            type: 'validation',
            details: {
              account_status: account.account_status,
              capabilities_enabled: account.capabilities_enabled,
              payouts_enabled: account.payouts_enabled,
              onboarding_completed: account.onboarding_completed
            }
          }
        };
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to validate account',
          type: 'validation',
          details: error
        }
      };
    }
  }

  /**
   * Get all Connect accounts (admin function)
   */
  static async getAllAccounts(): Promise<ApiResponse<StripeConnectedAccount[]>> {
    try {
      const { data: accounts, error } = await supabase
        .from('stripe_connected_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch accounts',
            type: 'database',
            details: error
          }
        };
      }

      return {
        success: true,
        data: accounts || []
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch accounts',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Delete Connect account (admin function)
   */
  static async deleteAccount(detailerId: string): Promise<ApiResponse<boolean>> {
    try {
      // First get the account to get the Stripe account ID
      const accountResult = await this.getAccountStatus(detailerId);
      
      if (!accountResult.success || !accountResult.data) {
        return {
          success: false,
          error: accountResult.error || {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Account not found',
            type: 'validation'
          }
        };
      }

      // Call Supabase Edge Function to delete Stripe account
      const response = await fetch(`${STRIPE_CONNECT_API_BASE}/stripe-connect-delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          account_id: accountResult.data.stripe_account_id
        })
      });

      if (!response.ok) {
        const result = await response.json();
        return {
          success: false,
          error: {
            code: 'STRIPE_DELETE_FAILED',
            message: result.error || 'Failed to delete Stripe account',
            type: 'stripe'
          }
        };
      }

      // Delete from our database
      const { error: dbError } = await supabase
        .from('stripe_connected_accounts')
        .delete()
        .eq('detailer_id', detailerId);

      if (dbError) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to delete account record',
            type: 'database',
            details: dbError
          }
        };
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete account',
          type: 'network',
          details: error
        }
      };
    }
  }
}

// Helper functions for Connect account management
export const connectAccountHelpers = {
  /**
   * Check if detailer has a Connect account
   */
  hasConnectAccount: async (detailerId: string): Promise<boolean> => {
    const result = await StripeConnectService.getAccountStatus(detailerId);
    return result.success && !!result.data;
  },

  /**
   * Check if account is fully onboarded
   */
  isAccountOnboarded: async (detailerId: string): Promise<boolean> => {
    const result = await StripeConnectService.getAccountStatus(detailerId);
    return result.success && 
           result.data?.onboarding_completed === true &&
           result.data?.account_status === 'active';
  },

  /**
   * Get account onboarding progress
   */
  getOnboardingProgress: async (detailerId: string): Promise<{
    hasAccount: boolean;
    isOnboarded: boolean;
    canReceivePayouts: boolean;
    status: string;
  }> => {
    const result = await StripeConnectService.getAccountStatus(detailerId);
    
    if (!result.success || !result.data) {
      return {
        hasAccount: false,
        isOnboarded: false,
        canReceivePayouts: false,
        status: 'not_created'
      };
    }

    const account = result.data;
    return {
      hasAccount: true,
      isOnboarded: account.onboarding_completed,
      canReceivePayouts: account.payouts_enabled && account.capabilities_enabled,
      status: account.account_status
    };
  }
};