// Job Completion and Client Confirmation Service
import { supabase } from '../lib/supabaseClient';
import {
  JobCompletionRequest,
  ClientConfirmationRequest,
  MarketplaceOrder,
  ApiResponse,
  PaymentError,
  MARKETPLACE_CONSTANTS
} from '../types/marketplacePayments';
import { PayoutProcessingService } from './payoutProcessing';

export class JobCompletionService {
  /**
   * Mark job as completed by detailer
   */
  static async processJobCompletion(
    request: JobCompletionRequest
  ): Promise<ApiResponse<{
    order: MarketplaceOrder;
    confirmationDeadline: string;
    autoReleaseScheduled: boolean;
  }>> {
    try {
      // Validate request
      if (!request.order_id || !request.detailer_id) {
        return {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Order ID and detailer ID are required',
            type: 'validation'
          }
        };
      }

      // Get current user and verify authorization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== request.detailer_id) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You are not authorized to mark this job as completed',
            type: 'authorization'
          }
        };
      }

      // Get order and validate status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', request.order_id)
        .eq('dealer_id', request.detailer_id)
        .single();

      if (orderError || !order) {
        return {
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: 'Order not found or you are not authorized to access it',
            type: 'validation'
          }
        };
      }

      // Validate order status
      if (order.marketplace_status !== 'in_progress') {
        return {
          success: false,
          error: {
            code: 'INVALID_ORDER_STATUS',
            message: `Order status is '${order.marketplace_status}', expected 'in_progress'`,
            type: 'validation'
          }
        };
      }

      // Calculate confirmation deadline (48 hours from now)
      const confirmationDeadline = new Date(
        Date.now() + MARKETPLACE_CONSTANTS.AUTO_RELEASE_HOURS * 60 * 60 * 1000
      );

      // Update order status and set completion details
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          marketplace_status: 'detailer_marked_done',
          completed_at: new Date().toISOString(),
          confirmation_deadline: confirmationDeadline.toISOString(),
          auto_release_scheduled: true,
          notes: request.completion_notes ? 
            `${order.notes || ''}\n\nCompletion Notes: ${request.completion_notes}`.trim() : 
            order.notes
        })
        .eq('id', request.order_id)
        .select()
        .single();

      if (updateError) {
        return {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update order status',
            type: 'database',
            details: updateError
          }
        };
      }

      // Schedule auto-release (this would typically be handled by a background job)
      await this.scheduleAutoRelease(request.order_id, confirmationDeadline);

      // Send notification to client
      await this.sendCompletionNotification(order.client_id, request.order_id);

      return {
        success: true,
        data: {
          order: updatedOrder,
          confirmationDeadline: confirmationDeadline.toISOString(),
          autoReleaseScheduled: true
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'JOB_COMPLETION_ERROR',
          message: 'Failed to process job completion',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Process client confirmation
   */
  static async processClientConfirmation(
    request: ClientConfirmationRequest
  ): Promise<ApiResponse<{
    order: MarketplaceOrder;
    payoutProcessed: boolean;
    finalPayoutAmount?: number;
  }>> {
    try {
      // Validate request
      if (!request.order_id || !request.client_id || request.confirmed === undefined) {
        return {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Order ID, client ID, and confirmation status are required',
            type: 'validation'
          }
        };
      }

      // Get current user and verify authorization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== request.client_id) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You are not authorized to confirm this job',
            type: 'authorization'
          }
        };
      }

      // Get order and validate status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', request.order_id)
        .eq('client_id', request.client_id)
        .single();

      if (orderError || !order) {
        return {
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: 'Order not found or you are not authorized to access it',
            type: 'validation'
          }
        };
      }

      // Validate order status
      if (order.marketplace_status !== 'detailer_marked_done') {
        return {
          success: false,
          error: {
            code: 'INVALID_ORDER_STATUS',
            message: `Order status is '${order.marketplace_status}', expected 'detailer_marked_done'`,
            type: 'validation'
          }
        };
      }

      if (request.confirmed) {
        // Client confirmed - process final payout
        return await this.processConfirmedCompletion(order, request.feedback);
      } else {
        // Client disputed - handle dispute
        return await this.processDisputedCompletion(order, request.feedback);
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONFIRMATION_ERROR',
          message: 'Failed to process client confirmation',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Process confirmed completion (client approved)
   */
  private static async processConfirmedCompletion(
    order: MarketplaceOrder,
    feedback?: string
  ): Promise<ApiResponse<{
    order: MarketplaceOrder;
    payoutProcessed: boolean;
    finalPayoutAmount?: number;
  }>> {
    try {
      // Cancel auto-release
      await this.cancelAutoRelease(order.id);

      // Update order status to client confirmed
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          marketplace_status: 'client_confirmed',
          confirmed_at: new Date().toISOString(),
          auto_release_scheduled: false,
          notes: feedback ? 
            `${order.notes || ''}\n\nClient Feedback: ${feedback}`.trim() : 
            order.notes
        })
        .eq('id', order.id)
        .select()
        .single();

      if (updateError) {
        return {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update order status',
            type: 'database',
            details: updateError
          }
        };
      }

      // Process final payout (85%)
      const payoutResult = await PayoutProcessingService.processCompletionPayout(
        order.id,
        order.dealer_id
      );

      let payoutProcessed = false;
      let finalPayoutAmount: number | undefined;

      if (payoutResult.success && payoutResult.data) {
        payoutProcessed = true;
        finalPayoutAmount = payoutResult.data.payout_record.amount;
      }

      // Send notifications
      await this.sendConfirmationNotifications(order.client_id, order.dealer_id, order.id, true);

      return {
        success: true,
        data: {
          order: updatedOrder,
          payoutProcessed,
          finalPayoutAmount
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONFIRMED_COMPLETION_ERROR',
          message: 'Failed to process confirmed completion',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Process disputed completion (client not satisfied)
   */
  private static async processDisputedCompletion(
    order: MarketplaceOrder,
    feedback?: string
  ): Promise<ApiResponse<{
    order: MarketplaceOrder;
    payoutProcessed: boolean;
  }>> {
    try {
      // Cancel auto-release
      await this.cancelAutoRelease(order.id);

      // Update order status to disputed
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          marketplace_status: 'disputed',
          auto_release_scheduled: false,
          notes: feedback ? 
            `${order.notes || ''}\n\nDispute Reason: ${feedback}`.trim() : 
            order.notes
        })
        .eq('id', order.id)
        .select()
        .single();

      if (updateError) {
        return {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update order status',
            type: 'database',
            details: updateError
          }
        };
      }

      // Create dispute record (for admin review)
      await this.createDisputeRecord(order.id, order.client_id, feedback);

      // Send notifications
      await this.sendConfirmationNotifications(order.client_id, order.dealer_id, order.id, false);

      return {
        success: true,
        data: {
          order: updatedOrder,
          payoutProcessed: false
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DISPUTED_COMPLETION_ERROR',
          message: 'Failed to process disputed completion',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Process auto-release (called by background job after 48 hours)
   */
  static async processAutoRelease(orderId: string): Promise<ApiResponse<{
    order: MarketplaceOrder;
    payoutProcessed: boolean;
    finalPayoutAmount?: number;
  }>> {
    try {
      // Get order and validate it's eligible for auto-release
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
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

      // Validate order status and deadline
      if (order.marketplace_status !== 'detailer_marked_done') {
        return {
          success: false,
          error: {
            code: 'INVALID_ORDER_STATUS',
            message: `Order status is '${order.marketplace_status}', expected 'detailer_marked_done'`,
            type: 'validation'
          }
        };
      }

      if (!order.auto_release_scheduled) {
        return {
          success: false,
          error: {
            code: 'AUTO_RELEASE_NOT_SCHEDULED',
            message: 'Auto-release is not scheduled for this order',
            type: 'validation'
          }
        };
      }

      // Check if deadline has passed
      const deadline = new Date(order.confirmation_deadline);
      if (Date.now() < deadline.getTime()) {
        return {
          success: false,
          error: {
            code: 'DEADLINE_NOT_REACHED',
            message: 'Confirmation deadline has not been reached yet',
            type: 'validation'
          }
        };
      }

      // Update order status to auto-confirmed
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          marketplace_status: 'auto_confirmed',
          confirmed_at: new Date().toISOString(),
          auto_release_scheduled: false
        })
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) {
        return {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update order status',
            type: 'database',
            details: updateError
          }
        };
      }

      // Process final payout (85%)
      const payoutResult = await PayoutProcessingService.processCompletionPayout(
        orderId,
        order.dealer_id
      );

      let payoutProcessed = false;
      let finalPayoutAmount: number | undefined;

      if (payoutResult.success && payoutResult.data) {
        payoutProcessed = true;
        finalPayoutAmount = payoutResult.data.payout_record.amount;
      }

      // Send auto-release notifications
      await this.sendAutoReleaseNotifications(order.client_id, order.dealer_id, orderId);

      return {
        success: true,
        data: {
          order: updatedOrder,
          payoutProcessed,
          finalPayoutAmount
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'AUTO_RELEASE_ERROR',
          message: 'Failed to process auto-release',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Get orders pending client confirmation
   */
  static async getPendingConfirmations(clientId: string): Promise<ApiResponse<MarketplaceOrder[]>> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', clientId)
        .eq('marketplace_status', 'detailer_marked_done')
        .order('completed_at', { ascending: true });

      if (error) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch pending confirmations',
            type: 'database',
            details: error
          }
        };
      }

      return {
        success: true,
        data: orders || []
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch pending confirmations',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Get orders eligible for auto-release
   */
  static async getOrdersEligibleForAutoRelease(): Promise<ApiResponse<MarketplaceOrder[]>> {
    try {
      const now = new Date().toISOString();
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('marketplace_status', 'detailer_marked_done')
        .eq('auto_release_scheduled', true)
        .lte('confirmation_deadline', now)
        .order('confirmation_deadline', { ascending: true });

      if (error) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch orders eligible for auto-release',
            type: 'database',
            details: error
          }
        };
      }

      return {
        success: true,
        data: orders || []
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch orders eligible for auto-release',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Schedule auto-release (placeholder - would be implemented with job queue)
   */
  private static async scheduleAutoRelease(orderId: string, deadline: Date): Promise<void> {
    // In a real implementation, this would schedule a background job
    // For now, we'll just log the scheduling
    console.log(`Auto-release scheduled for order ${orderId} at ${deadline.toISOString()}`);
  }

  /**
   * Cancel auto-release
   */
  private static async cancelAutoRelease(orderId: string): Promise<void> {
    // In a real implementation, this would cancel the scheduled background job
    console.log(`Auto-release cancelled for order ${orderId}`);
  }

  /**
   * Send completion notification to client
   */
  private static async sendCompletionNotification(clientId: string, orderId: string): Promise<void> {
    // Implementation would send notification via your notification system
    console.log(`Sending completion notification to client ${clientId} for order ${orderId}`);
  }

  /**
   * Send confirmation notifications
   */
  private static async sendConfirmationNotifications(
    clientId: string,
    detailerId: string,
    orderId: string,
    confirmed: boolean
  ): Promise<void> {
    const status = confirmed ? 'confirmed' : 'disputed';
    console.log(`Sending ${status} notifications for order ${orderId} to client ${clientId} and detailer ${detailerId}`);
  }

  /**
   * Send auto-release notifications
   */
  private static async sendAutoReleaseNotifications(
    clientId: string,
    detailerId: string,
    orderId: string
  ): Promise<void> {
    console.log(`Sending auto-release notifications for order ${orderId} to client ${clientId} and detailer ${detailerId}`);
  }

  /**
   * Create dispute record
   */
  private static async createDisputeRecord(
    orderId: string,
    clientId: string,
    reason?: string
  ): Promise<void> {
    // Implementation would create a dispute record for admin review
    console.log(`Creating dispute record for order ${orderId} by client ${clientId}: ${reason}`);
  }
}

