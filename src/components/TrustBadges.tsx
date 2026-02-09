import { Badge } from './ui/badge';
import { CheckCircle2, Zap, Shield, Crown, Clock, ThumbsUp } from 'lucide-react';
import { Detailer } from '../types';

interface TrustBadgesProps {
  detailer: Detailer;
  showAll?: boolean;
  variant?: 'compact' | 'detailed';
}

export function TrustBadges({ detailer, showAll = false, variant = 'compact' }: TrustBadgesProps) {
  const badges = [];

  // Pro badge
  if (detailer.isPro) {
    badges.push({
      id: 'pro',
      icon: Crown,
      label: 'Pro',
      color: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0',
      priority: 1,
    });
  }

  // Verified badge
  if ((detailer as any).verified || detailer.isPro) {
    badges.push({
      id: 'verified',
      icon: CheckCircle2,
      label: 'Verified',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      priority: 2,
    });
  }

  // Fast responder (based on completion rate)
  const responseRate = detailer.completedJobs / (detailer.completedJobs + 10);
  if (responseRate > 0.8) {
    badges.push({
      id: 'fast',
      icon: Zap,
      label: 'Fast Responder',
      color: 'bg-green-100 text-green-700 border-green-200',
      priority: 3,
    });
  }

  // Top rated
  if (detailer.rating >= 4.8 && (detailer.reviewCount || 0) >= 50) {
    badges.push({
      id: 'top-rated',
      icon: Shield,
      label: 'Top Rated',
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      priority: 4,
    });
  }

  // Detailed variant for profile pages
  if (variant === 'detailed') {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm">Response Time</p>
              <p className="text-xs text-gray-600">{detailer.responseTime || 15} min avg</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm">Acceptance Rate</p>
              <p className="text-xs text-gray-600">{detailer.acceptanceRate || 94}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm">Completed Jobs</p>
              <p className="text-xs text-gray-600">{detailer.completedJobs}+</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm">Insurance</p>
              <p className="text-xs text-gray-600">Verified</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sort by priority and limit if not showAll
  const sortedBadges = badges.sort((a, b) => a.priority - b.priority);
  const displayBadges = showAll ? sortedBadges : sortedBadges.slice(0, 2);

  if (displayBadges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayBadges.map((badge) => {
        const Icon = badge.icon;
        return (
          <Badge key={badge.id} className={`${badge.color} text-xs`}>
            <Icon className="w-3 h-3 mr-1" />
            {badge.label}
          </Badge>
        );
      })}
    </div>
  );
}
