// Marketplace Payment Processing Service
import { supabase } from '../lib/supabaseClient';
import {
  MarketplacePaymentIntent,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentAmountBreakdown,
  ApiResponse,
  PaymentError,
  MARKETPLACE_CONSTANTS
} from '../types/marketplacePayments';
import { StripeAccountValidationService } from './stripeAccountValidation';

// Supabase Edge Functions base URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const PAYMENT_API_BASE = `${SUPABASE_URL}/functions/v1`;

export class MarketplacePaymentService {
  /**
   * Calculate payment amount breakdown
   */
  static calculatePaymentBreakdown(totalAmountCents: number): PaymentAmountBreakdown {
    const platformFee = this.calculatePlatformFee(totalAmountCents);
    const upfrontAmount = this.calculateUpfrontAmount(totalAmountCents);
    const remainingAmount = totalAmountCents - upfrontAmount;
    
    return {
      total_amount: totalAmountCents,
      upfront_amount: upfrontAmount,
      remaining_amount: remainingAmount,
      platform_fee: platformFee,
      detailer_net_upfront: upfrontAmount,
      detailer_net_remaining: remainingAmount,
      detailer_total_net: upfrontAmount + remainingAmount
    };
  }

  /**
   * Calculate platform fee (2.9% + $0.30)
   */
  static calculatePlatformFee(amountCents: number): number {
    return Math.floor(amountCents * MARKETPLACE_CONSTANTS.PLATFORM_FEE_PERCENTAGE) + 
           MARKETPLACE_CONSTANTS.PLATFORM_FEE_FIXED;
  }

  /**
   * Calculate upfront amount (15%)
   */
  static calculateUpfrontAmount(amountCents: number): number {
    return Math.floor(amountCents * MARKETPLACE_CONSTANTS.UPFRONT_PERCENTAGE);
  }

  /**
   * Calculate remaining amount (85%)
   */
  static calculateRemainingAmount(amountCents: number): number {
    return amountCents - this.calculateUpfrontAmount(amountCents);
  }

  /**
   * Create a marketplace payment intent
   */
  static async createMarketplacePayment(
    request: CreatePaymentRequest
  ): Promise<ApiResponse<CreatePaymentResponse>> {
    try {
      // Validate input
      if (!request.order_id || !request.amount || !request.detailer_stripe_account_id) {
        return {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required fields: order_id, amount, detailer_stripe_account_id',
            type: 'validation'
          }
        };
      }

      if (request.amount <= 0) {
        return {
          success: false,
          error: {
            code: 'INVALID_AMOUNT',
            message: 'Payment amount must be greater than zero',
            type: 'validation'
          }
        };
      }

      // Validate the order exists and user has permission
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, client_id, dealer_id, marketplace_status')
        .eq('id', request.order_id)
        .single();

      if (orderError || !order) {
        return {
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: 'Order not found',
            type: 'validation'
          }
        };
      }

