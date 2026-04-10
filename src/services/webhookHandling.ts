// Webhook Handling Service for Frontend
import { supabase } from '../lib/supabaseClient';
import {
  StripeWebhookEvent,
  WebhookProcessingResult,
  ApiResponse,
  PaymentError
} from '../types/marketplacePayments';

export class WebhookHandlingService {
  /**
   * Get webhook event history
   */
  static async getWebhookEvents(
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<{
    events: any[];
    total_count: number;
  }>> {
    try {
      const { data: events, error, count } = await supabase
        .from('webhook_events')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch webhook events',
            type: 'database',
            details: error
          }
        };
      }

      return {
        success: true,
        data: {
          events: events || [],
          total_count: count || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch webhook events',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Get webhook events by type
   */
  static async getWebhookEventsByType(
    eventType: string,
    limit: number = 50
  ): Promise<ApiResponse<any[]>> {
    try {
      const { data: events, error } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('event_type', eventType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch webhook events by type',
            type: 'database',
            details: error
          }
        };
      }

      return {
        success: true,
        data: events || []
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch webhook events by type',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Get failed webhook events
   */
  static async getFailedWebhookEvents(): Promise<ApiResponse<any[]>> {
    try {
      const { data: events, error } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('processed', false)
        .not('error', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch failed webhook events',
            type: 'database',
            details: error
          }
        };
      }

      return {
        success: true,
        data: events || []
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch failed webhook events',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Get webhook statistics
   */
  static async getWebhookStats(): Promise<ApiResponse<{
    total_events: number;
    processed_events: number;
    failed_events: number;
    events_today: number;
    success_rate: number;
    event_types: Array<{ type: string; count: number }>;
  }>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Get total events
      const { count: totalEvents } = await supabase
        .from('webhook_events')
        .select('*', { count: 'exact', head: true });

      // Get processed events
      const { count: processedEvents } = await supabase
        .from('webhook_events')
        .select('*', { count: 'exact', head: true })
        .eq('processed', true);

      // Get failed events
      const { count: failedEvents } = await supabase
        .from('webhook_events')
        .select('*', { count: 'exact', head: true })
        .eq('processed', false)
        .not('error', 'is', null);

      // Get events today
      const { count: eventsToday } = await supabase
        .from('webhook_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO);

      // Get event types
      const { data: eventTypesData, error: eventTypesError } = await supabase
        .from('webhook_events')
        .select('event_type')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (eventTypesError) {
        throw eventTypesError;
      }

      // Count event types
      const eventTypeCounts: Record<string, number> = {};
      eventTypesData?.forEach(event => {
        eventTypeCounts[event.event_type] = (eventTypeCounts[event.event_type] || 0) + 1;
      });

      const eventTypes = Object.entries(eventTypeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      const successRate = totalEvents && totalEvents > 0 
        ? ((processedEvents || 0) / totalEvents) * 100 
        : 0;

      return {
        success: true,
        data: {
          total_events: totalEvents || 0,
          processed_events: processedEvents || 0,
          failed_events: failedEvents || 0,
          events_today: eventsToday || 0,
          success_rate: Math.round(successRate * 100) / 100,
          event_types: eventTypes
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: 'Failed to calculate webhook statistics',
          type: 'database',
          details: error
        }
      };
    }
  }

  /**
   * Retry failed webhook event (admin function)
   */
  static async retryFailedWebhookEvent(eventId: string): Promise<ApiResponse<boolean>> {
    try {
      // Get the failed event
      const { data: event, error } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('id', eventId)
        .eq('processed', false)
        .single();

      if (error || !event) {
        return {
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: 'Failed webhook event not found',
            type: 'validation'
          }
        };
      }

      // Reset the event for retry
      const { error: updateError } = await supabase
        .from('webhook_events')
        .update({
          processed: false,
          error: null,
          processed_at: null
        })
        .eq('id', eventId);

      if (updateError) {
        return {
          success: false,
          error: {
            code: 'UPDATE_ERROR',
            message: 'Failed to reset webhook event for retry',
            type: 'database',
            details: updateError
          }
        };
      }

      // Note: In a real implementation, you would trigger the webhook processor
      // to re-process this event. For now, we just mark it as ready for retry.

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RETRY_ERROR',
          message: 'Failed to retry webhook event',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Clean up old webhook events (admin function)
   */
  static async cleanupOldWebhookEvents(daysOld: number = 30): Promise<ApiResponse<{
    deleted_count: number;
  }>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      const cutoffISO = cutoffDate.toISOString();

      const { data: deletedEvents, error } = await supabase
        .from('webhook_events')
        .delete()
        .eq('processed', true)
        .lt('created_at', cutoffISO)
        .select('id');

      if (error) {
        return {
          success: false,
          error: {
            code: 'CLEANUP_ERROR',
            message: 'Failed to cleanup old webhook events',
            type: 'database',
            details: error
          }
        };
      }

      return {
        success: true,
        data: {
          deleted_count: deletedEvents?.length || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CLEANUP_ERROR',
          message: 'Failed to cleanup old webhook events',
          type: 'network',
          details: error
        }
      };
    }
  }

  /**
   * Subscribe to webhook events in real-time
   */
  static subscribeToWebhookEvents(
    callback: (event: any) => void,
    eventType?: string
  ): () => void {
    let subscription: any;

    if (eventType) {
      subscription = supabase
        .channel('webhook_events_by_type')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'webhook_events',
            filter: `event_type=eq.${eventType}`
          },
          callback
        )
        .subscribe();
    } else {
      subscription = supabase
        .channel('webhook_events')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'webhook_events'
          },
          callback
        )
        .subscribe();
    }

