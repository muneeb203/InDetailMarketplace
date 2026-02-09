import React from 'react';
import { Star, CheckCircle, Shield } from 'lucide-react';
import { cn } from '../ui/utils';

interface BrandHeaderProps {
  logo?: string;
  shopName: string;
  tagline?: string;
  city?: string;
  radiusBadge?: string;
  badges?: {
    verified?: boolean;
    insured?: boolean;
  };
  rating?: number;
  jobCount?: number;
  compact?: boolean;
  className?: string;
}

export function BrandHeader({
  logo,
  shopName,
  tagline,
  city,
  radiusBadge,
  badges = {},
  rating,
  jobCount,
  compact = false,
  className,
}: BrandHeaderProps) {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 p-3 bg-white border-b", className)}>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
          {logo ? (
            <img src={logo} alt={shopName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold text-lg">{shopName.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{shopName}</h3>
          {rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              {jobCount && <span className="text-gray-500">• {jobCount} jobs</span>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border overflow-hidden", className)}>
      {/* Banner background */}
      <div className="h-24 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100" />
      
      <div className="px-6 pb-6">
        {/* Logo */}
        <div className="relative -mt-12 mb-4">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
            {logo ? (
              <img src={logo} alt={shopName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-3xl">{shopName.charAt(0)}</span>
            )}
          </div>
        </div>

        {/* Shop info */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">{shopName}</h2>
          
          {tagline && (
            <p className="text-gray-600">{tagline}</p>
          )}

          {/* Location & badges */}
          <div className="flex flex-wrap items-center gap-2">
            {city && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">
                {city}
                {radiusBadge && <span className="text-gray-500">• {radiusBadge}</span>}
              </span>
            )}
            
            {badges.verified && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-sm text-blue-700">
                <CheckCircle className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
            
            {badges.insured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-sm text-green-700">
                <Shield className="w-3.5 h-3.5" />
                Insured
              </span>
            )}
          </div>

          {/* Rating */}
          {rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-lg text-gray-900">{rating.toFixed(1)}</span>
              </div>
              {jobCount && (
                <span className="text-gray-600">• {jobCount} jobs completed</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
