// Payment-specific notification service
import { createNotification } from './notificationService';
import { toast } from 'sonner';

export interface PaymentNotificationData {
  orderId: string;
  clientId: string;
  detailerId: string;
  amount: number; // in cents
  paymentType: '15_percent' | '85_percent' | 'full_refund';
  orderStatus: string;
}

/**
 * Send notifications for payment events
 */
export class PaymentNotificationService {
  
  /**
   * Notify when initial payment is captured (client pays)
   */
  static async notifyPaymentCaptured(data: {
    orderId: string;
    clientId: string;
    detailerId: string;
    amount: number;
  }) {
    const amountFormatted = (data.amount / 100).toFixed(2);
    
    try {
      // Notify client
      await createNotification(
        data.clientId,
        'order',
        '💳 Payment Confirmed',
        `Your payment of $${amountFormatted} has been processed successfully. Your detailer will be notified.`,
        `/orders/${data.orderId}`
      );

      // Notify detailer
      await createNotification(
        data.detailerId,
        'order',
        '🎉 New Paid Order',
        `You have a new paid order worth $${amountFormatted}. Accept it to receive your 15% upfront payment.`,
        `/orders/${data.orderId}`
      );

      // Show toast notifications
      console.log('Payment captured notifications sent successfully');
    } catch (error) {
      console.error('Error sending payment captured notifications:', error);
    }
  }

  /**
   * Notify when 15% upfront payment is sent to detailer
   */
  static async notifyUpfrontPayment(data: PaymentNotificationData) {
    const upfrontAmount = (data.amount * 0.15 / 100).toFixed(2);
    
    try {
      // Notify detailer about receiving upfront payment
      await createNotification(
        data.detailerId,
        'order',
        '💰 Upfront Payment Received',
        `You've received $${upfrontAmount} (15%) upfront payment for order. Complete the job to receive the remaining $${(data.amount * 0.85 / 100).toFixed(2)}.`,
        `/orders/${data.orderId}`
      );

      // Notify client about job acceptance
      await createNotification(
        data.clientId,
        'order',
        '✅ Job Accepted',
        `Great news! Your detailer has accepted the job and received their upfront payment. Work will begin soon.`,
        `/orders/${data.orderId}`
      );

      console.log('Upfront payment notifications sent successfully');
    } catch (error) {
      console.error('Error sending upfront payment notifications:', error);
    }
  }

  /**
   * Notify when job is marked complete (awaiting client confirmation)
   */
  static async notifyJobCompleted(data: {
    orderId: string;
    clientId: string;
    detailerId: string;
    amount: number;
    confirmationDeadline: Date;
  }) {
    const remainingAmount = (data.amount * 0.85 / 100).toFixed(2);
    const deadlineFormatted = data.confirmationDeadline.toLocaleDateString();
    
    try {
      // Notify client to confirm completion
      await createNotification(
        data.clientId,
        'order',
        '🎯 Job Completed - Confirmation Needed',
        `Your detailer has marked the job as complete. Please confirm to release the final payment of $${remainingAmount}. Auto-confirmation on ${deadlineFormatted}.`,
        `/orders/${data.orderId}`
      );

      // Notify detailer about completion status
      await createNotification(
        data.detailerId,
        'order',
        '⏳ Awaiting Client Confirmation',
        `You've marked the job as complete. The client has 48 hours to confirm. Final payment of $${remainingAmount} will be released upon confirmation.`,
        `/orders/${data.orderId}`
      );

      console.log('Job completion notifications sent successfully');
    } catch (error) {
      console.error('Error sending job completion notifications:', error);
    }
  }

  /**
   * Notify when client confirms job and 85% payment is released
   */
  static async notifyFinalPayment(data: PaymentNotificationData) {
    const finalAmount = (data.amount * 0.85 / 100).toFixed(2);
    
    try {
      // Notify detailer about receiving final payment
      await createNotification(
        data.detailerId,
        'order',
        '🎊 Final Payment Received',
        `Congratulations! You've received the final payment of $${finalAmount}. The job is now complete.`,
        `/orders/${data.orderId}`
      );

      // Notify client about successful completion
      await createNotification(
        data.clientId,
        'order',
        '✨ Job Completed Successfully',
        `Thank you for confirming! Final payment of $${finalAmount} has been released to your detailer. Please consider leaving a review.`,
        `/orders/${data.orderId}`
      );

      console.log('Final payment notifications sent successfully');
    } catch (error) {
      console.error('Error sending final payment notifications:', error);
    }
  }

