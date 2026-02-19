import React from 'react';
import { Calendar, User, Clock, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';

export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export interface BookingItem {
  id: string;
  clientName: string;
  serviceType: string;
  date: string;
  time: string;
  status: BookingStatus;
}

interface UpcomingBookingsProps {
  bookings?: BookingItem[];
  loading?: boolean;
  className?: string;
}

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'bg-blue-50 text-blue-700 border-blue-100' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  completed: { label: 'Completed', className: 'bg-green-50 text-green-700 border-green-100' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export function UpcomingBookings({ bookings = [], loading = false, className }: UpcomingBookingsProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm", className)}>
      <div className="p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Upcoming bookings</h2>
        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No bookings yet</p>
            <p className="text-xs text-gray-500">Accepted leads and scheduled jobs will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {bookings.map((b) => {
              const status = statusConfig[b.status];
              return (
                <li
                  key={b.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{b.clientName}</p>
                    <p className="text-xs text-gray-600">{b.serviceType}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{b.time === 'TBD' ? b.date : `${b.date} at ${b.time}`}</span>
                    </div>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium border flex-shrink-0", status.className)}>
                    {status.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
