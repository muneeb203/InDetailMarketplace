// Payout Processing Service for Marketplace Payments
import { supabase } from '../lib/supabaseClient';
import {
  PayoutRecord,
  ProcessPayoutRequest,
  ProcessPayoutResponse,
  MarketplaceOrder,
  ApiResponse,
  PaymentError,
  MARKETPLACE_CONSTANTS
} from '../types/marketplacePayments';
import { StripeAccountValidationService } from './stripeAccountValidation';

// Supabase Edge Functions base URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const PAYOUT_API_BASE = `${SUPABASE_URL}/functions/v1`;

export class PayoutProcessingService {
  /**
   * Process upfront payout (15% of total amount)
   */
  static async processUpfrontPayout(
    orderId: string,
    detailerId: string
  ): Promise<ApiResponse<ProcessPayoutResponse>> {
    try {
      // Validate order and get payment details
      const orderValidation = await this.validateOrderForPayout(orderId, detailerId, 'upfront');
      if (!orderValidation.success || !orderValidation.data) {
        return {
          success: false,
          error: orderValidation.error
        };
      }

      const { order, paymentIntent, stripeAccount } = orderValidation.data;

      // Check if upfront payout already exists
      const existingPayout = await this.getExistingPayout(orderId, 'upfront');
      if (existingPayout.success && existingPayout.data) {
        return {
          success: false,
          error: {
            code: 'PAYOUT_ALREADY_EXISTS',
            message: 'Upfront payout has already been processed for this order',
            type: 'validation'
          }
        };
      }

      // Validate detailer account for payouts
      const accountValidation = await StripeAccountValidationService.validateAccountForPayout(
        detailerId,
        order.amount_upfront
      );
      if (!accountValidation.success) {
        return {
          success: false,
          error: accountValidation.error
        };
      }

      // Process the transfer via Stripe
      const transferResult = await this.processStripeTransfer({
        order_id: orderId,
        payout_type: 'upfront',
        amount: order.amount_upfront,
        detailer_stripe_account_id: stripeAccount.stripe_account_id,
        metadata: {
          order_id: orderId,
          detailer_id: detailerId,
          payout_type: 'upfront',
          percentage: '15%'
        }
      });

      if (!transferResult.success || !transferResult.data) {
        return {
          success: false,
          error: transferResult.error
        };
      }

      // Create payout record
      const { data: payoutRecord, error: dbError } = await supabase
        .from('payout_records')
        .insert({
          order_id: orderId,
          detailer_id: detailerId,
          stripe_transfer_id: transferResult.data.transfer_id,
          amount: order.amount_upfront,
          payout_type: 'upfront',
          status: 'succeeded',
          processed_at: new Date().toISOString(),
          metadata: {
            percentage: 15,
            original_amount: order.amount_total
          }
        })
        .select()
        .single();

      if (dbError) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to record payout',
            type: 'database',
            details: dbError
          }
        };
      }

      // Update order status to indicate upfront payout completed
      await supabase
        .from('orders')
        .update({ marketplace_status: 'in_progress' })
        .eq('id', orderId);

      return {
        success: true,
        data: {
          payout_record: payoutRecord,
          transfer_id: transferResult.data.transfer_id,
          success: true
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPFRONT_PAYOUT_ERROR',
          message: 'Failed to process upfront payout',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Process completion payout (85% of total amount)
   */
  static async processCompletionPayout(
    orderId: string,
    detailerId: string
  ): Promise<ApiResponse<ProcessPayoutResponse>> {
    try {
      // Validate order and get payment details
      const orderValidation = await this.validateOrderForPayout(orderId, detailerId, 'completion');
      if (!orderValidation.success || !orderValidation.data) {
        return {
          success: false,
          error: orderValidation.error
        };
      }

      const { order, paymentIntent, stripeAccount } = orderValidation.data;

      // Check if completion payout already exists
      const existingPayout = await this.getExistingPayout(orderId, 'completion');
      if (existingPayout.success && existingPayout.data) {
        return {
          success: false,
          error: {
            code: 'PAYOUT_ALREADY_EXISTS',
            message: 'Completion payout has already been processed for this order',
            type: 'validation'
          }
        };
      }

      // Ensure upfront payout was completed first
      const upfrontPayout = await this.getExistingPayout(orderId, 'upfront');
      if (!upfrontPayout.success || !upfrontPayout.data || upfrontPayout.data.status !== 'succeeded') {
        return {
          success: false,
          error: {
            code: 'UPFRONT_PAYOUT_REQUIRED',
            message: 'Upfront payout must be completed before processing completion payout',
            type: 'validation'
          }
        };
      }

      // Validate detailer account for payouts
      const accountValidation = await StripeAccountValidationService.validateAccountForPayout(
        detailerId,
        order.amount_remaining
      );
      if (!accountValidation.success) {
        return {
          success: false,
          error: accountValidation.error
        };
      }

      // Process the transfer via Stripe
      const transferResult = await this.processStripeTransfer({
        order_id: orderId,
        payout_type: 'completion',
        amount: order.amount_remaining,
        detailer_stripe_account_id: stripeAccount.stripe_account_id,
        metadata: {
          order_id: orderId,
          detailer_id: detailerId,
          payout_type: 'completion',
          percentage: '85%'
        }
      });

      if (!transferResult.success || !transferResult.data) {
        return {
          success: false,
          error: transferResult.error
        };
      }

      // Create payout record
      const { data: payoutRecord, error: dbError } = await supabase
        .from('payout_records')
        .insert({
          order_id: orderId,
          detailer_id: detailerId,
          stripe_transfer_id: transferResult.data.transfer_id,
          amount: order.amount_remaining,
          payout_type: 'completion',
          status: 'succeeded',
          processed_at: new Date().toISOString(),
          metadata: {
            percentage: 85,
            original_amount: order.amount_total
          }
        })
        .select()
        .single();

      if (dbError) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to record payout',
            type: 'database',
            details: dbError
          }
        };
      }

      // Update order status to completed
      await supabase
        .from('orders')
        .update({ 
          marketplace_status: 'completed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', orderId);

      return {
        success: true,
        data: {
          payout_record: payoutRecord,
          transfer_id: transferResult.data.transfer_id,
          success: true
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'COMPLETION_PAYOUT_ERROR',
          message: 'Failed to process completion payout',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Validate order for payout processing
   */
  private static async validateOrderForPayout(
    orderId: string,
    detailerId: string,
    payoutType: 'upfront' | 'completion'
  ): Promise<ApiResponse<{
    order: MarketplaceOrder;
    paymentIntent: any;
    stripeAccount: any;
  }>> {
    try {
      // Get order with payment details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          marketplace_payment_intents (*)
        `)
        .eq('id', orderId)
        .eq('dealer_id', detailerId)
        .single();

      if (orderError || !order) {
        return {
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: 'Order not found or you are not authorized to process payouts for this order',
            type: 'validation'
          }
        };
      }

      // Check if payment was successful
      const paymentIntent = order.marketplace_payment_intents?.[0];
      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        return {
          success: false,
          error: {
            code: 'PAYMENT_NOT_COMPLETED',
            message: 'Payment must be completed before processing payouts',
            type: 'validation'
          }
        };
      }

      // Validate order status for payout type
      const validStatuses = payoutType === 'upfront' 
        ? ['detailer_accepted'] 
        : ['client_confirmed', 'auto_confirmed'];

      if (!validStatuses.includes(order.marketplace_status)) {
        return {
          success: false,
          error: {
            code: 'INVALID_ORDER_STATUS',
            message: `Order status '${order.marketplace_status}' is not valid for ${payoutType} payout`,
            type: 'validation'
          }
        };
      }

      // Get detailer's Stripe account
      const { data: stripeAccount, error: accountError } = await supabase
        .from('stripe_connected_accounts')
        .select('*')
        .eq('detailer_id', detailerId)
        .single();

      if (accountError || !stripeAccount) {
        return {
          success: false,
          error: {
            code: 'STRIPE_ACCOUNT_NOT_FOUND',
            message: 'Detailer Stripe account not found',
            type: 'validation'
          }
        };
      }

      return {
        success: true,
        data: {
          order,
          paymentIntent,
          stripeAccount
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to validate order for payout',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Process Stripe transfer
   */
  private static async processStripeTransfer(
    request: ProcessPayoutRequest
  ): Promise<ApiResponse<{ transfer_id: string }>> {
    try {
      const response = await fetch(`${PAYOUT_API_BASE}/stripe-process-transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(request)
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'STRIPE_TRANSFER_FAILED',
            message: result.error || 'Failed to process Stripe transfer',
            type: 'stripe',
            details: result
          }
        };
      }

      return {
        success: true,
        data: {
          transfer_id: result.transfer_id
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TRANSFER_ERROR',
          message: 'Failed to process transfer',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Get existing payout record
   */
  private static async getExistingPayout(
    orderId: string,
    payoutType: 'upfront' | 'completion'
  ): Promise<ApiResponse<PayoutRecord | null>> {
    try {
      const { data: payout, error } = await supabase
        .from('payout_records')
        .select('*')
        .eq('order_id', orderId)
        .eq('payout_type', payoutType)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to check existing payout',
            type: 'database',
            details: error
          }
        };
      }

      return {
        success: true,
        data: payout || null
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to check existing payout',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Get all payouts for an order
   */
  static async getOrderPayouts(orderId: string): Promise<ApiResponse<PayoutRecord[]>> {
    try {
      const { data: payouts, error } = await supabase
        .from('payout_records')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch order payouts',
            type: 'database',
            details: error
          }
        };
      }

      return {
        success: true,
        data: payouts || []
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch order payouts',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Get detailer's payout history
   */
  static async getDetailerPayouts(
    detailerId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<{
    payouts: PayoutRecord[];
    total_count: number;
    total_amount: number;
  }>> {
    try {
      // Get payouts with count
      const { data: payouts, error, count } = await supabase
        .from('payout_records')
        .select('*', { count: 'exact' })
        .eq('detailer_id', detailerId)
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch detailer payouts',
            type: 'database',
            details: error
          }
        };
      }

      // Calculate total amount
      const totalAmount = payouts?.reduce((sum, payout) => sum + payout.amount, 0) || 0;

      return {
        success: true,
        data: {
          payouts: payouts || [],
          total_count: count || 0,
          total_amount: totalAmount
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch detailer payouts',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Retry failed payout
   */
  static async retryFailedPayout(payoutId: string): Promise<ApiResponse<ProcessPayoutResponse>> {
    try {
      // Get the failed payout record
      const { data: payout, error } = await supabase
        .from('payout_records')
        .select('*')
        .eq('id', payoutId)
        .eq('status', 'failed')
        .single();

      if (error || !payout) {
        return {
          success: false,
          error: {
            code: 'PAYOUT_NOT_FOUND',
            message: 'Failed payout record not found',
            type: 'validation'
          }
        };
      }

      // Process the payout again based on type
      if (payout.payout_type === 'upfront') {
        return await this.processUpfrontPayout(payout.order_id, payout.detailer_id);
      } else {
        return await this.processCompletionPayout(payout.order_id, payout.detailer_id);
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RETRY_ERROR',
          message: 'Failed to retry payout',
          type: 'network',
          details: error
        }
      };
    }
  }
}

// Helper functions for payout processing
export const payoutHelpers = {
  /**
   * Format payout amount for display
   */
  formatPayoutAmount: (amountCents: number): string => {
    return `$${(amountCents / 100).toFixed(2)}`;
  },

  /**
   * Get payout type display name
   */
  getPayoutTypeDisplay: (type: 'upfront' | 'completion'): string => {
    return type === 'upfront' ? 'Upfront Payment (15%)' : 'Completion Payment (85%)';
  },

  /**
   * Check if payout is complete
   */
  isPayoutComplete: (status: PayoutRecord['status']): boolean => {
    return status === 'succeeded';
  },

  /**
   * Get payout status display
   */
  getPayoutStatusDisplay: (status: PayoutRecord['status']): string => {
    const statusMap = {
      'pending': 'Processing',
      'succeeded': 'Completed',
      'failed': 'Failed'
    };
    return statusMap[status] || status;
  },

  /**
   * Calculate total payouts for order
   */
  calculateTotalPayouts: (payouts: PayoutRecord[]): number => {
    return payouts
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount, 0);
  }
};