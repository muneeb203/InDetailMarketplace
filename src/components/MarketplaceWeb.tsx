import React from 'react';
import { Star, MapPin, Phone } from 'lucide-react';
import { Detailer } from '../types';

interface MarketplaceWebProps {
  detailers: Detailer[];
  onSelectDetailer: (detailer: Detailer) => void;
  onRequestQuote: (detailer: Detailer) => void;
}

export function MarketplaceWeb({ detailers, onSelectDetailer, onRequestQuote }: MarketplaceWebProps) {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">5 detailers near you</h1>
        <button className="text-blue-600 text-sm hover:underline">Location enabled</button>
      </div>

      {/* Detailer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {detailers.map((detailer) => (
          <div
            key={detailer.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Image */}
            <div className="relative h-48 bg-gray-900">
              {(detailer.logo ?? detailer.photos?.[0] ?? detailer.avatar) ? (
                <img
                  src={detailer.logo ?? detailer.photos?.[0] ?? detailer.avatar}
                  alt={detailer.businessName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-4xl">🚗</span>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {detailer.isPro && (
                  <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Pro
                  </span>
                )}
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Verified
                </span>
              </div>

              {/* Service Type Badge */}
              <div className="absolute bottom-3 left-3">
                <span className="bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {detailer.services[0] || 'Auto Detailing'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-2">{detailer.businessName}</h3>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(detailer.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold">{detailer.rating}</span>
                <span className="text-sm text-gray-500">({detailer.completedJobs})</span>
              </div>

              {/* Price & Location */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span className="font-semibold">{detailer.priceRange}</span>
                <span>East Side (7 mile radius)</span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {detailer.bio || 'I'm sedentary house yours wantink you placemend westiber care will wantink you truck calls.'}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onRequestQuote(detailer)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Request Quote
                </button>
                <button
                  onClick={() => onSelectDetailer(detailer)}
                  className="flex-1 bg-green-50 text-green-700 py-2 px-4 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                >
                  <Phone className="w-4 h-4" />
                  View & Call
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
