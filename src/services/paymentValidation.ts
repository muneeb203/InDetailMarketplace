// Payment Validation and Error Handling Service
import { supabase } from '../lib/supabaseClient';
import {
  CreatePaymentRequest,
  PaymentError,
  ApiResponse,
  MarketplaceOrderStatus,
  MARKETPLACE_CONSTANTS,
  isValidMarketplaceStatus
} from '../types/marketplacePayments';
import { StripeAccountValidationService } from './stripeAccountValidation';
import { FeeCalculationService } from './feeCalculation';

export class PaymentValidationService {
  /**
   * Comprehensive payment request validation
   */
  static async validatePaymentRequest(
    request: CreatePaymentRequest
  ): Promise<ApiResponse<{
    isValid: boolean;
    warnings?: string[];
    sanitizedRequest?: CreatePaymentRequest;
  }>> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // 1. Basic field validation
      const fieldValidation = this.validateRequiredFields(request);
      if (!fieldValidation.valid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: fieldValidation.errors.join(', '),
            type: 'validation',
            details: { errors: fieldValidation.errors }
          }
        };
      }

      // 2. Amount validation
      const amountValidation = this.validateAmount(request.amount);
      if (!amountValidation.valid) {
        errors.push(...amountValidation.errors);
      }
      if (amountValidation.warnings) {
        warnings.push(...amountValidation.warnings);
      }

      // 3. Order validation
      const orderValidation = await this.validateOrder(request.order_id);
      if (!orderValidation.success) {
        return orderValidation;
      }
      if (orderValidation.data?.warnings) {
        warnings.push(...orderValidation.data.warnings);
      }

      // 4. Stripe account validation
      const accountValidation = await StripeAccountValidationService.validateStripeAccount(
        request.detailer_stripe_account_id
      );
      if (!accountValidation.success) {
        return {
          success: false,
          error: accountValidation.error
        };
      }

      // 5. Rate limiting check
      const rateLimitValidation = await this.checkRateLimit(request.order_id);
      if (!rateLimitValidation.success) {
        return rateLimitValidation;
      }

      // 6. Duplicate payment check
      const duplicateCheck = await this.checkDuplicatePayment(request.order_id);
      if (!duplicateCheck.success) {
        return duplicateCheck;
      }

      if (errors.length > 0) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: errors.join(', '),
            type: 'validation',
            details: { errors, warnings }
          }
        };
      }

      // Sanitize the request
      const sanitizedRequest = this.sanitizePaymentRequest(request);

      return {
        success: true,
        data: {
          isValid: true,
          warnings: warnings.length > 0 ? warnings : undefined,
          sanitizedRequest
        }
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
   * Validate required fields
   */
  private static validateRequiredFields(request: CreatePaymentRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.order_id) {
      errors.push('Order ID is required');
    }

    if (request.amount === undefined || request.amount === null) {
      errors.push('Payment amount is required');
    }

    if (!request.detailer_stripe_account_id) {
      errors.push('Detailer Stripe account ID is required');
    }

    // Validate UUID format for order_id
    if (request.order_id && !this.isValidUUID(request.order_id)) {
      errors.push('Order ID must be a valid UUID');
    }

    // Validate Stripe account ID format
    if (request.detailer_stripe_account_id && !request.detailer_stripe_account_id.startsWith('acct_')) {
      errors.push('Invalid Stripe account ID format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate payment amount
   */
  private static validateAmount(amount: number): {
    valid: boolean;
    errors: string[];
    warnings?: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if amount is a number
    if (typeof amount !== 'number' || isNaN(amount)) {
      errors.push('Payment amount must be a valid number');
      return { valid: false, errors };
    }

    // Check if amount is positive
    if (amount <= 0) {
      errors.push('Payment amount must be greater than zero');
    }

    // Check minimum amount (Stripe minimum is $0.50)
    if (amount < 50) {
      errors.push('Payment amount must be at least $0.50');
    }

    // Check maximum amount
    if (amount > 100000000) { // $1,000,000
      errors.push('Payment amount exceeds maximum limit of $1,000,000');
    }

    // Check if amount is an integer (cents)
    if (amount % 1 !== 0) {
      errors.push('Payment amount must be specified in cents (whole number)');
    }

    // Warnings for unusual amounts
    if (amount < 100) { // Less than $1.00
      warnings.push('Payment amount is below $1.00 - consider minimum service fees');
    }

    if (amount > 10000000) { // More than $100,000
      warnings.push('Large payment amount - ensure this is correct');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Validate order exists and is in correct state
   */
  private static async validateOrder(orderId: string): Promise<ApiResponse<{
    order: any;
    warnings?: string[];
  }>> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
            type: 'authorization'
          }
        };
      }

      // Fetch order with related data
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          id,
          client_id,
          dealer_id,
          marketplace_status,
          amount_total,
          created_at,
          updated_at
        `)
        .eq('id', orderId)
        .single();

      if (error || !order) {
        return {
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: 'Order not found',
            type: 'validation'
          }
        };
      }

      // Check if user is the client
      if (order.client_id !== user.id) {
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
      if (!isValidMarketplaceStatus(order.marketplace_status)) {
        return {
          success: false,
          error: {
            code: 'INVALID_ORDER_STATUS',
            message: `Invalid order status: ${order.marketplace_status}`,
            type: 'validation'
          }
        };
      }

      if (order.marketplace_status !== 'pending_payment') {
        return {
          success: false,
          error: {
            code: 'ORDER_NOT_READY',
            message: `Order status is '${order.marketplace_status}', expected 'pending_payment'`,
            type: 'validation'
          }
        };
      }

      const warnings: string[] = [];

      // Check if order is old
      const orderAge = Date.now() - new Date(order.created_at).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      if (orderAge > oneDayMs) {
        warnings.push('Order is more than 24 hours old');
      }

      return {
        success: true,
        data: {
          order,
          warnings: warnings.length > 0 ? warnings : undefined
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ORDER_VALIDATION_ERROR',
          message: 'Failed to validate order',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Check for rate limiting
   */
  private static async checkRateLimit(orderId: string): Promise<ApiResponse<boolean>> {
    try {
      // Check for recent payment attempts on this order
      const { data: recentAttempts, error } = await supabase
        .from('marketplace_payment_intents')
        .select('created_at')
        .eq('order_id', orderId)
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
        .order('created_at', { ascending: false });

      if (error) {
        // Don't fail validation for rate limit check errors
        return { success: true, data: true };
      }

      if (recentAttempts && recentAttempts.length >= 3) {
        return {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many payment attempts. Please wait before trying again.',
            type: 'validation'
          }
        };
      }

      return { success: true, data: true };
    } catch (error) {
      // Don't fail validation for rate limit check errors
      return { success: true, data: true };
    }
  }

  /**
   * Check for duplicate payments
   */
  private static async checkDuplicatePayment(orderId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: existingPayment, error } = await supabase
        .from('marketplace_payment_intents')
        .select('id, status')
        .eq('order_id', orderId)
        .in('status', ['pending', 'succeeded'])
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        // Don't fail validation for database errors
        return { success: true, data: true };
      }

      if (existingPayment) {
        return {
          success: false,
          error: {
            code: 'DUPLICATE_PAYMENT',
            message: `Payment already exists for this order with status: ${existingPayment.status}`,
            type: 'validation'
          }
        };
      }

      return { success: true, data: true };
    } catch (error) {
      // Don't fail validation for duplicate check errors
      return { success: true, data: true };
    }
  }

  /**
   * Sanitize payment request
   */
  private static sanitizePaymentRequest(request: CreatePaymentRequest): CreatePaymentRequest {
    return {
      order_id: request.order_id.trim(),
      amount: Math.round(request.amount), // Ensure integer
      detailer_stripe_account_id: request.detailer_stripe_account_id.trim(),
      metadata: this.sanitizeMetadata(request.metadata)
    };
  }

  /**
   * Sanitize metadata object
   */
  private static sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> {
    if (!metadata) return {};

    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(metadata)) {
      // Only allow string, number, boolean values
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        // Limit string length
        if (typeof value === 'string' && value.length <= 500) {
          sanitized[key] = value;
        } else if (typeof value !== 'string') {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }

  /**
   * Validate UUID format
   */
  private static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Create standardized payment error
   */
  static createPaymentError(
    code: string,
    message: string,
    type: PaymentError['type'] = 'validation',
    details?: any
  ): PaymentError {
    return {
      code,
      message,
      type,
      details
    };
  }

  /**
   * Handle Stripe API errors
   */
  static handleStripeError(error: any): PaymentError {
    if (error.type === 'StripeCardError') {
      return {
        code: 'CARD_ERROR',
        message: error.message || 'Your card was declined',
        type: 'stripe',
        details: {
          decline_code: error.decline_code,
          param: error.param
        }
      };
    }

    if (error.type === 'StripeInvalidRequestError') {
      return {
        code: 'INVALID_REQUEST',
        message: 'Invalid payment request',
        type: 'stripe',
        details: error
      };
    }

    if (error.type === 'StripeAPIError') {
      return {
        code: 'STRIPE_API_ERROR',
        message: 'Payment service temporarily unavailable',
        type: 'stripe',
        details: error
      };
    }

    if (error.type === 'StripeConnectionError') {
      return {
        code: 'CONNECTION_ERROR',
        message: 'Unable to connect to payment service',
        type: 'network',
        details: error
      };
    }

    return {
      code: 'UNKNOWN_STRIPE_ERROR',
      message: error.message || 'An unknown payment error occurred',
      type: 'stripe',
      details: error
    };
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyErrorMessage(error: PaymentError): string {
    const friendlyMessages: Record<string, string> = {
      'CARD_ERROR': 'Your payment method was declined. Please try a different card.',
      'INVALID_AMOUNT': 'The payment amount is invalid. Please check and try again.',
      'ORDER_NOT_FOUND': 'The order could not be found. Please refresh and try again.',
      'UNAUTHORIZED': 'You are not authorized to make this payment.',
      'ACCOUNT_NOT_READY': 'The service provider is not ready to receive payments yet.',
      'RATE_LIMITED': 'Too many attempts. Please wait a moment before trying again.',
      'DUPLICATE_PAYMENT': 'A payment for this order already exists.',
      'CONNECTION_ERROR': 'Unable to process payment. Please check your connection and try again.',
      'STRIPE_API_ERROR': 'Payment service is temporarily unavailable. Please try again later.'
    };

    return friendlyMessages[error.code] || error.message || 'An unexpected error occurred';
  }
}

// Helper functions for payment validation
export const paymentValidationHelpers = {
  /**
   * Quick amount validation
   */
  isValidAmount: (amount: number): boolean => {
    return typeof amount === 'number' && 
           !isNaN(amount) && 
           amount >= 50 && 
           amount <= 100000000 && 
           amount % 1 === 0;
  },

  /**
   * Format validation error for display
   */
  formatValidationError: (error: PaymentError): string => {
    return PaymentValidationService.getUserFriendlyErrorMessage(error);
  },

  /**
   * Check if error is retryable
   */
  isRetryableError: (error: PaymentError): boolean => {
    const retryableCodes = [
      'CONNECTION_ERROR',
      'STRIPE_API_ERROR',
      'NETWORK_ERROR'
    ];
    return retryableCodes.includes(error.code);
  },

  /**
   * Get retry delay for error
   */
  getRetryDelay: (error: PaymentError, attemptNumber: number): number => {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    
    if (!paymentValidationHelpers.isRetryableError(error)) {
      return 0; // Don't retry
    }

    // Exponential backoff
    const delay = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), maxDelay);
    return delay;
  }
};