      // Check if user is the client for this order
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== order.client_id) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You are not authorized to create payment for this order',
            type: 'authorization'
          }
        };
      }

      // Check order status
      if (order.marketplace_status !== 'pending_payment') {
        return {
          success: false,
          error: {
            code: 'INVALID_ORDER_STATUS',
            message: `Order status is '${order.marketplace_status}', expected 'pending_payment'`,
            type: 'validation'
          }
        };
      }

      // Validate detailer's Stripe account
      const accountValidation = await StripeAccountValidationService.validateStripeAccount(
        request.detailer_stripe_account_id
      );

      if (!accountValidation.success) {
        return {
          success: false,
          error: accountValidation.error
        };
      }

      // Calculate payment breakdown
      const breakdown = this.calculatePaymentBreakdown(request.amount);

      // Call Supabase Edge Function to create payment intent
      const response = await fetch(`${PAYMENT_API_BASE}/stripe-create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          order_id: request.order_id,
          amount: request.amount,
          detailer_stripe_account_id: request.detailer_stripe_account_id,
          platform_fee: breakdown.platform_fee,
          metadata: {
            ...request.metadata,
            upfront_amount: breakdown.upfront_amount,
            remaining_amount: breakdown.remaining_amount,
            platform: 'InDetailMarketplace'
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'PAYMENT_INTENT_FAILED',
            message: result.error || 'Failed to create payment intent',
            type: 'stripe',
            details: result
          }
        };
      }

      // Store payment intent in our database
      const { data: paymentIntent, error: dbError } = await supabase
        .from('marketplace_payment_intents')
        .insert({
          order_id: request.order_id,
          stripe_payment_intent_id: result.payment_intent_id,
          amount_total: request.amount,
          amount_upfront: breakdown.upfront_amount,
          amount_remaining: breakdown.remaining_amount,
          platform_fee: breakdown.platform_fee,
          status: 'pending',
          metadata: request.metadata || {}
        })
        .select()
        .single();

      if (dbError) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to store payment intent',
            type: 'database',
            details: dbError
          }
        };
      }

      // Update order with payment amounts
      await supabase
        .from('orders')
        .update({
          amount_total: request.amount,
          amount_upfront: breakdown.upfront_amount,
          amount_remaining: breakdown.remaining_amount,
          platform_fee: breakdown.platform_fee
        })
        .eq('id', request.order_id);

      return {
        success: true,
        data: {
          payment_intent: paymentIntent,
          client_secret: result.client_secret,
          requires_action: result.requires_action || false
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PAYMENT_CREATION_ERROR',
          message: 'Failed to create marketplace payment',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Get payment intent by order ID
   */
  static async getPaymentIntent(orderId: string): Promise<ApiResponse<MarketplacePaymentIntent>> {
    try {
      const { data: paymentIntent, error } = await supabase
        .from('marketplace_payment_intents')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error || !paymentIntent) {
        return {
          success: false,
          error: {
            code: 'PAYMENT_INTENT_NOT_FOUND',
            message: 'Payment intent not found for this order',
            type: 'validation'
          }
        };
      }

      return {
        success: true,
        data: paymentIntent
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch payment intent',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Update payment intent status
   */
  static async updatePaymentIntentStatus(
    stripePaymentIntentId: string,
    status: MarketplacePaymentIntent['status'],
    metadata?: Record<string, any>
  ): Promise<ApiResponse<MarketplacePaymentIntent>> {
    try {
      const updateData: any = { status };
      if (metadata) {
        updateData.metadata = metadata;
      }

      const { data: paymentIntent, error } = await supabase
        .from('marketplace_payment_intents')
        .update(updateData)
        .eq('stripe_payment_intent_id', stripePaymentIntentId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update payment intent status',
            type: 'database',
            details: error
          }
        };
      }

      // If payment succeeded, update order status
      if (status === 'succeeded') {
        await supabase
          .from('orders')
          .update({ marketplace_status: 'paid' })
          .eq('id', paymentIntent.order_id);
      }

      return {
        success: true,
        data: paymentIntent
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update payment intent',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Validate payment before processing
   */
  static async validatePaymentRequest(request: CreatePaymentRequest): Promise<ApiResponse<boolean>> {
    try {
      // Basic validation
      if (!request.order_id || !request.amount || !request.detailer_stripe_account_id) {
        return {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Missing required payment fields',
            type: 'validation'
          }
        };
      }

      // Amount validation
      if (request.amount <= 0) {
        return {
          success: false,
          error: {
            code: 'INVALID_AMOUNT',
            message: 'Payment amount must be positive',
            type: 'validation'
          }
        };
      }

      // Check minimum amount (Stripe minimum is $0.50)
      if (request.amount < 50) {
        return {
          success: false,
          error: {
            code: 'AMOUNT_TOO_SMALL',
            message: 'Payment amount must be at least $0.50',
            type: 'validation'
          }
        };
      }

      // Check maximum amount (reasonable limit)
      if (request.amount > 100000000) { // $1,000,000
        return {
          success: false,
          error: {
            code: 'AMOUNT_TOO_LARGE',
            message: 'Payment amount exceeds maximum limit',
            type: 'validation'
          }
        };
      }

      // Validate Stripe account
      const accountValidation = await StripeAccountValidationService.validateStripeAccount(
        request.detailer_stripe_account_id
      );

      if (!accountValidation.success) {
        return accountValidation;
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
          message: 'Payment validation failed',
          type: 'validation',
          details: error
        }
      };
    }
  }

  /**
   * Get payment history for an order
   */
  static async getPaymentHistory(orderId: string): Promise<ApiResponse<{
    payment_intent?: MarketplacePaymentIntent;
    total_amount: number;
    amount_paid: number;
    amount_pending: number;
    status: string;
  }>> {
    try {
      // Get payment intent
      const paymentResult = await this.getPaymentIntent(orderId);
      
      if (!paymentResult.success) {
        return {
          success: true,
          data: {
            total_amount: 0,
            amount_paid: 0,
            amount_pending: 0,
            status: 'no_payment'
          }
        };
      }

      const paymentIntent = paymentResult.data;
      const amountPaid = paymentIntent.status === 'succeeded' ? paymentIntent.amount_total : 0;
      const amountPending = paymentIntent.status === 'pending' ? paymentIntent.amount_total : 0;

      return {
        success: true,
        data: {
          payment_intent: paymentIntent,
          total_amount: paymentIntent.amount_total,
          amount_paid: amountPaid,
          amount_pending: amountPending,
          status: paymentIntent.status
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'HISTORY_ERROR',
          message: 'Failed to get payment history',
          type: 'database',
          details: error
        }
      };
    }
  }
}

// Helper functions for payment processing
export const paymentHelpers = {
  /**
   * Format amount from cents to dollars
   */
  formatAmount: (amountCents: number): string => {
    return (amountCents / 100).toFixed(2);
  },

  /**
   * Convert dollars to cents
   */
  dollarsToCents: (dollars: number): number => {
    return Math.round(dollars * 100);
  },

  /**
   * Get payment status display text
   */
  getStatusDisplay: (status: MarketplacePaymentIntent['status']): string => {
    const statusMap = {
      'pending': 'Payment Pending',
      'succeeded': 'Payment Successful',
      'failed': 'Payment Failed',
      'canceled': 'Payment Canceled'
    };
    return statusMap[status] || status;
  },

  /**
   * Check if payment is complete
   */
  isPaymentComplete: (status: MarketplacePaymentIntent['status']): boolean => {
    return status === 'succeeded';
  },

  /**
   * Check if payment failed
   */
  isPaymentFailed: (status: MarketplacePaymentIntent['status']): boolean => {
    return status === 'failed' || status === 'canceled';
  }
};