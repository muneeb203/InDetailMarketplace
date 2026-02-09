import React, { useState } from 'react';
import { Percent, Plus, Calendar } from 'lucide-react';
import { cn } from '../ui/utils';
import { OfferDetailsModal } from './OfferDetailsModal';

interface PromoBannerProps {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  onCreatePromo?: () => void;
  onViewOffer?: () => void;
  className?: string;
}

export function PromoBanner({
  title,
  description,
  startDate,
  endDate,
  active,
  onCreatePromo,
  onViewOffer,
  className,
}: PromoBannerProps) {
  const [showOfferModal, setShowOfferModal] = useState(false);

  const handleViewOffer = () => {
    setShowOfferModal(true);
  };

  if (!active) {
    return (
      <div className={cn("bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-sm border border-orange-200", className)}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mx-auto mb-4">
            <Percent className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No Active Promotion</h3>
          <p className="text-gray-600 text-sm mb-4">
            Attract more customers with a limited-time offer
          </p>
          <button
            onClick={onCreatePromo}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Promo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-2xl shadow-lg border border-orange-400 overflow-hidden", className)}>
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
      </div>

      <div className="relative p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Percent className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Active Promotion
            </div>
            <h3 className="font-bold text-white text-lg mb-1">{title}</h3>
            <p className="text-white/90 text-sm">{description}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 mb-4 text-white/90 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{startDate}</span>
          </div>
          <span>→</span>
          <span>{endDate}</span>
        </div>

        {/* Action */}
        <button
          onClick={handleViewOffer}
          className="w-full h-11 rounded-xl bg-white text-orange-600 font-semibold hover:bg-orange-50 transition-all active:scale-95 shadow-sm"
        >
          View Offer Details
        </button>
      </div>

      {/* Offer Details Modal */}
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