// Payment Notification Demo Component
import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { PaymentNotificationService } from '../services/paymentNotifications';
import { usePaymentNotifications, PaymentNotificationBadge, PaymentStatusTimeline } from './PaymentNotificationManager';
import { DollarSign, Bell, CheckCircle, Clock } from 'lucide-react';

export const PaymentNotificationDemo: React.FC = () => {
  const { showPaymentSuccess, showPaymentError, showJobStatusUpdate, showConfirmationReminder } = usePaymentNotifications();

  const testNotifications = [
    {
      title: 'Test Payment Captured',
      action: () => showPaymentSuccess(10000, 'payment'), // $100.00
      description: 'Shows a payment success notification'
    },
    {
      title: 'Test Upfront Payout',
      action: () => showPaymentSuccess(1500, 'payout'), // $15.00
      description: 'Shows an upfront payout notification'
    },
    {
      title: 'Test Final Payout',
      action: () => showPaymentSuccess(8500, 'payout'), // $85.00
      description: 'Shows a final payout notification'
    },
    {
      title: 'Test Job Accepted',
      action: () => showJobStatusUpdate('detailer_accepted', 'test-order-123'),
      description: 'Shows job acceptance notification'
    },
    {
      title: 'Test Job Completed',
      action: () => showJobStatusUpdate('detailer_marked_done', 'test-order-123'),
      description: 'Shows job completion notification'
    },
    {
      title: 'Test Confirmation Reminder',
      action: () => showConfirmationReminder('test-order-123', 24),
      description: 'Shows confirmation reminder (24 hours left)'
    },
    {
      title: 'Test Payment Error',
      action: () => showPaymentError('Your card was declined. Please try a different payment method.'),
      description: 'Shows a payment error notification'
    },
    {
      title: 'Test Auto-Release',
      action: () => showJobStatusUpdate('auto_confirmed', 'test-order-123'),
      description: 'Shows auto-release notification'
    }
  ];

  const sampleTimelineEvents = [
    {
      type: 'payment' as const,
      amount: 10000,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed' as const
    },
    {
      type: 'upfront' as const,
      amount: 1500,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed' as const
    },
    {
      type: 'completion' as const,
      amount: 8500,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      status: 'completed' as const
    }
  ];

  const testDatabaseNotifications = async () => {
    // Test creating actual database notifications
    try {
      await PaymentNotificationService.notifyPaymentCaptured({
        orderId: 'demo-order-' + Date.now(),
        clientId: 'demo-client-123',
        detailerId: 'demo-detailer-456',
        amount: 10000
      });

      await PaymentNotificationService.notifyUpfrontPayment({
        orderId: 'demo-order-' + Date.now(),
        clientId: 'demo-client-123',
        detailerId: 'demo-detailer-456',
        amount: 10000,
        paymentType: '15_percent',
        orderStatus: 'in_progress'
      });

      PaymentNotificationService.showToastNotification(
        'success',
        'Database Notifications Sent',
        'Check your notifications panel to see the new notifications!'
      );
    } catch (error) {
      PaymentNotificationService.showToastNotification(
        'error',
        'Database Error',
        'Could not send database notifications. This is expected in development mode.'
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Payment Notification Demo
          </CardTitle>
          <CardDescription>
            Test the payment notification system with various scenarios
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testNotifications.map((test, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={test.action}
                className="h-auto p-3 text-left justify-start"
              >
                <div>
                  <div className="font-medium">{test.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{test.description}</div>
                </div>
              </Button>
            ))}
          </div>

          <div className="border-t pt-4">
            <Button onClick={testDatabaseNotifications} className="w-full">
              <DollarSign className="h-4 w-4 mr-2" />
              Test Database Notifications
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              This will attempt to create real notifications in the database
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Notification Badges</CardTitle>
          <CardDescription>
            Visual indicators for different payment types
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <PaymentNotificationBadge type="upfront" amount={1500} />
            <PaymentNotificationBadge type="completion" amount={8500} />
            <PaymentNotificationBadge type="auto_release" amount={8500} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Status Timeline</CardTitle>
          <CardDescription>
            Visual timeline of payment events for an order
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <PaymentStatusTimeline events={sampleTimelineEvents} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Different types of notifications sent during the payment flow
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span><strong>Payment Captured:</strong> When client pays for service</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span><strong>Job Accepted:</strong> When detailer accepts job (15% payout)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span><strong>Job Completed:</strong> When detailer marks job done</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span><strong>Client Confirmed:</strong> When client confirms completion (85% payout)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span><strong>Auto-Released:</strong> When payment is auto-released after 48h</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};