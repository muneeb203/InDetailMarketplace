import { Badge } from './ui/badge';
import { Shield, Award, Star, Eye } from 'lucide-react';
import { Detailer } from '../types';

interface TrustCuesBadgeProps {
  detailer: Detailer;
  variant?: 'full' | 'compact';
  showExposure?: boolean;
}

export function TrustCuesBadge({ detailer, variant = 'full', showExposure = true }: TrustCuesBadgeProps) {
  const badges = [];

  if (detailer.isVerified) {
    badges.push({
      icon: Shield,
      label: 'Verified',
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgLight: 'bg-blue-50',
    });
  }

  if (detailer.isInsured) {
    badges.push({
      icon: Award,
      label: 'Insured',
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgLight: 'bg-green-50',
    });
  }

  if (detailer.isPro) {
    badges.push({
      icon: Award,
      label: 'Pro',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgLight: 'bg-yellow-50',
    });
  }

  // Mock exposure data - in production, this would be real
  const mockExposureViews = detailer.exposureMetrics?.profileViews || Math.floor(Math.random() * 2000) + 500;

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-1">
        {badges.map((badge, index) => (
          <Badge
            key={index}
            variant="secondary"
            className={`${badge.bgLight} ${badge.textColor} border-0 text-xs`}
          >
            <badge.icon className="w-3 h-3 mr-1" />
            {badge.label}
          </Badge>
        ))}
        {detailer.rating > 0 && (
          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-0 text-xs">
            <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
            {detailer.rating.toFixed(1)}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Trust Badges */}
      <div className="flex flex-wrap gap-2">
        {badges.map((badge, index) => (
          <Badge
            key={index}
            className={`${badge.bgLight} ${badge.textColor} border-0`}
          >
            <badge.icon className="w-4 h-4 mr-1" />
            {badge.label}
          </Badge>
        ))}
        {detailer.rating > 0 && (
          <Badge className="bg-amber-50 text-amber-700 border-0">
            <Star className="w-4 h-4 mr-1 fill-amber-400 text-amber-400" />
            {detailer.rating.toFixed(1)} ({detailer.reviewCount || 0} reviews)
          </Badge>
        )}
      </div>

      {/* Exposure Stats */}
      {showExposure && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Eye className="w-4 h-4" />
          <span>Seen by {mockExposureViews.toLocaleString()} customers this month</span>
        </div>
      )}
    </div>
  );
}
