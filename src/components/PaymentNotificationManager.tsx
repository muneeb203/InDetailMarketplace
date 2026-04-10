// Payment Notification Manager Component
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { subscribeToNotifications, Notification } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

interface PaymentNotificationManagerProps {
  children: React.ReactNode;
}

export const PaymentNotificationManager: React.FC<PaymentNotificationManagerProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!currentUser?.id) return;

    // Subscribe to real-time notifications
    const unsubscribe = subscribeToNotifications(currentUser.id, (notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Show toast notification for payment-related events
      if (notification.type === 'order') {
        showPaymentToast(notification);
      }
    });

    return unsubscribe;
  }, [currentUser?.id]);

  const showPaymentToast = (notification: Notification) => {
    const { title, message } = notification;
    
    // Determine toast type and icon based on notification content
    if (title.includes('Payment Confirmed') || title.includes('Payment Received')) {
      toast.success(title, {
        description: message,
        icon: <DollarSign className="h-4 w-4" />,
        duration: 5000,
        action: notification.link ? {
          label: 'View Order',
          onClick: () => window.location.href = notification.link!
        } : undefined
      });
    } else if (title.includes('Job Accepted') || title.includes('Job Completed')) {
      toast.success(title, {
        description: message,
        icon: <CheckCircle className="h-4 w-4" />,
        duration: 5000,
        action: notification.link ? {
          label: 'View Details',
          onClick: () => window.location.href = notification.link!
        } : undefined
      });
    } else if (title.includes('Confirmation Needed') || title.includes('Awaiting')) {
      toast.info(title, {
        description: message,
        icon: <Clock className="h-4 w-4" />,
        duration: 7000,
        action: notification.link ? {
          label: 'Take Action',
          onClick: () => window.location.href = notification.link!
        } : undefined
      });
    } else if (title.includes('Auto-Released') || title.includes('Auto-Confirmed')) {
      toast.info(title, {
        description: message,
        icon: <Clock className="h-4 w-4" />,
        duration: 6000,
        action: notification.link ? {
          label: 'View Order',
          onClick: () => window.location.href = notification.link!
        } : undefined
      });
    } else if (title.includes('Failed') || title.includes('Error')) {
      toast.error(title, {
        description: message,
        icon: <AlertTriangle className="h-4 w-4" />,
        duration: 8000,
        action: notification.link ? {
          label: 'View Details',
          onClick: () => window.location.href = notification.link!
        } : undefined
      });
    } else {
      // Default notification
      toast(title, {
        description: message,
        icon: <Bell className="h-4 w-4" />,
        duration: 5000,
        action: notification.link ? {
          label: 'View',
          onClick: () => window.location.href = notification.link!
        } : undefined
      });
    }
  };

  return <>{children}</>;
};

// Hook for manual payment notifications
export const usePaymentNotifications = () => {
  const showPaymentSuccess = (amount: number, type: 'payment' | 'payout') => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);

    if (type === 'payment') {
      toast.success('Payment Successful', {
        description: `Your payment of ${formattedAmount} has been processed successfully.`,
        icon: <DollarSign className="h-4 w-4" />,
        duration: 5000
      });
    } else {
      toast.success('Payout Received', {
        description: `You've received a payout of ${formattedAmount}.`,
        icon: <DollarSign className="h-4 w-4" />,
        duration: 5000
      });
    }
  };

  const showPaymentError = (message: string) => {
    toast.error('Payment Failed', {
      description: message,
      icon: <AlertTriangle className="h-4 w-4" />,
      duration: 8000
    });
  };

  const showJobStatusUpdate = (status: string, orderId: string) => {
    const statusMessages = {
      'detailer_accepted': 'Your job has been accepted by the detailer!',
      'in_progress': 'Work has started on your job.',
      'detailer_marked_done': 'Your job is complete! Please confirm to release final payment.',
      'client_confirmed': 'Thank you for confirming! Final payment has been released.',
      'auto_confirmed': 'Payment has been automatically released after 48 hours.',
      'completed': 'Job completed successfully!',
      'disputed': 'There\'s an issue with this job that needs resolution.'
    };

    const message = statusMessages[status as keyof typeof statusMessages] || `Job status updated to: ${status}`;

    toast.info('Job Status Update', {
      description: message,
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 6000,
      action: {
        label: 'View Order',
        onClick: () => window.location.href = `/orders/${orderId}`
      }
    });
  };

  const showConfirmationReminder = (orderId: string, hoursRemaining: number) => {
    toast.info('Confirmation Reminder', {
      description: `You have ${hoursRemaining} hours left to confirm job completion. Payment will be auto-released if no action is taken.`,
      icon: <Clock className="h-4 w-4" />,
      duration: 10000,
      action: {
        label: 'Confirm Now',
        onClick: () => window.location.href = `/orders/${orderId}`
      }
    });
  };

  return {
    showPaymentSuccess,
    showPaymentError,
    showJobStatusUpdate,
    showConfirmationReminder
  };
};

// Component for displaying payment notification badges
export const PaymentNotificationBadge: React.FC<{
  type: 'upfront' | 'completion' | 'auto_release';
  amount: number;
  className?: string;
}> = ({ type, amount, className = '' }) => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100);

  const badgeConfig = {
    upfront: {
      label: '15% Upfront',
      color: 'bg-blue-100 text-blue-800',
      icon: <DollarSign className="h-3 w-3" />
    },
    completion: {
      label: '85% Final',
      color: 'bg-green-100 text-green-800',
      icon: <CheckCircle className="h-3 w-3" />
    },
    auto_release: {
      label: 'Auto-Released',
      color: 'bg-yellow-100 text-yellow-800',
      icon: <Clock className="h-3 w-3" />
    }
  };

  const config = badgeConfig[type];

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color} ${className}`}>
      {config.icon}
      <span>{config.label}</span>
      <span className="font-semibold">{formattedAmount}</span>
    </div>
  );
};

// Component for payment status timeline
export const PaymentStatusTimeline: React.FC<{
  events: Array<{
    type: 'payment' | 'upfront' | 'completion' | 'auto_release';
    amount: number;
    timestamp: string;
    status: 'completed' | 'pending' | 'failed';
  }>;
}> = ({ events }) => {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            event.status === 'completed' ? 'bg-green-100 text-green-600' :
            event.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
            'bg-red-100 text-red-600'
          }`}>
            {event.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
             event.status === 'pending' ? <Clock className="h-4 w-4" /> :
             <AlertTriangle className="h-4 w-4" />}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {event.type === 'payment' ? 'Payment Captured' :
                 event.type === 'upfront' ? 'Upfront Payment (15%)' :
                 event.type === 'completion' ? 'Final Payment (85%)' :
                 'Auto-Released Payment'}
              </span>
              <PaymentNotificationBadge 
                type={event.type === 'payment' ? 'upfront' : event.type as any}
                amount={event.amount}
              />
            </div>
            <p className="text-sm text-gray-500">
              {new Date(event.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};