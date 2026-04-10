// Marketplace Payments Service - Development Fallback
// This bypasses the Edge Function for development when it's not deployed

import { supabase } from '../lib/supabaseClient';
import { 
  CreatePaymentRequest, 
  CreatePaymentResponse, 
  ApiResponse 
} from '../types/marketplacePayments';
import { FeeCalculationService } from './feeCalculation';

export class MarketplacePaymentServiceFallback {
  /**
   * Development fallback for marketplace payment creation
   * This simulates the payment creation without actually processing payments
   */
  static async createMarketplacePayment(
    request: CreatePaymentRequest
  ): Promise<ApiResponse<CreatePaymentResponse>> {
    try {
      console.log('🔧 Using fallback payment service (Edge Function not available)');
      
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

      // Validate detailer's Stripe account (bypass in development)
      console.log('🔧 Development mode: Bypassing Stripe account validation');
      
      // In development, we'll assume the account is valid if we have an account ID
      if (!request.detailer_stripe_account_id || request.detailer_stripe_account_id.trim() === '') {
        return {
          success: false,
          error: {
            code: 'INVALID_STRIPE_ACCOUNT',
            message: 'Detailer Stripe account ID is required',
            type: 'validation'
          }
        };
      }

      console.log('✅ Development mode: Stripe account validation bypassed for:', request.detailer_stripe_account_id);

      // Calculate payment breakdown
      const breakdown = FeeCalculationService.calculatePaymentBreakdown(request.amount);

      // Create a mock payment intent for development
      const mockPaymentIntentId = `pi_dev_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const mockClientSecret = `${mockPaymentIntentId}_secret_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`;

      console.log('🎭 Creating mock payment intent for development:', {
        payment_intent_id: mockPaymentIntentId,
        amount: request.amount,
        breakdown
      });

      // Store payment intent in our database (with fallback for missing table)
      let paymentIntent;
      try {
        const { data, error: dbError } = await supabase
          .from('marketplace_payment_intents')
          .insert({
            order_id: request.order_id,
            stripe_payment_intent_id: mockPaymentIntentId,
            amount_total: request.amount,
            amount_upfront: breakdown.upfront_amount,
            amount_remaining: breakdown.remaining_amount,
            platform_fee: breakdown.platform_fee,
            status: 'pending',
            metadata: { 
              ...(request.metadata || {}),
              development_mode: true,
              note: 'Mock payment intent for development'
            }
          })
          .select()
          .single();

        if (dbError) {
          throw dbError;
        }
        paymentIntent = data;
        console.log('✅ Payment intent stored in marketplace_payment_intents table');
      } catch (dbError) {
        console.warn('⚠️  marketplace_payment_intents table not found, using mock data:', (dbError as any)?.message || dbError);
        
        // Create mock payment intent data for development
        paymentIntent = {
          id: `mock_${Date.now()}`,
          order_id: request.order_id,
          stripe_payment_intent_id: mockPaymentIntentId,
          amount_total: request.amount,
          amount_upfront: breakdown.upfront_amount,
          amount_remaining: breakdown.remaining_amount,
          platform_fee: breakdown.platform_fee,
          status: 'pending',
          metadata: { 
            development_mode: true,
            note: 'Mock payment intent for development - table not found'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('✅ Using mock payment intent data for development');
      }

      // Update order with payment amounts (with fallback for missing columns)
      try {
        await supabase
          .from('orders')
          .update({
            amount_total: request.amount,
            amount_upfront: breakdown.upfront_amount,
            amount_remaining: breakdown.remaining_amount,
            platform_fee: breakdown.platform_fee
          })
          .eq('id', request.order_id);
        console.log('✅ Order updated with payment amounts');
      } catch (updateError) {
        console.warn('⚠️  Could not update order with payment amounts (columns may not exist):', updateError);
        console.log('✅ Continuing without order payment amount updates');
      }

      console.log('✅ Mock payment intent created successfully');

      return {
        success: true,
        data: {
          payment_intent: paymentIntent,
          client_secret: mockClientSecret,
          requires_action: false
        }
      };
    } catch (error) {
      console.error('Error in fallback payment service:', error);
      return {
        success: false,
        error: {
          code: 'PAYMENT_CREATION_ERROR',
          message: 'Failed to create marketplace payment (fallback)',
          type: 'network',
          details: error as Record<string, any>
        }
      };
    }
  }
}