// Auto-Release Scheduler Service for Marketplace Payments
import { supabase } from '../lib/supabaseClient';
import {
  AutoReleaseJob,
  MarketplaceOrder,
  ApiResponse,
  PaymentError,
  MARKETPLACE_CONSTANTS
} from '../types/marketplacePayments';
import { JobCompletionService } from './jobCompletion';

export class AutoReleaseSchedulerService {
  /**
   * Schedule auto-release for an order
   */
  static async scheduleAutoRelease(
    orderId: string,
    delayHours: number = MARKETPLACE_CONSTANTS.AUTO_RELEASE_HOURS
  ): Promise<ApiResponse<AutoReleaseJob>> {
    try {
      // Validate inputs
      if (!orderId) {
        return {
          success: false,
          error: {
            code: 'INVALID_ORDER_ID',
            message: 'Order ID is required',
            type: 'validation'
          }
        };
      }

      if (delayHours <= 0) {
        return {
          success: false,
          error: {
            code: 'INVALID_DELAY',
            message: 'Delay hours must be positive',
            type: 'validation'
          }
        };
      }

      // Check if order exists and is in correct status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, marketplace_status, dealer_id, client_id')
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

      // Check if auto-release is already scheduled
      const existingJob = await this.getScheduledJob(orderId);
      if (existingJob.success && existingJob.data) {
        return {
          success: false,
          error: {
            code: 'AUTO_RELEASE_ALREADY_SCHEDULED',
            message: 'Auto-release is already scheduled for this order',
            type: 'validation'
          }
        };
      }

      // Calculate scheduled time
      const scheduledFor = new Date(Date.now() + delayHours * 60 * 60 * 1000);

      // Create auto-release job record
      const autoReleaseJob: AutoReleaseJob = {
        order_id: orderId,
        scheduled_for: scheduledFor.toISOString(),
        attempts: 0,
        status: 'scheduled'
      };

      // Store the job (in a real implementation, this would be in a job queue table)
      await this.storeAutoReleaseJob(autoReleaseJob);

      // Update order to mark auto-release as scheduled
      await supabase
        .from('orders')
        .update({
          auto_release_scheduled: true,
          confirmation_deadline: scheduledFor.toISOString()
        })
        .eq('id', orderId);

      return {
        success: true,
        data: autoReleaseJob
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SCHEDULING_ERROR',
          message: 'Failed to schedule auto-release',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Cancel scheduled auto-release
   */
  static async cancelAutoRelease(orderId: string): Promise<ApiResponse<boolean>> {
    try {
      // Get existing job
      const existingJob = await this.getScheduledJob(orderId);
      if (!existingJob.success || !existingJob.data) {
        return {
          success: false,
          error: {
            code: 'NO_SCHEDULED_JOB',
            message: 'No auto-release job found for this order',
            type: 'validation'
          }
        };
      }

      // Remove the job
      await this.removeAutoReleaseJob(orderId);

      // Update order to mark auto-release as cancelled
      await supabase
        .from('orders')
        .update({
          auto_release_scheduled: false,
          confirmation_deadline: null
        })
        .eq('id', orderId);

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CANCELLATION_ERROR',
          message: 'Failed to cancel auto-release',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Process all due auto-releases (called by cron job)
   */
  static async processDueAutoReleases(): Promise<ApiResponse<{
    processed: number;
    failed: number;
    results: Array<{
      orderId: string;
      success: boolean;
      error?: PaymentError;
    }>;
  }>> {
    try {
      // Get all due auto-release jobs
      const dueJobs = await this.getDueAutoReleaseJobs();
      
      if (!dueJobs.success || !dueJobs.data) {
        return {
          success: false,
          error: dueJobs.error || {
            code: 'FETCH_ERROR',
            message: 'Failed to fetch due jobs',
            type: 'database'
          }
        };
      }

      const results: Array<{
        orderId: string;
        success: boolean;
        error?: PaymentError;
      }> = [];

      let processed = 0;
      let failed = 0;

      // Process each due job
      for (const job of dueJobs.data) {
        try {
          // Update job status to processing
          await this.updateJobStatus(job.order_id, 'processing');

          // Process the auto-release
          const releaseResult = await JobCompletionService.processAutoRelease(job.order_id);

          if (releaseResult.success) {
            processed++;
            results.push({ orderId: job.order_id, success: true });
            
            // Mark job as completed and remove it
            await this.updateJobStatus(job.order_id, 'completed');
            await this.removeAutoReleaseJob(job.order_id);
          } else {
            failed++;
            results.push({ 
              orderId: job.order_id, 
              success: false, 
              error: releaseResult.error 
            });

            // Update job with failure info
            await this.updateJobStatus(job.order_id, 'failed', releaseResult.error);
          }
        } catch (error) {
          failed++;
          const paymentError: PaymentError = {
            code: 'PROCESSING_ERROR',
            message: 'Error processing auto-release',
            type: 'network',
            details: error
          };
          
          results.push({ 
            orderId: job.order_id, 
            success: false, 
            error: paymentError 
          });

          await this.updateJobStatus(job.order_id, 'failed', paymentError);
        }
      }

      return {
        success: true,
        data: {
          processed,
          failed,
          results
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BATCH_PROCESSING_ERROR',
          message: 'Failed to process due auto-releases',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Get scheduled auto-release job for an order
   */
  static async getScheduledJob(orderId: string): Promise<ApiResponse<AutoReleaseJob | null>> {
    try {
      // In a real implementation, this would query a job queue table
      // For now, we'll simulate by checking the order's auto_release_scheduled flag
      const { data: order, error } = await supabase
        .from('orders')
        .select('id, auto_release_scheduled, confirmation_deadline')
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

      if (!order.auto_release_scheduled || !order.confirmation_deadline) {
        return {
          success: true,
          data: null
        };
      }

      const job: AutoReleaseJob = {
        order_id: orderId,
        scheduled_for: order.confirmation_deadline,
        attempts: 0,
        status: 'scheduled'
      };

      return {
        success: true,
        data: job
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch scheduled job',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Get all due auto-release jobs
   */
  private static async getDueAutoReleaseJobs(): Promise<ApiResponse<AutoReleaseJob[]>> {
    try {
      const now = new Date().toISOString();

      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, confirmation_deadline')
        .eq('marketplace_status', 'detailer_marked_done')
        .eq('auto_release_scheduled', true)
        .lte('confirmation_deadline', now)
        .order('confirmation_deadline', { ascending: true });

      if (error) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch due auto-release jobs',
            type: 'database',
            details: error
          }
        };
      }

      const jobs: AutoReleaseJob[] = (orders || []).map(order => ({
        order_id: order.id,
        scheduled_for: order.confirmation_deadline,
        attempts: 0,
        status: 'scheduled'
      }));

      return {
        success: true,
        data: jobs
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch due jobs',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Store auto-release job (placeholder for job queue implementation)
   */
  private static async storeAutoReleaseJob(job: AutoReleaseJob): Promise<void> {
    // In a real implementation, this would store the job in a job queue table
    // For now, we'll just log it
    console.log(`Storing auto-release job for order ${job.order_id} scheduled for ${job.scheduled_for}`);
  }

  /**
   * Remove auto-release job
   */
  private static async removeAutoReleaseJob(orderId: string): Promise<void> {
    // In a real implementation, this would remove the job from the job queue
    console.log(`Removing auto-release job for order ${orderId}`);
  }

  /**
   * Update job status
   */
  private static async updateJobStatus(
    orderId: string,
    status: AutoReleaseJob['status'],
    error?: PaymentError
  ): Promise<void> {
    // In a real implementation, this would update the job record in the job queue
    console.log(`Updating auto-release job status for order ${orderId} to ${status}`, error);
  }

  /**
   * Get auto-release statistics
   */
  static async getAutoReleaseStats(): Promise<ApiResponse<{
    scheduled: number;
    processing: number;
    completed_today: number;
    failed_today: number;
    average_processing_time: number;
  }>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Get scheduled jobs
      const { data: scheduledOrders, error: scheduledError } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('marketplace_status', 'detailer_marked_done')
        .eq('auto_release_scheduled', true);

      // Get completed today
      const { data: completedOrders, error: completedError } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('marketplace_status', 'auto_confirmed')
        .gte('confirmed_at', todayISO);

      if (scheduledError || completedError) {
        return {
          success: false,
          error: {
            code: 'STATS_ERROR',
            message: 'Failed to fetch auto-release statistics',
            type: 'database'
          }
        };
      }

      return {
        success: true,
        data: {
          scheduled: scheduledOrders?.length || 0,
          processing: 0, // Would be calculated from job queue
          completed_today: completedOrders?.length || 0,
          failed_today: 0, // Would be calculated from job queue
          average_processing_time: 0 // Would be calculated from historical data
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: 'Failed to calculate auto-release statistics',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Reschedule failed auto-release
   */
  static async rescheduleFailedAutoRelease(
    orderId: string,
    delayMinutes: number = 60
  ): Promise<ApiResponse<AutoReleaseJob>> {
    try {
      // Cancel existing schedule
      await this.cancelAutoRelease(orderId);

      // Reschedule with new delay
      const delayHours = delayMinutes / 60;
      return await this.scheduleAutoRelease(orderId, delayHours);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RESCHEDULE_ERROR',
          message: 'Failed to reschedule auto-release',
          type: 'network',
          details: error
        }
      };
    }
  }
}

// Helper functions for auto-release scheduling
export const autoReleaseHelpers = {
  /**
   * Calculate time until auto-release
   */
  getTimeUntilAutoRelease: (scheduledFor: string): {
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  } => {
    const scheduled = new Date(scheduledFor);
    const now = new Date();
    const diffMs = scheduled.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, expired: false };
  },

  /**
   * Format auto-release time for display
   */
  formatAutoReleaseTime: (scheduledFor: string): string => {
    const scheduled = new Date(scheduledFor);
    return scheduled.toLocaleString();
  },

  /**
   * Check if auto-release is overdue
   */
  isAutoReleaseOverdue: (scheduledFor: string): boolean => {
    const scheduled = new Date(scheduledFor);
    return Date.now() > scheduled.getTime();
  },

  /**
   * Get auto-release status display
   */
  getAutoReleaseStatusDisplay: (status: AutoReleaseJob['status']): string => {
    const statusMap = {
      'scheduled': 'Scheduled',
      'processing': 'Processing',
      'completed': 'Completed',
      'failed': 'Failed'
    };
    return statusMap[status] || status;
  },

  /**
   * Calculate recommended retry delay based on attempts
   */
  getRetryDelay: (attempts: number): number => {
    // Exponential backoff: 1 hour, 2 hours, 4 hours, max 8 hours
    const baseDelay = 60; // 1 hour in minutes
    const maxDelay = 480; // 8 hours in minutes
    const delay = Math.min(baseDelay * Math.pow(2, attempts), maxDelay);
    return delay;
  }
};