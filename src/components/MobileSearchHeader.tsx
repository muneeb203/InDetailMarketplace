import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, X, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface MobileSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'relevance' | 'distance' | 'rating';
  onSortByChange: (sort: 'relevance' | 'distance' | 'rating') => void;
  priceFilter: string;
  onPriceFilterChange: (price: string) => void;
  serviceFilter: string;
  onServiceFilterChange: (service: string) => void;
  resultsCount?: number;
  placeholder?: string;
}

export function MobileSearchHeader({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  priceFilter,
  onPriceFilterChange,
  serviceFilter,
  onServiceFilterChange,
  resultsCount,
  placeholder = "Search detailers...",
}: MobileSearchHeaderProps) {
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = [
    sortBy !== 'relevance' ? 1 : 0,
    priceFilter !== 'all' ? 1 : 0,
    serviceFilter !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearAllFilters = () => {
    onSortByChange('relevance');
    onPriceFilterChange('all');
    onServiceFilterChange('all');
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-20">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-12 h-12 text-base"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 px-3"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-blue-600 text-white text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Results Count */}
        {resultsCount !== undefined && (
          <p className="text-sm text-gray-600 mt-2">
            {resultsCount} detailer{resultsCount !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4 space-y-4">
            {/* Filter Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'relevance', label: 'Relevance' },
                  { value: 'distance', label: 'Distance' },
                  { value: 'rating', label: 'Rating' },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSortByChange(option.value as any)}
                    className="flex-1 min-w-0"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All Prices' },
                  { value: '$', label: '$' },
                  { value: '$$', label: '$$' },
                  { value: '$$$', label: '$$$' },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={priceFilter === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPriceFilterChange(option.value)}
                    className="flex-1 min-w-0"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'all', label: 'All Services' },
                  { value: 'exterior', label: 'Exterior' },
                  { value: 'interior', label: 'Interior' },
                  { value: 'full-detail', label: 'Full Detail' },
                  { value: 'ceramic-coating', label: 'Ceramic Coating' },
                  { value: 'paint-correction', label: 'Paint Correction' },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={serviceFilter === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onServiceFilterChange(option.value)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <Button
              onClick={() => setShowFilters(false)}
              className="w-full"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}