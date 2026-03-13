// Stripe Connect Account Validation Service
import { supabase } from '../lib/supabaseClient';
import {
  StripeConnectedAccount,
  ApiResponse,
  PaymentError
} from '../types/marketplacePayments';

export class StripeAccountValidationService {
  /**
   * Validate if a Stripe account exists and is active
   */
  static async validateStripeAccount(stripeAccountId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: account, error } = await supabase
        .from('stripe_connected_accounts')
        .select('*')
        .eq('stripe_account_id', stripeAccountId)
        .single();

      if (error || !account) {
        return {
          success: false,
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Stripe Connect account not found',
            type: 'validation'
          }
        };
      }

      // Check if account is active and ready
      const isValid = this.isAccountValid(account);
      
      if (!isValid.valid) {
        return {
          success: false,
          error: {
            code: 'ACCOUNT_NOT_READY',
            message: isValid.reason,
            type: 'validation',
            details: isValid.details
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
          message: 'Failed to validate Stripe account',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Validate if a detailer can receive payouts
   */
  static async validateDetailerForPayouts(detailerId: string): Promise<ApiResponse<StripeConnectedAccount>> {
    try {
      const { data: account, error } = await supabase
        .from('stripe_connected_accounts')
        .select('*')
        .eq('detailer_id', detailerId)
        .single();

      if (error || !account) {
        return {
          success: false,
          error: {
            code: 'NO_CONNECT_ACCOUNT',
            message: 'Detailer does not have a Stripe Connect account',
            type: 'validation'
          }
        };
      }

      const validation = this.isAccountValid(account);
      
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'ACCOUNT_NOT_READY',
            message: validation.reason,
            type: 'validation',
            details: validation.details
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
          code: 'VALIDATION_ERROR',
          message: 'Failed to validate detailer for payouts',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Check if account meets all requirements for receiving payouts
   */
  private static isAccountValid(account: StripeConnectedAccount): {
    valid: boolean;
    reason?: string;
    details?: Record<string, any>;
  } {
    const issues: string[] = [];
    const details: Record<string, any> = {
      account_status: account.account_status,
      capabilities_enabled: account.capabilities_enabled,
      payouts_enabled: account.payouts_enabled,
      onboarding_completed: account.onboarding_completed
    };

    // Check account status
    if (account.account_status !== 'active') {
      issues.push(`Account status is '${account.account_status}' (must be 'active')`);
    }

    // Check capabilities
    if (!account.capabilities_enabled) {
      issues.push('Account capabilities are not enabled');
    }

    // Check payouts
    if (!account.payouts_enabled) {
      issues.push('Payouts are not enabled for this account');
    }

    // Check onboarding
    if (!account.onboarding_completed) {
      issues.push('Account onboarding is not completed');
    }

    if (issues.length > 0) {
      return {
        valid: false,
        reason: `Account validation failed: ${issues.join(', ')}`,
        details
      };
    }

    return { valid: true };
  }

  /**
   * Get account validation status with detailed information
   */
  static async getAccountValidationStatus(detailerId: string): Promise<ApiResponse<{
    hasAccount: boolean;
    isValid: boolean;
    canReceivePayouts: boolean;
    issues: string[];
    account?: StripeConnectedAccount;
  }>> {
    try {
      const { data: account, error } = await supabase
        .from('stripe_connected_accounts')
        .select('*')
        .eq('detailer_id', detailerId)
        .single();

      if (error || !account) {
        return {
          success: true,
          data: {
            hasAccount: false,
            isValid: false,
            canReceivePayouts: false,
            issues: ['No Stripe Connect account found']
          }
        };
      }

      const validation = this.isAccountValid(account);
      const issues: string[] = [];

      if (!validation.valid && validation.reason) {
        issues.push(validation.reason);
      }

      return {
        success: true,
        data: {
          hasAccount: true,
          isValid: validation.valid,
          canReceivePayouts: validation.valid,
          issues,
          account
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to get account validation status',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Validate account before processing a payout
   */
  static async validateAccountForPayout(
    detailerId: string,
    payoutAmount: number
  ): Promise<ApiResponse<{
    account: StripeConnectedAccount;
    canProcessPayout: boolean;
    warnings?: string[];
  }>> {
    try {
      // First validate the account exists and is ready
      const accountResult = await this.validateDetailerForPayouts(detailerId);
      
      if (!accountResult.success || !accountResult.data) {
        return {
          success: false,
          error: accountResult.error
        };
      }

      const account = accountResult.data;
      const warnings: string[] = [];

      // Additional payout-specific validations
      if (payoutAmount <= 0) {
        return {
          success: false,
          error: {
            code: 'INVALID_PAYOUT_AMOUNT',
            message: 'Payout amount must be greater than zero',
            type: 'validation'
          }
        };
      }

      // Check for minimum payout amount (Stripe minimum is $1.00)
      if (payoutAmount < 100) { // 100 cents = $1.00
        warnings.push('Payout amount is below recommended minimum of $1.00');
      }

      // Check account age (warn if very new)
      const accountAge = Date.now() - new Date(account.created_at).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      if (accountAge < oneDayMs) {
        warnings.push('Account is less than 24 hours old - payouts may be delayed');
      }

      return {
        success: true,
        data: {
          account,
          canProcessPayout: true,
          warnings: warnings.length > 0 ? warnings : undefined
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PAYOUT_VALIDATION_ERROR',
          message: 'Failed to validate account for payout',
          type: 'validation',
          details: error
        }
      };
    }
  }

  /**
   * Check if account needs attention (for dashboard warnings)
   */
  static async getAccountHealthCheck(detailerId: string): Promise<ApiResponse<{
    status: 'healthy' | 'warning' | 'error';
    message: string;
    actionRequired?: string;
    account?: StripeConnectedAccount;
  }>> {
    try {
      const validationResult = await this.getAccountValidationStatus(detailerId);
      
      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error
        };
      }

      const { hasAccount, isValid, issues, account } = validationResult.data;

      if (!hasAccount) {
        return {
          success: true,
          data: {
            status: 'error',
            message: 'No Stripe Connect account found',
            actionRequired: 'Create a Stripe Connect account to receive payments'
          }
        };
      }

      if (!isValid) {
        return {
          success: true,
          data: {
            status: 'error',
            message: issues.join(', '),
            actionRequired: 'Complete your Stripe account setup to receive payments',
            account
          }
        };
      }

      // Account is valid, check for any warnings
      const warnings: string[] = [];
      
      if (account) {
        // Check if account is restricted
        if (account.account_status === 'restricted') {
          warnings.push('Account has restrictions that may affect payouts');
        }

        // Check account age for new account warnings
        const accountAge = Date.now() - new Date(account.created_at).getTime();
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        
        if (accountAge < sevenDaysMs) {
          warnings.push('New account - initial payouts may have longer processing times');
        }
      }

      if (warnings.length > 0) {
        return {
          success: true,
          data: {
            status: 'warning',
            message: warnings.join(', '),
            account
          }
        };
      }

      return {
        success: true,
        data: {
          status: 'healthy',
          message: 'Account is ready to receive payments',
          account
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: 'Failed to perform account health check',
          type: 'validation',
          details: error
        }
      };
    }
  }
}

// Helper functions for account validation
export const accountValidationHelpers = {
  /**
   * Quick check if detailer can receive payouts
   */
  canReceivePayouts: async (detailerId: string): Promise<boolean> => {
    const result = await StripeAccountValidationService.validateDetailerForPayouts(detailerId);
    return result.success;
  },

  /**
   * Get simple account status
   */
  getAccountStatus: async (detailerId: string): Promise<'none' | 'pending' | 'active' | 'restricted' | 'rejected'> => {
    const result = await StripeAccountValidationService.getAccountValidationStatus(detailerId);
    
    if (!result.success || !result.data.hasAccount) {
      return 'none';
    }

    return result.data.account?.account_status || 'pending';
  },

  /**
   * Check if account needs immediate attention
   */
  needsAttention: async (detailerId: string): Promise<boolean> => {
    const result = await StripeAccountValidationService.getAccountHealthCheck(detailerId);
    return result.success && result.data.status === 'error';
  }
};