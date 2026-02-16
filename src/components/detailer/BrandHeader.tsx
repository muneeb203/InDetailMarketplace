import React from 'react';
import { Star, CheckCircle, Shield, MapPin } from 'lucide-react';
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
  serviceTags?: string[];
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
  serviceTags,
  compact = false,
  className,
}: BrandHeaderProps) {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm", className)}>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
          {logo ? (
            <img src={logo} alt={shopName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold text-lg">{shopName.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-900 truncate text-lg">{shopName}</h1>
          {rating != null && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-gray-900">{rating.toFixed(1)}</span>
              {jobCount != null && <span>· {jobCount} jobs</span>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", className)}>
      <div className="h-20 bg-gradient-to-br from-blue-50 via-blue-100/80 to-indigo-100/80" />
      <div className="px-5 pb-5 relative">
        <div className="relative -mt-11 mb-4">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
            {logo ? (
              <img src={logo} alt={shopName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-2xl">{shopName.charAt(0)}</span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{shopName}</h1>
            {badges.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Verified
              </span>
            )}
            {badges.insured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                Insured
              </span>
            )}
          </div>

          {tagline && (
            <p className="text-sm text-gray-600">{tagline}</p>
          )}

          {(city || radiusBadge) && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>
                {[city, radiusBadge].filter(Boolean).join(' · ')}
              </span>
            </div>
          )}

          {(rating != null || jobCount != null) && (
            <div className="flex items-center gap-3 text-sm">
              {rating != null && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
                </div>
              )}
              {jobCount != null && (
                <span className="text-gray-500">{jobCount} jobs completed</span>
              )}
            </div>
          )}

          {serviceTags && serviceTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {serviceTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
