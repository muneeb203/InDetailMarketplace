import React from 'react';
import { Clock, MapPin, DollarSign, ListChecks, Send } from 'lucide-react';
import { cn } from '../ui/utils';

interface ServiceSummaryCardProps {
  services: string[];
  startingPrice?: string | number;
  estimatedTime?: string;
  serviceRadius?: string;
  onRequestOffer?: () => void;
  className?: string;
}

export function ServiceSummaryCard({
  services,
  startingPrice,
  estimatedTime,
  serviceRadius,
  onRequestOffer,
  className,
}: ServiceSummaryCardProps) {
  const hasDetails = startingPrice != null || estimatedTime != null || serviceRadius != null;

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", className)}>
      <div className="p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Service overview</h2>

        {services.length > 0 ? (
          <ul className="space-y-2 mb-4">
            {services.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-gray-700">
                <ListChecks className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No services listed yet.</p>
        )}

        {hasDetails && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 py-3 border-t border-b border-gray-100">
            {startingPrice != null && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Starting from</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {typeof startingPrice === 'number' ? `$${startingPrice}` : startingPrice}
                  </p>
                </div>
              </div>
            )}
            {estimatedTime != null && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Est. time</p>
                  <p className="text-sm font-semibold text-gray-900">{estimatedTime}</p>
                </div>
              </div>
            )}
            {serviceRadius != null && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Coverage</p>
                  <p className="text-sm font-semibold text-gray-900">{serviceRadius}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {onRequestOffer && (
          <button
            onClick={onRequestOffer}
            className="w-full h-11 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
          >
            <Send className="w-4 h-4" />
            Request Offer
          </button>
        )}
      </div>
    </div>
  );
}
