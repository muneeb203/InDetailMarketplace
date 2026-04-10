import React, { useState, useEffect } from 'react';
import { Percent, Plus, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '../ui/utils';
import { OfferDetailsModal } from './OfferDetailsModal';

interface PromoBannerProps {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  performanceIndicator?: string;
  onCreatePromo?: () => void;
  onViewOffer?: () => void;
  className?: string;
}

function getDaysLeft(endDateStr: string): number | null {
  try {
    const end = new Date(endDateStr);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

export function PromoBanner({
  title,
  description,
  startDate,
  endDate,
  active,
  performanceIndicator,
  onCreatePromo,
  onViewOffer,
  className,
}: PromoBannerProps) {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (active && endDate) {
      setDaysLeft(getDaysLeft(endDate));
      const t = setInterval(() => setDaysLeft(getDaysLeft(endDate)), 60000);
      return () => clearInterval(t);
    }
  }, [active, endDate]);

  if (!active) {
    return (
      <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm", className)}>
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Percent className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">No active promotion</h2>
          <p className="text-sm text-gray-500 mb-4">
            Improve visibility by promoting your gig with a limited-time offer.
          </p>
          <button
            onClick={onCreatePromo}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Create promo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", className)}>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Percent className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-medium mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Active promotion
            </span>
            <h2 className="font-semibold text-gray-900 text-base mb-0.5">{title}</h2>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4">
          {(startDate || endDate) && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{startDate} – {endDate}</span>
            </div>
          )}
          {daysLeft != null && daysLeft > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-white/80 text-sm font-medium text-gray-700">
              {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
            </div>
          )}
          {performanceIndicator && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {performanceIndicator}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-white">
        <button
          onClick={() => (onViewOffer ? onViewOffer() : setShowOfferModal(true))}
          className="w-full h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all active:scale-[0.98]"
        >
          View offer details
        </button>
      </div>

      {title && description && startDate && endDate && (
        <OfferDetailsModal
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          title={title}
          description={description}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  );
}
