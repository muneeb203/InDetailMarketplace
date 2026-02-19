import { useState, useMemo, useEffect } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Detailer } from '../types';
import { Search, MapPin, Star, SlidersHorizontal, Navigation, Phone, Video } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { TrustBadges } from './TrustBadges';
import { DetailerCardSkeleton } from './ui/skeleton-card';
import { rankDetailers, RankedDetailer } from '../lib/ranking';
import { useGeolocation } from '../hooks/useGeolocation';
import { motion } from 'motion/react';
import { PhoneFriendlyBadge } from './CommunicationPreferences';
import { WaterSourcePill } from './WaterSourceQuestion';
import { IntroVideoBadge } from './DetailerIntroVideo';
import { CallbackScheduler } from './CallbackScheduler';
import { toast } from "sonner";

interface MarketplaceSearchEnhancedProps {
  detailers: Detailer[];
  onSelectDetailer: (detailer: Detailer) => void;
  onRequestQuote: (detailer: Detailer) => void;
}

export function MarketplaceSearchEnhanced({
  detailers,
  onSelectDetailer,
  onRequestQuote,
}: MarketplaceSearchEnhancedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'distance' | 'rating'>('relevance');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [selectedDetailerForCallback, setSelectedDetailerForCallback] = useState<Detailer | null>(null);
  const { location, loading: geoLoading } = useGeolocation();

  const handleRequestCallback = (detailer: Detailer) => {
    setSelectedDetailerForCallback(detailer);
    setShowCallbackModal(true);
  };

  const handleScheduleCallback = (date: string, timeWindow: string) => {
    toast.success(`Callback scheduled with ${selectedDetailerForCallback?.businessName}`);
    setShowCallbackModal(false);
  };

  const rankedDetailers = useMemo(() => {
    if (!location) return [];

    const params = {
      userLat: location.latitude,
      userLng: location.longitude,
      serviceFilter: serviceFilter !== 'all' ? serviceFilter : undefined,
      sortBy,
    };

    let ranked = rankDetailers(detailers, params);

    // Search filter
    if (searchQuery) {
      ranked = ranked.filter(
        (d) =>
          d.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      ranked = ranked.filter((d) => d.priceRange === priceFilter);
    }

    return ranked;
  }, [detailers, location, searchQuery, sortBy, priceFilter, serviceFilter]);

  const services = useMemo(() => {
    const allServices = new Set<string>();
    detailers.forEach((d) => d.services.forEach((s) => allServices.add(s)));
    return Array.from(allServices);
  }, [detailers]);

  if (geoLoading) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b p-4">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <DetailerCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search detailers or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" aria-describedby="enhanced-filters-description">
                <SheetHeader>
                  <SheetTitle>Filters & Sorting</SheetTitle>
                  <SheetDescription id="enhanced-filters-description">
                    Refine your detailer search with advanced filters
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm">Sort By</label>
                    <Select
                      value={sortBy}
                      onValueChange={(value: any) => setSortBy(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance (Recommended)</SelectItem>
                        <SelectItem value="distance">Distance</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm">Price Range</label>
                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="$">$ - Budget</SelectItem>
                        <SelectItem value="$$">$$ - Moderate</SelectItem>
                        <SelectItem value="$$$">$$$ - Premium</SelectItem>
                        <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm">Service Type</label>
                    <Select value={serviceFilter} onValueChange={setServiceFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        {services.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{rankedDetailers.length} detailers near you</p>
            {location && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Navigation className="w-3 h-3" />
                <span>Location enabled</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailer List */}
      <div className="flex-1 overflow-auto pb-20">
        <div className="p-4 space-y-3">
          {rankedDetailers.map((detailer, index) => (
            <motion.div
              key={detailer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectDetailer(detailer)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectDetailer(detailer)}
              className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="relative group">
                {/* Main Image - logo (profile picture) first, then portfolio, then avatar */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  {(detailer.logo ?? detailer.photos?.[0] ?? detailer.avatar) ? (
                    <ImageWithFallback
                      src={detailer.logo ?? detailer.photos?.[0] ?? detailer.avatar}
                      alt={detailer.businessName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                          <MapPin className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">No image available</p>
                      </div>
                    </div>
                  )}
                  {/* Gradient overlay for better badge visibility */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
                </div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3">
                  <div className="flex items-start justify-between mb-2">
                    <TrustBadges detailer={detailer} />
                    <Badge className="bg-white/95 text-gray-700 border-0 backdrop-blur-sm shadow-lg">
                      <MapPin className="w-3 h-3 mr-1" />
                      {detailer.distance} mi
                    </Badge>
                  </div>
                  
                  {/* Additional Badges */}
                  <div className="flex gap-1.5 flex-wrap">
                    {(detailer.commPreference === 'voice' || detailer.commPreference === 'voice-chat') && (
                      <PhoneFriendlyBadge className="bg-white/95 backdrop-blur-sm shadow-lg" />
                    )}
                    {detailer.introVideoUrl && (
                      <IntroVideoBadge />
                    )}
                  </div>
                </div>

                {/* Bottom Info Overlay */}
                {detailer.isPro && (
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-lg">
                      ⭐ PRO
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-5">
                {/* Business Name & Rating */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-1.5 line-clamp-1">
                    {detailer.businessName}
                  </h3>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">{detailer.rating.toFixed(1)}</span>
                      <span className="text-gray-500">({detailer.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <span className="font-semibold">{detailer.priceRange}</span>
                    </div>
                    {detailer.completedJobs > 0 && (
                      <div className="text-xs text-gray-500">
                        {detailer.completedJobs} jobs
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {[detailer.location !== 'Unknown' && detailer.location, detailer.serviceRadius && `${detailer.serviceRadius} mi radius`].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-700 mb-4 line-clamp-2 leading-relaxed">{detailer.bio}</p>

                {/* Services Tags */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {detailer.services.slice(0, 3).map((service) => (
                    <Badge key={service} variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100">
                      {service}
                    </Badge>
                  ))}
                  {detailer.waterSourceRequirement && (
                    <WaterSourcePill requirement={detailer.waterSourceRequirement} />
                  )}
                  {detailer.services.length > 3 && (
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                      +{detailer.services.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Action Buttons - stopPropagation so card click doesn't fire */}
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestQuote(detailer);
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all h-11 font-semibold"
                    >
                      Request Service
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDetailer(detailer);
                      }}
                      variant="outline"
                      className="flex-1 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 h-11 font-semibold transition-all"
                    >
                      View Details
                    </Button>
                  </div>
                  
                  {(detailer.commPreference === 'voice' || detailer.commPreference === 'voice-chat') && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestCallback(detailer);
                      }}
                      variant="outline"
                      className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 h-10 font-medium transition-all"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Request a Call
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {rankedDetailers.length === 0 && (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="mb-2">No detailers found</h3>
              <p className="text-gray-500">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Callback Scheduler Modal */}
      {selectedDetailerForCallback && (
        <CallbackScheduler
          open={showCallbackModal}
          onClose={() => setShowCallbackModal(false)}
          detailerName={selectedDetailerForCallback.businessName}
          onSchedule={handleScheduleCallback}
        />
      )}
    </div>
  );
}
