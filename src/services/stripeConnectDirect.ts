// Temporary direct Stripe Connect implementation
// This bypasses Supabase Edge Functions for development/testing
import { supabase } from '../lib/supabaseClient';
import {
  StripeConnectedAccount,
  ConnectOnboardingFlow,
  ConnectAccountFormData,
  ApiResponse
} from '../types/marketplacePayments';
import { createMockConnectAccount, getMockConnectAccount, updateMockConnectAccount } from '../utils/createTables';

// This is a temporary implementation for development
// In production, you should use Supabase Edge Functions with proper server-side Stripe integration
export class StripeConnectDirectService {
  
  /**
   * Create a mock Connect account for development
   * In production, this should call your Supabase Edge Function
   */
  static async createConnectAccount(
    detailerId: string,
    accountData: ConnectAccountFormData
  ): Promise<ApiResponse<StripeConnectedAccount>> {
    try {
      // For development, create a mock Stripe account ID
      const mockStripeAccountId = `acct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Creating mock Connect account for development:', {
        detailerId,
        accountData,
        mockStripeAccountId
      });

      // Try to store in Supabase first, fallback to localStorage
      try {
        const { data: accountRecord, error: dbError } = await supabase
          .from('stripe_connected_accounts')
          .insert({
            detailer_id: detailerId,
            stripe_account_id: mockStripeAccountId,
            account_status: 'pending',
            capabilities_enabled: false,
            payouts_enabled: false,
            onboarding_completed: false
          })
          .select()
          .single();

        if (dbError) {
          throw new Error('Database not available');
        }

        return {
          success: true,
          data: accountRecord
        };
      } catch (dbError) {
        console.log('Database not available, using localStorage fallback');
        const mockAccount = await createMockConnectAccount(detailerId, accountData);
        if (!mockAccount) {
          throw new Error('Failed to create mock account');
        }
        return {
          success: true,
          data: mockAccount as StripeConnectedAccount
        };
      }
    } catch (error) {
      console.error('Error creating Connect account:', error);
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
   * Get Connect account status
   */
  static async getAccountStatus(detailerId: string): Promise<ApiResponse<StripeConnectedAccount>> {
    try {
      // Try Supabase first, fallback to localStorage
      try {
        const { data: account, error } = await supabase
          .from('stripe_connected_accounts')
          .select('*')
          .eq('detailer_id', detailerId)
          .single();

        if (error && !error.message.includes('No rows')) {
          throw error;
        }

        if (account) {
          return {
            success: true,
            data: account
          };
        }
      } catch (dbError) {
        console.log('Database not available, checking localStorage');
      }

      // Fallback to localStorage
      const mockAccount = getMockConnectAccount(detailerId);
      if (mockAccount) {
        return {
          success: true,
          data: mockAccount as StripeConnectedAccount
        };
      }

      return {
        success: false,
        error: {
          code: 'ACCOUNT_NOT_FOUND',
          message: 'Connect account not found',
          type: 'database'
        }
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
   * Create mock onboarding flow for development
   */
  static async createOnboardingFlow(
    detailerId: string,
    returnUrl: string,
    refreshUrl: string
  ): Promise<ApiResponse<ConnectOnboardingFlow>> {
    try {
      // Get the existing account
      const accountResult = await this.getAccountStatus(detailerId);
      
      if (!accountResult.success || !accountResult.data) {
        return {
          success: false,
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Connect account not found for this detailer',
            type: 'validation'
          }
        };
      }

      const account = accountResult.data;

      // For development, create a mock onboarding URL that simulates the flow
      // Instead of using a real Stripe URL, we'll create a local simulation
      const mockOnboardingUrl = `${window.location.origin}/stripe-connect-simulation?account_id=${account.stripe_account_id}&return_url=${encodeURIComponent(returnUrl)}`;
      
      console.log('Creating mock onboarding flow:', {
        detailerId,
        accountId: account.stripe_account_id,
        mockOnboardingUrl
      });

      return {
        success: true,
        data: {
          account_id: account.stripe_account_id,
          onboarding_url: mockOnboardingUrl,
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
   * Simulate completing onboarding for development
   */
  static async simulateOnboardingComplete(detailerId: string): Promise<ApiResponse<StripeConnectedAccount>> {
    try {
      const updates = {
        account_status: 'active',
        capabilities_enabled: true,
        payouts_enabled: true,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      };

      // Try Supabase first, fallback to localStorage
      try {
        const { data: account, error } = await supabase
          .from('stripe_connected_accounts')
          .update(updates)
          .eq('detailer_id', detailerId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return {
          success: true,
          data: account
        };
      } catch (dbError) {
        console.log('Database not available, updating localStorage');
        const updatedAccount = updateMockConnectAccount(detailerId, updates);
        if (!updatedAccount) {
          throw new Error('Failed to update mock account');
        }
        return {
          success: true,
          data: updatedAccount as StripeConnectedAccount
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to simulate onboarding completion',
          type: 'database',
          details: error
        }
      };
    }
  }
}