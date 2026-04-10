import { Bell, MessageSquare, Package, Star, Calendar, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsPageProps {
  userId: string;
  onNavigate?: (link: string) => void;
}

const iconMap = {
  message: MessageSquare,
  order: Package,
  review: Star,
  booking: Calendar,
  status_update: Bell,
};

const colorMap = {
  message: 'bg-blue-100 text-blue-600',
  order: 'bg-green-100 text-green-600',
  review: 'bg-yellow-100 text-yellow-600',
  booking: 'bg-purple-100 text-purple-600',
  status_update: 'bg-gray-100 text-gray-600',
};

export function NotificationsPage({ userId, onNavigate }: NotificationsPageProps) {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications(userId);

  const handleNotificationClick = (notificationId: string, link?: string, isRead?: boolean) => {
    if (!isRead) {
      markAsRead(notificationId);
    }
    if (link && onNavigate) {
      onNavigate(link);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
          <p className="text-gray-600">
            When you receive messages, orders, or updates, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = iconMap[notification.type] || Bell;
            const colorClass = colorMap[notification.type] || colorMap.status_update;
            const isUnread = !notification.is_read;

            return (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border transition-all ${
                  isUnread
                    ? 'border-blue-200 bg-blue-50/30'
                    : 'border-gray-200 hover:border-gray-300'
                } ${notification.link ? 'cursor-pointer' : ''}`}
                onClick={() =>
                  handleNotificationClick(notification.id, notification.link, notification.is_read)
                }
              >
                <div className="p-4 flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-semibold text-gray-900 ${isUnread ? 'font-bold' : ''}`}>
                        {notification.title}
                      </h3>
                      {isUnread && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
