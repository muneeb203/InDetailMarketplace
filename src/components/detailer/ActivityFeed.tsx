import React from 'react';
import { Mail, Eye, CheckCircle, Activity } from 'lucide-react';
import { cn } from '../ui/utils';

export type ActivityType = 'lead' | 'view' | 'quote_accepted' | 'booking';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  time: string;
}

interface ActivityFeedProps {
  items?: ActivityItem[];
  className?: string;
}

const typeConfig: Record<ActivityType, { icon: typeof Mail; bg: string; iconColor: string }> = {
  lead: { icon: Mail, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
  view: { icon: Eye, bg: 'bg-gray-100', iconColor: 'text-gray-600' },
  quote_accepted: { icon: CheckCircle, bg: 'bg-green-50', iconColor: 'text-green-600' },
  booking: { icon: Activity, bg: 'bg-purple-50', iconColor: 'text-purple-600' },
};

export function ActivityFeed({ items = [], className }: ActivityFeedProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm", className)}>
      <div className="p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Recent activity</h2>
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No activity yet</p>
            <p className="text-xs text-gray-500">Leads, profile views, and bookings will show here.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const config = typeConfig[item.type];
              const Icon = config.icon;
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", config.bg)}>
                    <Icon className={cn("w-4 h-4", config.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