    // Return unsubscribe function
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }
}

// Helper functions for webhook handling
export const webhookHelpers = {
  /**
   * Format webhook event for display
   */
  formatWebhookEvent: (event: any): {
    id: string;
    type: string;
    status: 'processed' | 'failed' | 'pending';
    timestamp: string;
    error?: string;
  } => {
    let status: 'processed' | 'failed' | 'pending' = 'pending';
    
    if (event.processed) {
      status = 'processed';
    } else if (event.error) {
      status = 'failed';
    }

    return {
      id: event.id,
      type: event.event_type,
      status,
      timestamp: new Date(event.created_at).toLocaleString(),
      error: event.error
    };
  },

  /**
   * Get webhook event status color
   */
  getStatusColor: (status: 'processed' | 'failed' | 'pending'): string => {
    const colorMap = {
      'processed': 'green',
      'failed': 'red',
      'pending': 'yellow'
    };
    return colorMap[status] || 'gray';
  },

  /**
   * Get webhook event type display name
   */
  getEventTypeDisplay: (eventType: string): string => {
    const displayMap: Record<string, string> = {
      'payment_intent.succeeded': 'Payment Succeeded',
      'payment_intent.payment_failed': 'Payment Failed',
      'transfer.created': 'Transfer Created',
      'transfer.updated': 'Transfer Updated',
      'account.updated': 'Account Updated',
      'capability.updated': 'Capability Updated'
    };
    return displayMap[eventType] || eventType;
  },

  /**
   * Check if webhook event is critical
   */
  isCriticalEvent: (eventType: string): boolean => {
    const criticalEvents = [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'transfer.created',
      'account.updated'
    ];
    return criticalEvents.includes(eventType);
  },

  /**
   * Get recommended action for failed webhook
   */
  getRecommendedAction: (event: any): string => {
    if (!event.error) return 'No action needed';

    if (event.error.includes('signature')) {
      return 'Check webhook endpoint configuration';
    }

    if (event.error.includes('timeout')) {
      return 'Retry the webhook event';
    }

    if (event.error.includes('database')) {
      return 'Check database connectivity';
    }

    return 'Review error details and retry if appropriate';
  }
};