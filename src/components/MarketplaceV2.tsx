import { useState, useMemo } from 'react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Detailer } from '../types';
import { 
  Search, MapPin, Star, SlidersHorizontal, Navigation, Map, List, 
  Clock, CheckCircle2, Award, Image as ImageIcon 
} from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { TrustBadges } from './TrustBadges';
import { DetailerCardSkeleton } from './ui/skeleton-card';
import { rankDetailers } from '../lib/ranking';
import { useGeolocation } from '../hooks/useGeolocation';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollArea } from './ui/scroll-area';

interface MarketplaceV2Props {
  detailers: Detailer[];
  onSelectDetailer: (detailer: Detailer) => void;
  onRequestQuote: (detailer?: Detailer) => void;
}

export function MarketplaceV2({
  detailers,
  onSelectDetailer,
  onRequestQuote,
}: MarketplaceV2Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'distance' | 'rating' | 'responseTime'>('relevance');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const { location, loading: geoLoading } = useGeolocation();

  const rankedDetailers = useMemo(() => {
    if (!location) return [];

    const params = {
      userLat: location.latitude,
      userLng: location.longitude,
      serviceFilter: serviceFilter !== 'all' ? serviceFilter : undefined,
      sortBy: sortBy === 'responseTime' ? 'relevance' : sortBy,
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

    // Response time sorting (mock implementation)
    if (sortBy === 'responseTime') {
      ranked = ranked.sort((a, b) => {
        const aSpeed = a.isPro ? 1 : 2;
        const bSpeed = b.isPro ? 1 : 2;
        return aSpeed - bSpeed;
      });
    }

    return ranked;
  }, [detailers, location, searchQuery, sortBy, priceFilter, serviceFilter]);

  const services = useMemo(() => {
    const allServices = new Set<string>();
    detailers.forEach((d) => d.services.forEach((s) => allServices.add(s)));
    return Array.from(allServices).slice(0, 8); // Show top 8 services
  }, [detailers]);

  const quickServiceFilters = ['Full Detail', 'Exterior Wash', 'Interior Detail', 'Ceramic Coating'];

  if (geoLoading) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b p-4">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <DetailerCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="p-4 space-y-3">
          {/* Location Indicator */}
          {location && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Searching near</p>
                  <p className="text-sm">Your Location</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <Navigation className="w-3 h-3" />
                <span>Live</span>
              </div>
            </motion.div>
          )}

          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search detailers or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-xl"
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded ${viewMode === 'map' ? 'bg-white shadow-sm' : ''}`}
              >
                <Map className="w-4 h-4" />
              </button>
            </div>

            {/* Filters Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-300 hover:bg-gray-50 rounded-xl relative"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  {(priceFilter !== 'all' || serviceFilter !== 'all') && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" aria-describedby="marketplace-filters-description">
                <SheetHeader>
                  <SheetTitle>Filters & Sorting</SheetTitle>
                  <SheetDescription id="marketplace-filters-description">
                    Customize how you view and filter detailers
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm">Sort By</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'relevance', label: 'Best Match', icon: Award },
                        { value: 'distance', label: 'Distance', icon: MapPin },
                        { value: 'rating', label: 'Rating', icon: Star },
                        { value: 'responseTime', label: 'Response', icon: Clock },
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setSortBy(value as any)}
                          className={`
                            p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                            ${sortBy === value 
                              ? 'border-blue-600 bg-blue-50 text-blue-600' 
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-xs">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm">Price Range</label>
                    <div className="flex flex-wrap gap-2">
                      {['all', '$', '$$', '$$$', '$$$$'].map((price) => (
                        <button
                          key={price}
                          onClick={() => setPriceFilter(price)}
                          className={`
                            px-4 py-2 rounded-full text-sm transition-all
                            ${priceFilter === price
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                          `}
                        >
                          {price === 'all' ? 'All' : price}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm">Services</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setServiceFilter('all')}
                        className={`
                          px-4 py-2 rounded-full text-sm transition-all
                          ${serviceFilter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                        `}
                      >
                        All Services
                      </button>
                      {services.map((service) => (
                        <button
                          key={service}
                          onClick={() => setServiceFilter(service)}
                          className={`
                            px-4 py-2 rounded-full text-sm transition-all
                            ${serviceFilter === service
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                          `}
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(priceFilter !== 'all' || serviceFilter !== 'all') && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPriceFilter('all');
                        setServiceFilter('all');
                      }}
                      className="w-full"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Quick Service Chips */}
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-1">
              {quickServiceFilters.map((service) => (
                <button
                  key={service}
                  onClick={() => setServiceFilter(service === serviceFilter ? 'all' : service)}
                  className={`
                    px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all flex-shrink-0
                    ${serviceFilter === service
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'
                    }
                  `}
                >
                  {service}
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600">
              <span className="font-medium">{rankedDetailers.length}</span> detailers found
            </p>
            {sortBy !== 'relevance' && (
              <span className="text-xs text-blue-600">
                Sorted by {sortBy}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-20">
        <AnimatePresence mode="wait">
          {viewMode === 'map' ? (
            <MapView key="map" detailers={rankedDetailers} location={location} onSelectDetailer={onSelectDetailer} />
          ) : (
            <ListView
              key="list"
              detailers={rankedDetailers}
              onSelectDetailer={onSelectDetailer}
              onRequestQuote={onRequestQuote}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// List View Component
function ListView({
  detailers,
  onSelectDetailer,
  onRequestQuote,
}: {
  detailers: any[];
  onSelectDetailer: (detailer: Detailer) => void;
  onRequestQuote: (detailer?: Detailer) => void;
}) {
  if (detailers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col items-center justify-center h-full p-8 text-center"
      >
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="mb-2">No detailers found</h3>
        <p className="text-gray-600 mb-6 max-w-sm">
          We couldn't find any detailers matching your criteria. Try adjusting your filters or request a quote anyway.
        </p>
        <Button onClick={() => onRequestQuote()} className="bg-blue-600 hover:bg-blue-700">
          Request a Quote Anyway
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {detailers.map((detailer, index) => (
        <DetailerCard
          key={detailer.id}
          detailer={detailer}
          index={index}
          onSelect={onSelectDetailer}
          onRequestQuote={onRequestQuote}
        />
      ))}
    </div>
  );
}

// Enhanced Detailer Card with Portfolio Carousel
function DetailerCard({
  detailer,
  index,
  onSelect,
  onRequestQuote,
}: {
  detailer: any;
  index: number;
  onSelect: (detailer: Detailer) => void;
  onRequestQuote: (detailer: Detailer) => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const portfolioPhotos = detailer.portfolioPhotos || detailer.photos || [];
  const displayPhotos = portfolioPhotos.slice(0, 3);

  const responseTime = detailer.isPro ? '< 10 min' : '< 30 min';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Photo Carousel */}
      {displayPhotos.length > 0 && (
        <div className="relative h-48 bg-gray-100">
          <div className="relative h-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <ImageWithFallback
                  src={displayPhotos[currentImageIndex]}
                  alt={`${detailer.businessName} work`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Controls */}
          {displayPhotos.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {displayPhotos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`
                    h-1.5 rounded-full transition-all
                    ${idx === currentImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}
                  `}
                />
              ))}
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <TrustBadges detailer={detailer} />
            {portfolioPhotos.length > 3 && (
              <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm">
                <ImageIcon className="w-3 h-3 mr-1" />
                +{portfolioPhotos.length - 3}
              </Badge>
            )}
          </div>

          {/* Distance Badge */}
          {detailer.distance && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm">
                <MapPin className="w-3 h-3 mr-1" />
                {detailer.distance.toFixed(1)} mi
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3
              onClick={() => onSelect(detailer)}
              className="cursor-pointer hover:text-blue-600 transition-colors line-clamp-1"
            >
              {detailer.businessName}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{detailer.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({detailer.reviewCount})</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-600">{detailer.priceRange}</span>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">{responseTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-gray-600 line-clamp-2">{detailer.bio}</p>

        {/* Services */}
        <div className="flex flex-wrap gap-1.5">
          {detailer.services.slice(0, 3).map((service: string) => (
            <Badge key={service} variant="secondary" className="text-xs">
              {service}
            </Badge>
          ))}
          {detailer.services.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{detailer.services.length - 3}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>{detailer.completedJobs} jobs</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{detailer.serviceArea}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onSelect(detailer)}
            variant="outline"
            className="flex-1"
          >
            View Profile
          </Button>
          <Button
            onClick={() => onRequestQuote(detailer)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Request Quote
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Map View Component (Placeholder)
function MapView({
  detailers,
  location,
  onSelectDetailer,
}: {
  detailers: any[];
  location: any;
  onSelectDetailer: (detailer: Detailer) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex items-center justify-center bg-gray-100 p-8"
    >
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Map className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="mb-2">Map View</h3>
        <p className="text-gray-600 mb-4">
          Interactive map view with {detailers.length} detailers near you. This feature would integrate with Google Maps or Mapbox in production.
        </p>
        <div className="bg-white rounded-xl p-4 text-left space-y-2">
          {detailers.slice(0, 3).map((d) => (
            <button
              key={d.id}
              onClick={() => onSelectDetailer(d)}
              className="w-full p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  {d.businessName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{d.businessName}</p>
                  <p className="text-xs text-gray-500">{d.distance?.toFixed(1)} mi away</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
