import { useState, useMemo } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Detailer } from '../types';
import { Search, MapPin, Star, SlidersHorizontal, Crown } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MarketplaceSearchProps {
  detailers: Detailer[];
  onSelectDetailer: (detailer: Detailer) => void;
  onRequestQuote: (detailer: Detailer) => void;
}

export function MarketplaceSearch({ detailers, onSelectDetailer, onRequestQuote }: MarketplaceSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  const filteredDetailers = useMemo(() => {
    let filtered = [...detailers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(d => 
        d.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(d => d.priceRange === priceFilter);
    }

    // Service filter
    if (serviceFilter !== 'all') {
      filtered = filtered.filter(d => d.services.includes(serviceFilter));
    }

    // Sorting
    filtered.sort((a, b) => {
      // Pro detailers always first
      if (a.isPro && !b.isPro) return -1;
      if (!a.isPro && b.isPro) return 1;

      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.priceRange.length - b.priceRange.length;
        default:
          return 0;
      }
    });

    return filtered;
  }, [detailers, searchQuery, sortBy, priceFilter, serviceFilter]);

  const services = useMemo(() => {
    const allServices = new Set<string>();
    detailers.forEach(d => d.services.forEach(s => allServices.add(s)));
    return Array.from(allServices);
  }, [detailers]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search detailers or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" aria-describedby="filter-sheet-description">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription id="filter-sheet-description">
                    Refine your search by sorting and filtering detailers
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm">Sort By</label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="distance">Distance</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
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
                        {services.map(service => (
                          <SelectItem key={service} value={service}>{service}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredDetailers.length} detailers near you
            </p>
          </div>
        </div>
      </div>

      {/* Detailer List */}
      <div className="flex-1 overflow-auto pb-20">
        <div className="p-4 space-y-3">
          {filteredDetailers.map(detailer => (
            <div
              key={detailer.id}
              className="bg-white rounded-xl shadow-sm border overflow-hidden"
            >
              <div className="relative">
                {(detailer.logo ?? detailer.photos?.[0] ?? detailer.avatar) && (
                  <ImageWithFallback
                    src={detailer.logo ?? detailer.photos?.[0] ?? detailer.avatar}
                    alt={detailer.businessName}
                    className="w-full h-48 object-cover"
                  />
                )}
                {detailer.isPro && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-yellow-500 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      Pro
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="mb-2">
                  <h3 className="mb-1">{detailer.businessName}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{detailer.rating.toFixed(1)}</span>
                      <span>({detailer.reviewCount})</span>
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
                  {detailer.services.slice(0, 3).map(service => (
                    <Badge key={service} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {detailer.services.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{detailer.services.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => onRequestQuote(detailer)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Request Quote
                  </Button>
                  <Button
                    onClick={() => onSelectDetailer(detailer)}
                    variant="outline"
                    className="flex-1"
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredDetailers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No detailers found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