  /**
   * Notify when payment is auto-released after 48 hours
   */
  static async notifyAutoRelease(data: PaymentNotificationData) {
    const finalAmount = (data.amount * 0.85 / 100).toFixed(2);
    
    try {
      // Notify detailer about auto-release
      await createNotification(
        data.detailerId,
        'order',
        '⏰ Payment Auto-Released',
        `Your final payment of $${finalAmount} has been automatically released after the 48-hour confirmation period. Great job!`,
        `/orders/${data.orderId}`
      );

      // Notify client about auto-release
      await createNotification(
        data.clientId,
        'order',
        '⏰ Payment Auto-Released',
        `The final payment of $${finalAmount} has been automatically released to your detailer after 48 hours. The job is now complete.`,
        `/orders/${data.orderId}`
      );

      console.log('Auto-release notifications sent successfully');
    } catch (error) {
      console.error('Error sending auto-release notifications:', error);
    }
  }

  /**
   * Notify about payment failures or issues
   */
  static async notifyPaymentError(data: {
    orderId: string;
    userId: string;
    userRole: 'client' | 'detailer';
    errorType: 'payment_failed' | 'payout_failed' | 'insufficient_funds';
    errorMessage: string;
  }) {
    const titles = {
      payment_failed: '❌ Payment Failed',
      payout_failed: '❌ Payout Failed',
      insufficient_funds: '💳 Insufficient Funds'
    };

    const messages = {
      payment_failed: `Your payment could not be processed: ${data.errorMessage}. Please try again with a different payment method.`,
      payout_failed: `There was an issue processing your payout: ${data.errorMessage}. Please check your account settings.`,
      insufficient_funds: `Payment failed due to insufficient funds: ${data.errorMessage}. Please use a different payment method.`
    };

    try {
      await createNotification(
        data.userId,
        'order',
        titles[data.errorType],
        messages[data.errorType],
        `/orders/${data.orderId}`
      );

      console.log('Payment error notification sent successfully');
    } catch (error) {
      console.error('Error sending payment error notification:', error);
    }
  }

  /**
   * Notify about refunds
   */
  static async notifyRefund(data: {
    orderId: string;
    clientId: string;
    detailerId: string;
    amount: number;
    reason: string;
  }) {
    const amountFormatted = (data.amount / 100).toFixed(2);
    
    try {
      // Notify client about refund
      await createNotification(
        data.clientId,
        'order',
        '💸 Refund Processed',
        `Your refund of $${amountFormatted} has been processed. Reason: ${data.reason}. It may take 3-5 business days to appear in your account.`,
        `/orders/${data.orderId}`
      );

      // Notify detailer about refund
      await createNotification(
        data.detailerId,
        'order',
        '↩️ Order Refunded',
        `Order has been refunded to the client ($${amountFormatted}). Reason: ${data.reason}.`,
        `/orders/${data.orderId}`
      );

      console.log('Refund notifications sent successfully');
    } catch (error) {
      console.error('Error sending refund notifications:', error);
    }
  }

  /**
   * Send real-time toast notifications (for immediate feedback)
   */
  static showToastNotification(
    type: 'success' | 'error' | 'info',
    title: string,
    message: string
  ) {
    switch (type) {
      case 'success':
        toast.success(title, { description: message });
        break;
      case 'error':
        toast.error(title, { description: message });
        break;
      case 'info':
        toast.info(title, { description: message });
        break;
    }
  }

  /**
   * Send batch notifications for multiple events
   */
  static async sendBatchNotifications(notifications: Array<{
    userId: string;
    type: 'order' | 'message' | 'booking' | 'status_update';
    title: string;
    message: string;
    link?: string;
  }>) {
    try {
      const promises = notifications.map(notification =>
        createNotification(
          notification.userId,
          notification.type,
          notification.title,
          notification.message,
          notification.link
        )
      );

      await Promise.all(promises);
      console.log(`Sent ${notifications.length} batch notifications successfully`);
    } catch (error) {
      console.error('Error sending batch notifications:', error);
    }
  }
}

/**
 * Helper function to format currency
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100);
}

/**
 * Helper function to format dates
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}