// Helper functions for job completion
export const jobCompletionHelpers = {
  /**
   * Calculate time remaining for confirmation
   */
  getTimeRemainingForConfirmation: (confirmationDeadline: string): {
    hours: number;
    minutes: number;
    expired: boolean;
  } => {
    const deadline = new Date(confirmationDeadline);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { hours: 0, minutes: 0, expired: true };
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes, expired: false };
  },

  /**
   * Format confirmation deadline for display
   */
  formatConfirmationDeadline: (confirmationDeadline: string): string => {
    const deadline = new Date(confirmationDeadline);
    return deadline.toLocaleString();
  },

  /**
   * Check if order needs confirmation
   */
  needsConfirmation: (order: MarketplaceOrder): boolean => {
    return order.marketplace_status === 'detailer_marked_done';
  },

  /**
   * Check if order is disputed
   */
  isDisputed: (order: MarketplaceOrder): boolean => {
    return order.marketplace_status === 'disputed';
  },

  /**
   * Get completion status display
   */
  getCompletionStatusDisplay: (status: string): string => {
    const statusMap: Record<string, string> = {
      'detailer_marked_done': 'Awaiting Confirmation',
      'client_confirmed': 'Confirmed by Client',
      'auto_confirmed': 'Auto-Confirmed',
      'disputed': 'Disputed',
      'completed': 'Completed'
    };
    return statusMap[status] || status;
  }
};