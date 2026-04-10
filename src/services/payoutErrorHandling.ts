// Payout Error Handling and Retry Logic Service
import { supabase } from '../lib/supabaseClient';
import {
  PayoutRecord,
  ProcessPayoutResponse,
  ApiResponse,
  PaymentError
} from '../types/marketplacePayments';
import { PayoutProcessingService } from './payoutProcessing';

interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000, // 1 second
  maxDelayMs: 30000, // 30 seconds
  backoffMultiplier: 2
};

export class PayoutErrorHandlingService {
  /**
   * Process payout with automatic retry logic
   */
  static async processPayoutWithRetry(
    orderId: string,
    detailerId: string,
    payoutType: 'upfront' | 'completion',
    config: Partial<RetryConfig> = {}
  ): Promise<ApiResponse<ProcessPayoutResponse>> {
    const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastError: PaymentError | undefined;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        // Log retry attempt
        if (attempt > 1) {
          await this.logRetryAttempt(orderId, payoutType, attempt, lastError);
        }

        // Process the payout
        const result = payoutType === 'upfront'
          ? await PayoutProcessingService.processUpfrontPayout(orderId, detailerId)
          : await PayoutProcessingService.processCompletionPayout(orderId, detailerId);

        if (result.success) {
          // Log successful retry if this wasn't the first attempt
          if (attempt > 1) {
            await this.logSuccessfulRetry(orderId, payoutType, attempt);
          }
          return result;
        }

        lastError = result.error;

        // Check if error is retryable
        if (!this.isRetryableError(result.error)) {
          await this.logNonRetryableError(orderId, payoutType, result.error);
          return result;
        }

        // If this is the last attempt, return the error
        if (attempt === retryConfig.maxAttempts) {
          await this.logMaxRetriesExceeded(orderId, payoutType, attempt, result.error);
          return result;
        }

        // Calculate delay for next attempt
        const delay = this.calculateRetryDelay(attempt, retryConfig);
        await this.sleep(delay);

      } catch (error) {
        lastError = {
          code: 'RETRY_PROCESSING_ERROR',
          message: 'Error during retry processing',
          type: 'network',
          details: error
        };

        if (attempt === retryConfig.maxAttempts) {
          return {
            success: false,
            error: lastError
          };
        }

        const delay = this.calculateRetryDelay(attempt, retryConfig);
        await this.sleep(delay);
      }
    }

    return {
      success: false,
      error: lastError || {
        code: 'MAX_RETRIES_EXCEEDED',
        message: 'Maximum retry attempts exceeded',
        type: 'validation'
      }
    };
  }

  /**
   * Handle failed payout and determine next action
   */
  static async handleFailedPayout(
    payoutId: string,
    error: PaymentError
  ): Promise<ApiResponse<{
    action: 'retry' | 'manual_review' | 'cancel';
    reason: string;
    canAutoRetry: boolean;
    suggestedDelay?: number;
  }>> {
    try {
      // Get payout record
      const { data: payout, error: dbError } = await supabase
        .from('payout_records')
        .select('*')
        .eq('id', payoutId)
        .single();

      if (dbError || !payout) {
        return {
          success: false,
          error: {
            code: 'PAYOUT_NOT_FOUND',
            message: 'Payout record not found',
            type: 'validation'
          }
        };
      }

      // Update payout status to failed
      await supabase
        .from('payout_records')
        .update({
          status: 'failed',
          metadata: {
            ...payout.metadata,
            error_code: error.code,
            error_message: error.message,
            failed_at: new Date().toISOString()
          }
        })
        .eq('id', payoutId);

      // Determine action based on error type
      const action = this.determineFailureAction(error);
      const canAutoRetry = this.isRetryableError(error);
      const suggestedDelay = canAutoRetry ? this.calculateRetryDelay(1, DEFAULT_RETRY_CONFIG) : undefined;

      return {
        success: true,
        data: {
          action: action.action,
          reason: action.reason,
          canAutoRetry,
          suggestedDelay
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ERROR_HANDLING_FAILED',
          message: 'Failed to handle payout error',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Get failed payouts that can be retried
   */
  static async getRetryableFailedPayouts(): Promise<ApiResponse<PayoutRecord[]>> {
    try {
      const { data: payouts, error } = await supabase
        .from('payout_records')
        .select('*')
        .eq('status', 'failed')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch failed payouts',
            type: 'database',
            details: error
          }
        };
      }

      // Filter for retryable payouts
      const retryablePayouts = (payouts || []).filter(payout => {
        const errorCode = payout.metadata?.error_code;
        if (!errorCode) return true; // If no error code, assume retryable

        const mockError: PaymentError = {
          code: errorCode,
          message: payout.metadata?.error_message || '',
          type: 'stripe'
        };

        return this.isRetryableError(mockError);
      });

      return {
        success: true,
        data: retryablePayouts
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch retryable payouts',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Bulk retry failed payouts
   */
  static async bulkRetryFailedPayouts(
    payoutIds: string[]
  ): Promise<ApiResponse<{
    successful: number;
    failed: number;
    results: Array<{
      payoutId: string;
      success: boolean;
      error?: PaymentError;
    }>;
  }>> {
    const results: Array<{
      payoutId: string;
      success: boolean;
      error?: PaymentError;
    }> = [];

    let successful = 0;
    let failed = 0;

    for (const payoutId of payoutIds) {
      try {
        const retryResult = await PayoutProcessingService.retryFailedPayout(payoutId);
        
        if (retryResult.success) {
          successful++;
          results.push({ payoutId, success: true });
        } else {
          failed++;
          results.push({ 
            payoutId, 
            success: false, 
            error: retryResult.error 
          });
        }

        // Add small delay between retries to avoid rate limiting
        await this.sleep(500);
      } catch (error) {
        failed++;
        results.push({
          payoutId,
          success: false,
          error: {
            code: 'RETRY_ERROR',
            message: 'Failed to retry payout',
            type: 'network',
            details: error
          }
        });
      }
    }

    return {
      success: true,
      data: {
        successful,
        failed,
        results
      }
    };
  }

  /**
   * Check if error is retryable
   */
  private static isRetryableError(error?: PaymentError): boolean {
    if (!error) return false;

    const retryableCodes = [
      'STRIPE_API_ERROR',
      'CONNECTION_ERROR',
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'RATE_LIMITED',
      'TEMPORARY_FAILURE'
    ];

    const nonRetryableCodes = [
      'ACCOUNT_NOT_READY',
      'INSUFFICIENT_FUNDS',
      'INVALID_ACCOUNT',
      'PAYOUT_ALREADY_EXISTS',
      'UNAUTHORIZED',
      'VALIDATION_FAILED'
    ];

    // Explicitly non-retryable
    if (nonRetryableCodes.includes(error.code)) {
      return false;
    }

    // Explicitly retryable
    if (retryableCodes.includes(error.code)) {
      return true;
    }

    // Default based on error type
    return error.type === 'network' || error.type === 'stripe';
  }

  /**
   * Determine action for failed payout
   */
  private static determineFailureAction(error: PaymentError): {
    action: 'retry' | 'manual_review' | 'cancel';
    reason: string;
  } {
    // Account-related issues need manual review
    if (['ACCOUNT_NOT_READY', 'INVALID_ACCOUNT', 'ACCOUNT_RESTRICTED'].includes(error.code)) {
      return {
        action: 'manual_review',
        reason: 'Detailer account needs attention before payouts can be processed'
      };
    }

    // Validation errors usually can't be retried
    if (error.type === 'validation') {
      return {
        action: 'cancel',
        reason: 'Validation error - payout cannot be processed'
      };
    }

    // Network/API errors can be retried
    if (this.isRetryableError(error)) {
      return {
        action: 'retry',
        reason: 'Temporary error - payout can be retried'
      };
    }

    // Default to manual review for unknown errors
    return {
      action: 'manual_review',
      reason: 'Unknown error - requires manual investigation'
    };
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private static calculateRetryDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelayMs);
  }

  /**
   * Sleep for specified milliseconds
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log retry attempt
   */
  private static async logRetryAttempt(
    orderId: string,
    payoutType: string,
    attempt: number,
    error?: PaymentError
  ): Promise<void> {
    try {
      console.log(`Retrying ${payoutType} payout for order ${orderId}, attempt ${attempt}`, {
        orderId,
        payoutType,
        attempt,
        error: error?.code
      });
    } catch (e) {
      // Ignore logging errors
    }
  }

  /**
   * Log successful retry
   */
  private static async logSuccessfulRetry(
    orderId: string,
    payoutType: string,
    attempt: number
  ): Promise<void> {
    try {
      console.log(`Successfully retried ${payoutType} payout for order ${orderId} on attempt ${attempt}`);
    } catch (e) {
      // Ignore logging errors
    }
  }

  /**
   * Log non-retryable error
   */
  private static async logNonRetryableError(
    orderId: string,
    payoutType: string,
    error: PaymentError
  ): Promise<void> {
    try {
      console.error(`Non-retryable error for ${payoutType} payout on order ${orderId}:`, error);
    } catch (e) {
      // Ignore logging errors
    }
  }

  /**
   * Log max retries exceeded
   */
  private static async logMaxRetriesExceeded(
    orderId: string,
    payoutType: string,
    attempts: number,
    error: PaymentError
  ): Promise<void> {
    try {
      console.error(`Max retries (${attempts}) exceeded for ${payoutType} payout on order ${orderId}:`, error);
    } catch (e) {
      // Ignore logging errors
    }
  }
}

// Helper functions for error handling
export const payoutErrorHelpers = {
  /**
   * Get user-friendly error message
   */
  getUserFriendlyErrorMessage: (error: PaymentError): string => {
    const friendlyMessages: Record<string, string> = {
      'ACCOUNT_NOT_READY': 'The service provider needs to complete their account setup before receiving payments.',
      'INSUFFICIENT_FUNDS': 'Insufficient funds available for payout.',
      'INVALID_ACCOUNT': 'Invalid payment account. Please contact support.',
      'STRIPE_API_ERROR': 'Payment service temporarily unavailable. We\'ll retry automatically.',
      'CONNECTION_ERROR': 'Connection issue. We\'ll retry automatically.',
      'RATE_LIMITED': 'Too many requests. We\'ll retry shortly.',
      'PAYOUT_ALREADY_EXISTS': 'This payout has already been processed.',
      'MAX_RETRIES_EXCEEDED': 'Unable to process payout after multiple attempts. Please contact support.'
    };

    return friendlyMessages[error.code] || error.message || 'An unexpected error occurred';
  },

  /**
   * Check if error requires user action
   */
  requiresUserAction: (error: PaymentError): boolean => {
    const userActionCodes = [
      'ACCOUNT_NOT_READY',
      'INVALID_ACCOUNT',
      'UNAUTHORIZED'
    ];
    return userActionCodes.includes(error.code);
  },

  /**
   * Get recommended action for error
   */
  getRecommendedAction: (error: PaymentError): string => {
    const actionMap: Record<string, string> = {
      'ACCOUNT_NOT_READY': 'Complete your Stripe account setup',
      'INVALID_ACCOUNT': 'Contact support to verify your account',
      'UNAUTHORIZED': 'Check your account permissions',
      'STRIPE_API_ERROR': 'Wait for automatic retry',
      'CONNECTION_ERROR': 'Check your internet connection',
      'RATE_LIMITED': 'Wait before trying again'
    };

    return actionMap[error.code] || 'Contact support if the issue persists';
  },

  /**
   * Format error for display
   */
  formatErrorForDisplay: (error: PaymentError): {
    title: string;
    message: string;
    action?: string;
    severity: 'error' | 'warning' | 'info';
  } => {
    const isRetryable = PayoutErrorHandlingService['isRetryableError'](error);
    
    return {
      title: isRetryable ? 'Temporary Issue' : 'Payout Error',
      message: payoutErrorHelpers.getUserFriendlyErrorMessage(error),
      action: payoutErrorHelpers.getRecommendedAction(error),
      severity: isRetryable ? 'warning' : 'error'
    };
  }
};