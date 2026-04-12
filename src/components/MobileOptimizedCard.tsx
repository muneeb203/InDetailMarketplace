import React from 'react';
import { Star, MapPin, Clock, Phone, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AvatarWithFallback } from './ui/avatar-with-fallback';

interface MobileOptimizedCardProps {
  title: string;
  subtitle?: string;
  rating?: number;
  location?: string;
  distance?: string;
  price?: string;
  imageUrl?: string;
  badges?: string[];
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  showActions?: boolean;
  className?: string;
}

export function MobileOptimizedCard({
  title,
  subtitle,
  rating,
  location,
  distance,
  price,
  imageUrl,
  badges = [],
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel = "Book Now",
  secondaryActionLabel = "Message",
  showActions = true,
  className = "",
}: MobileOptimizedCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Header with Image and Basic Info */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <AvatarWithFallback
            src={imageUrl}
            name={title}
            size="lg"
            className="flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-base truncate">{title}</h3>
                {subtitle && (
                  <p className="text-sm text-gray-600 truncate">{subtitle}</p>
                )}
              </div>
              
              {price && (
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-semibold text-blue-600 text-sm">{price}</p>
                </div>
              )}
            </div>

            {/* Rating and Location */}
            <div className="flex items-center gap-4 mt-2">
              {rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
                </div>
              )}
              
              {location && (
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm truncate">{location}</span>
                  {distance && (
                    <span className="text-sm">• {distance}</span>
                  )}
                </div>
              )}
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {badges.slice(0, 3).map((badge, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                    {badge}
                  </Badge>
                ))}
                {badges.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{badges.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (onPrimaryAction || onSecondaryAction) && (
        <div className="px-4 pb-4">
          <div className="flex gap-2">
            {onSecondaryAction && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSecondaryAction}
                className="flex-1 h-9"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                {secondaryActionLabel}
              </Button>
            )}
            {onPrimaryAction && (
              <Button
                onClick={onPrimaryAction}
                size="sm"
                className="flex-1 h-9"
              >
                {primaryActionLabel}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Specialized variants
export function DetailerMobileCard({
  detailer,
  onSelect,
  onMessage,
  onRequestQuote,
}: {
  detailer: any;
  onSelect?: () => void;
  onMessage?: () => void;
  onRequestQuote?: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <AvatarWithFallback
            src={detailer.avatar}
            name={detailer.businessName || detailer.name}
            size="lg"
            className="flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-base truncate">
                  {detailer.businessName || detailer.name}
                </h3>
                {detailer.bio && (
                  <p className="text-sm text-gray-600 truncate">{detailer.bio}</p>
                )}
              </div>
              
              {detailer.priceRange && (
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-semibold text-blue-600 text-sm">{detailer.priceRange}</p>
                </div>
              )}
            </div>

            {/* Rating and Location */}
            <div className="flex items-center gap-4 mt-2">
              {detailer.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">{detailer.rating.toFixed(1)}</span>
                </div>
              )}
              
              {detailer.location && (
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm truncate">{detailer.location}</span>
                </div>
              )}
            </div>

            {/* Badges */}
            {(detailer.specialties || detailer.services) && (detailer.specialties || detailer.services).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {(detailer.specialties || detailer.services).slice(0, 3).map((badge: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                    {badge}
                  </Badge>
                ))}
                {(detailer.specialties || detailer.services).length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{(detailer.specialties || detailer.services).length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Three-button layout */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMessage?.();
            }}
            className="flex-1 h-9 text-xs"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Message
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
            className="flex-1 h-9 text-xs"
          >
            View Details
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRequestQuote?.();
            }}
            className="flex-1 h-9 text-xs bg-blue-600 hover:bg-blue-700"
          >
            Get Quote
          </Button>
        </div>
      </div>
    </div>
  );
}

export function OrderMobileCard({
  order,
  onViewDetails,
  onMessage,
}: {
  order: any;
  onViewDetails?: () => void;
  onMessage?: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base">
              Order #{order.id?.slice(-6) || 'N/A'}
            </h3>
            <p className="text-sm text-gray-600">{order.detailerName || 'Unknown Detailer'}</p>
          </div>
          <Badge className={`text-xs px-2 py-1 ${getStatusColor(order.status)}`}>
            {order.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {order.scheduledDate && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{new Date(order.scheduledDate).toLocaleDateString()}</span>
            </div>
          )}
          {order.totalAmount && (
            <div className="flex items-center justify-between">
              <span>Total:</span>
              <span className="font-semibold text-gray-900">${order.totalAmount}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {onMessage && (
            <Button variant="outline" size="sm" onClick={onMessage} className="flex-1">
              <MessageSquare className="w-4 h-4 mr-1" />
              Message
            </Button>
          )}
          {onViewDetails && (
            <Button size="sm" onClick={onViewDetails} className="flex-1">
              View Details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}