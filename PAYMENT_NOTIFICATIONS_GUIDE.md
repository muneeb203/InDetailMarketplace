# 🔔 Payment Notifications System

## Overview

A comprehensive notification system that automatically notifies clients and detailers about payment events, status changes, and important milestones in the marketplace payment flow.

## 🎯 Notification Types

### 1. Payment Captured
**When**: Client successfully pays for a service
**Recipients**: Client + Detailer
- **Client**: "💳 Payment Confirmed - Your payment of $100.00 has been processed successfully"
- **Detailer**: "🎉 New Paid Order - You have a new paid order worth $100.00. Accept it to receive your 15% upfront payment"

### 2. Upfront Payment (15%)
**When**: Detailer accepts job and receives 15% upfront
**Recipients**: Client + Detailer
- **Detailer**: "💰 Upfront Payment Received - You've received $15.00 (15%) upfront payment"
- **Client**: "✅ Job Accepted - Great news! Your detailer has accepted the job and received their upfront payment"

### 3. Job Completed
**When**: Detailer marks job as complete
**Recipients**: Client + Detailer
- **Client**: "🎯 Job Completed - Confirmation Needed - Please confirm to release the final payment of $85.00"
- **Detailer**: "⏳ Awaiting Client Confirmation - The client has 48 hours to confirm"

### 4. Final Payment (85%)
**When**: Client confirms job completion
**Recipients**: Client + Detailer
- **Detailer**: "🎊 Final Payment Received - You've received the final payment of $85.00"
- **Client**: "✨ Job Completed Successfully - Final payment has been released to your detailer"

### 5. Auto-Release
**When**: Payment is automatically released after 48 hours
**Recipients**: Client + Detailer
- **Detailer**: "⏰ Payment Auto-Released - Your final payment has been automatically released"
- **Client**: "⏰ Payment Auto-Released - The final payment has been automatically released"

### 6. Payment Errors
**When**: Payment failures, payout issues, or other errors
**Recipients**: Affected user
- **Examples**: "❌ Payment Failed - Your card was declined", "❌ Payout Failed - Issue processing your payout"

### 7. Refunds
**When**: Orders are refunded
**Recipients**: Client + Detailer
- **Client**: "💸 Refund Processed - Your refund of $100.00 has been processed"
- **Detailer**: "↩️ Order Refunded - Order has been refunded to the client"

## 🛠️ Implementation

### Core Service: `PaymentNotificationService`

```typescript
// Send upfront payment notifications
await PaymentNotificationService.notifyUpfrontPayment({
  orderId: 'order-123',
  clientId: 'client-456',
  detailerId: 'detailer-789',
  amount: 10000, // $100.00 in cents
  paymentType: '15_percent',
  orderStatus: 'in_progress'
});
```

### Integration Points

1. **Payout Processing**: Notifications sent when 15% and 85% payments are processed
2. **Job Completion**: Notifications when detailer marks job complete
3. **Client Confirmation**: Notifications when client confirms or disputes
4. **Auto-Release**: Notifications when payments are auto-released
5. **Payment Capture**: Notifications when initial payment is captured

### Real-time Notifications

- **Database Notifications**: Stored in `notifications` table
- **Toast Notifications**: Immediate visual feedback using Sonner
- **Real-time Updates**: WebSocket subscriptions for live updates

## 🎨 UI Components

### 1. PaymentNotificationManager
Wraps the entire app and handles real-time notification subscriptions and toast displays.

### 2. PaymentNotificationBadge
Visual badges for different payment types:
- 15% Upfront: Blue badge
- 85% Final: Green badge  
- Auto-Released: Yellow badge

### 3. PaymentStatusTimeline
Visual timeline showing payment events chronologically.

### 4. usePaymentNotifications Hook
```typescript
const { showPaymentSuccess, showPaymentError, showJobStatusUpdate } = usePaymentNotifications();

// Show payment success
showPaymentSuccess(10000, 'payment'); // $100.00 payment

// Show job status update
showJobStatusUpdate('detailer_accepted', 'order-123');
```

## 🧪 Testing

### Test the Notification System

1. **Access Test Page**: Run `window.goToStripeTest()` in console
2. **Go to Notifications Tab**: Click the "Notifications" tab
3. **Test Different Scenarios**: Click buttons to test various notification types

### Available Tests

- Payment Captured ($100.00)
- Upfront Payout ($15.00)
- Final Payout ($85.00)
- Job Accepted
- Job Completed
- Confirmation Reminder
- Payment Error
- Auto-Release

### Database Notifications

The system also creates actual database notifications that appear in the user's notification panel.

## 📱 Notification Delivery

### Toast Notifications (Immediate)
- Success: Green with checkmark icon
- Error: Red with warning icon
- Info: Blue with info icon
- Auto-dismiss after 5-8 seconds
- Action buttons for relevant links

### Database Notifications (Persistent)
- Stored in `notifications` table
- Appear in notification panel
- Can be marked as read/unread
- Include links to relevant orders
- Real-time updates via WebSocket

### Email Notifications (Future)
- Can be extended to send email notifications
- Template-based system
- Configurable preferences

## 🔧 Configuration

### Notification Preferences
Users can configure:
- Which events to receive notifications for
- Delivery methods (toast, database, email)
- Notification timing and frequency

### Admin Controls
Admins can:
- View all notifications
- Manage notification templates
- Monitor notification delivery
- Handle notification failures

## 🚀 Integration with Payment Flow

### Automatic Integration
The notification system is automatically integrated into:

1. **PayoutProcessingService**: Sends notifications when payouts are processed
2. **JobCompletionService**: Sends notifications when jobs are completed
3. **MarketplacePaymentService**: Sends notifications when payments are captured
4. **Auto-Release Scheduler**: Sends notifications for auto-releases

### Manual Integration
For custom scenarios, use the service directly:

```typescript
import { PaymentNotificationService } from './services/paymentNotifications';

// Send custom notification
await PaymentNotificationService.notifyPaymentError({
  orderId: 'order-123',
  userId: 'user-456',
  userRole: 'client',
  errorType: 'payment_failed',
  errorMessage: 'Card declined'
});
```

## 📊 Analytics and Monitoring

### Notification Metrics
- Delivery success rates
- User engagement with notifications
- Most common notification types
- Error rates and failures

### Performance Monitoring
- Notification processing time
- Database query performance
- WebSocket connection health
- Toast notification display rates

## 🎉 Benefits

1. **Improved User Experience**: Users always know what's happening with their payments
2. **Reduced Support Tickets**: Clear communication reduces confusion
3. **Increased Trust**: Transparent payment process builds confidence
4. **Better Engagement**: Timely notifications keep users engaged
5. **Automated Communication**: Reduces manual customer service work

The notification system ensures that both clients and detailers are always informed about payment status changes, creating a transparent and trustworthy marketplace experience! 🎊