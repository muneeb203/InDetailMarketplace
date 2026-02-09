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
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="relative">
                {detailer.photos.length > 0 && (
                  <ImageWithFallback
                    src={detailer.photos[0]}
                    alt={detailer.businessName}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="absolute top-3 left-3 right-3">
                  <div className="flex items-start justify-between mb-2">
                    <TrustBadges detailer={detailer} />
                    <Badge className="bg-white/95 text-gray-700 border-0 backdrop-blur-sm">
                      <MapPin className="w-3 h-3 mr-1" />
                      {detailer.distance} mi
                    </Badge>
                  </div>
                  
                  {/* Additional Badges */}
                  <div className="flex gap-1.5 flex-wrap">
                    {(detailer.commPreference === 'voice' || detailer.commPreference === 'voice-chat') && (
                      <PhoneFriendlyBadge className="bg-white/95 backdrop-blur-sm" />
                    )}
                    {detailer.introVideoUrl && (
                      <IntroVideoBadge />
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-2">
                  <h3 className="mb-1">{detailer.businessName}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{detailer.rating.toFixed(1)}</span>
                      <span className="text-gray-400">({detailer.reviewCount})</span>
                    </div>
                    <span>•</span>
                    <span>{detailer.priceRange}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{detailer.serviceArea}</p>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{detailer.bio}</p>

                <div className="flex gap-2 flex-wrap mb-4">
                  {detailer.services.slice(0, 2).map((service) => (
                    <Badge key={service} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {detailer.waterSourceRequirement && (
                    <WaterSourcePill requirement={detailer.waterSourceRequirement} />
                  )}
                  {detailer.services.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{detailer.services.length - 2} more
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onRequestQuote(detailer)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm h-10"
                    >
                      Request Quote
                    </Button>
                    <Button
                      onClick={() => onSelectDetailer(detailer)}
                      variant="outline"
                      className="flex-1 border-gray-300 hover:bg-gray-50 h-10"
                    >
                      View Profile
                    </Button>
                  </div>
                  
                  {(detailer.commPreference === 'voice' || detailer.commPreference === 'voice-chat') && (
                    <Button
                      onClick={() => handleRequestCallback(detailer)}
                      variant="outline"
                      className="w-full border-green-500 text-green-600 hover:bg-green-50 h-9"
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
