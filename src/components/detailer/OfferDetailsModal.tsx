import React from 'react';
import { X, Calendar, Percent, Tag, AlertCircle } from 'lucide-react';

interface OfferDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export function OfferDetailsModal({
  isOpen,
  onClose,
  title,
  description,
  startDate,
  endDate,
}: OfferDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Active Promotion
              </div>
              <h2 className="font-bold text-xl">{title}</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Promotion Details */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-600" />
              Offer Details
            </h3>
            <p className="text-gray-700 leading-relaxed">{description}</p>
          </div>

          {/* Duration */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              Valid Dates
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 mb-1">Start Date</div>
                <div className="font-semibold text-gray-900">{startDate}</div>
              </div>
              <div className="text-gray-400">→</div>
              <div>
                <div className="text-xs text-gray-600 mb-1">End Date</div>
                <div className="font-semibold text-gray-900">{endDate}</div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              Terms & Conditions
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 flex-shrink-0">•</span>
                <span>Offer applies to new customers only</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 flex-shrink-0">•</span>
                <span>Cannot be combined with other promotions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 flex-shrink-0">•</span>
                <span>Valid for services within your service radius</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 flex-shrink-0">•</span>
                <span>Discount applied to quoted price before deposit</span>
              </li>
            </ul>
          </div>

          {/* How Customers See It */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">How Customers See This</h3>
            <p className="text-sm text-gray-600 mb-3">
              This promotion appears on your public profile as a badge and in marketplace search results
            </p>
            <div className="p-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold shadow-sm">
                <Percent className="w-3.5 h-3.5" />
                {title}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all active:scale-95 shadow-sm"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
