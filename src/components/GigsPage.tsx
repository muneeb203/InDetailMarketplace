import { useState } from 'react';
import { useDetailers } from '../hooks/useDetailers';
import { DetailerFilters } from '../services/detailerService';
import { Detailer } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Loader2, MapPin, Star, DollarSign, Award } from 'lucide-react';

interface GigsPageProps {
  onSelectGig?: (detailer: Detailer) => void;
}

export function GigsPage({ onSelectGig }: GigsPageProps) {
  const [filters, setFilters] = useState<DetailerFilters>({
    priceRange: undefined,
    minRating: undefined,
    services: [],
    isPro: undefined,
  });

  const { detailers, loading, error, refetch } = useDetailers(filters);

  const handleFilterChange = (newFilters: Partial<DetailerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading gigs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-600 mb-4">Failed to load gigs</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Available Detailing Gigs
        </h1>
        <p className="text-gray-600">
          {detailers.length} detailer{detailers.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Price Range Filter */}
          <select
            value={filters.priceRange || ''}
            onChange={(e) => handleFilterChange({ priceRange: e.target.value || undefined })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Prices</option>
            <option value="$">$ - Budget</option>
            <option value="$$">$$ - Moderate</option>
            <option value="$$$">$$$ - Premium</option>
            <option value="$$$$">$$$$ - Luxury</option>
          </select>

          {/* Rating Filter */}
          <select
            value={filters.minRating || ''}
            onChange={(e) => handleFilterChange({ minRating: e.target.value ? Number(e.target.value) : undefined })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Ratings</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>

          {/* Pro Filter */}
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={filters.isPro || false}
              onChange={(e) => handleFilterChange({ isPro: e.target.checked || undefined })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Pro Only</span>
          </label>

          {/* Clear Filters */}
          <button
            onClick={() => setFilters({})}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Gigs Grid */}
      {detailers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No detailers found matching your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {detailers.map((detailer) => (
            <GigCard
              key={detailer.id}
              detailer={detailer}
              onClick={() => onSelectGig?.(detailer)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface GigCardProps {
  detailer: Detailer;
  onClick?: () => void;
}

function GigCard({ detailer, onClick }: GigCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Image - logo (profile picture) first, then portfolio, then avatar */}
      <div className="relative h-48 bg-gray-200">
        {(detailer.logo ?? detailer.photos?.[0] ?? detailer.avatar) ? (
          <ImageWithFallback
            src={detailer.logo ?? detailer.photos?.[0] ?? detailer.avatar}
            alt={detailer.businessName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {detailer.isPro && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Award className="w-3 h-3" />
            PRO
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Business Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {detailer.businessName}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span>{detailer.location}</span>
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-900">{detailer.rating.toFixed(1)}</span>
          </div>
          {detailer.reviewCount && (
            <span className="text-sm text-gray-500">
              ({detailer.reviewCount} reviews)
            </span>
          )}
        </div>

        {/* Price Range */}
        <div className="flex items-center gap-1 mb-3">
          <DollarSign className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{detailer.priceRange}</span>
        </div>

        {/* Services */}
        <div className="flex flex-wrap gap-2 mb-3">
          {detailer.services.slice(0, 3).map((service, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {service}
            </span>
          ))}
          {detailer.services.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              +{detailer.services.length - 3} more
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span>{detailer.completedJobs} jobs completed</span>
          {detailer.isVerified && (
            <span className="text-green-600 font-medium">✓ Verified</span>
          )}
        </div>
      </div>
    </div>
  );
}
