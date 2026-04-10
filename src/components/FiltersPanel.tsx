import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Card } from './ui/card';
import { X, SlidersHorizontal, MapPin, Star, DollarSign, Calendar, Sparkles, Phone, Droplet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { WaterSourceRequirement } from '../types';

const servicesList = [
  'Exterior Wash',
  'Interior Deep Clean',
  'Ceramic Coating',
  'Paint Correction',
  'Engine Bay Clean',
  'Headlight Restoration',
  'Odor Removal',
  'Clay Bar Treatment',
  'Fleet Services',
  'RV Detailing',
  'Wax & Polish',
  'Pet Hair Removal',
  'Window Tinting',
];

const waterSourceOptions = [
  { value: 'any' as const, label: 'Any' },
  { value: 'required' as WaterSourceRequirement, label: 'Water Required' },
  { value: 'not-required' as WaterSourceRequirement, label: 'Water Not Needed' },
];

const ratingOptions = [
  { value: 5, label: '5 Stars Only' },
  { value: 4.5, label: '4.5+ Stars' },
  { value: 4, label: '4+ Stars' },
  { value: 3.5, label: '3.5+ Stars' },
];

const availabilityOptions = [
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'custom', label: 'Custom Date' },
];

export interface FilterState {
  distance: number;
  minRating: number | null;
  priceRange: [number, number];
  availability: string | null;
  services: string[];
  phoneFriendly: boolean;
  waterSource: 'any' | WaterSourceRequirement | null;
}

interface FiltersPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApply: () => void;
  onReset: () => void;
}

export function FiltersPanel({ filters, onFiltersChange, onApply, onReset }: FiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleService = (service: string) => {
    const newServices = filters.services.includes(service)
      ? filters.services.filter(s => s !== service)
      : [...filters.services, service];
    onFiltersChange({ ...filters, services: newServices });
  };

  const handleReset = () => {
    onReset();
    setIsOpen(false);
  };

  const handleApply = () => {
    onApply();
    setIsOpen(false);
  };

  const activeFiltersCount = 
    (filters.minRating ? 1 : 0) +
    (filters.availability ? 1 : 0) +
    filters.services.length +
    (filters.distance < 50 ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0) +
    (filters.phoneFriendly ? 1 : 0) +
    (filters.waterSource && filters.waterSource !== 'any' ? 1 : 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative gap-2 h-11 px-4 border-2 hover:border-[#0078FF] hover:text-[#0078FF] transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-1 h-5 min-w-5 px-1.5 bg-[#0078FF] text-white">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#0078FF]/5 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0078FF] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <SlidersHorizontal className="w-5 h-5 text-white" />
              </div>
              <SheetTitle className="text-xl">Filters & Sorting</SheetTitle>
            </div>
            {activeFiltersCount > 0 && (
              <Badge variant="outline" className="bg-blue-50 text-[#0078FF] border-blue-200">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
        </SheetHeader>

        {/* Filters Content */}
        <div className="flex-1 overflow-y-auto">
          <Accordion type="multiple" defaultValue={['distance', 'services', 'rating', 'price', 'availability']} className="px-6">
            {/* Distance Range */}
            <AccordionItem value="distance" className="border-b border-gray-200">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#0078FF]" />
                  <span>Distance Range</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Within</span>
                    <span className="text-[#0078FF]">{filters.distance} miles</span>
                  </div>
                  <Slider
                    value={[filters.distance]}
                    onValueChange={(value) => onFiltersChange({ ...filters, distance: value[0] })}
                    min={5}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>5 mi</span>
                    <span>50 mi</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Services */}
            <AccordionItem value="services" className="border-b border-gray-200">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#0078FF]" />
                  <span>Services Provided</span>
                  {filters.services.length > 0 && (
                    <Badge className="ml-2 bg-[#0078FF] text-white h-5 min-w-5 px-1.5">
                      {filters.services.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="flex flex-wrap gap-2">
                  {servicesList.map((service) => {
                    const isSelected = filters.services.includes(service);
                    return (
                      <motion.button
                        key={service}
                        onClick={() => toggleService(service)}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-2 rounded-xl text-sm transition-all border-2 ${
                          isSelected
                            ? 'bg-[#0078FF] text-white border-[#0078FF] shadow-md shadow-blue-200'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#0078FF] hover:text-[#0078FF]'
                        }`}
                      >
                        {service}
                      </motion.button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Rating */}
            <AccordionItem value="rating" className="border-b border-gray-200">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-[#0078FF]" />
                  <span>Minimum Rating</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-2">
                  {ratingOptions.map((option) => {
                    const isSelected = filters.minRating === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => onFiltersChange({ 
                          ...filters, 
                          minRating: isSelected ? null : option.value 
                        })}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all border-2 flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#0078FF] text-white border-[#0078FF] shadow-md shadow-blue-200'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#0078FF]'
                        }`}
                      >
                        <span>{option.label}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const fillValue = option.value - i;
                            return (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  fillValue >= 1
                                    ? isSelected ? 'fill-white text-white' : 'fill-yellow-400 text-yellow-400'
                                    : fillValue > 0
                                    ? isSelected ? 'fill-white/50 text-white' : 'fill-yellow-400/50 text-yellow-400'
                                    : isSelected ? 'text-white/30' : 'text-gray-300'
                                }`}
                              />
                            );
                          })}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Price Range */}
            <AccordionItem value="price" className="border-b border-gray-200">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-[#0078FF]" />
                  <span>Price Range</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Price</span>
                    <span className="text-[#0078FF]">
                      ${filters.priceRange[0]} - ${filters.priceRange[1]}
                    </span>
                  </div>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value as [number, number] })}
                    min={0}
                    max={1000}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>$0</span>
                    <span>$1,000+</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Phone-Friendly */}
            <AccordionItem value="phone-friendly" className="border-b border-gray-200">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#0078FF]" />
                  <span>Communication</span>
                  {filters.phoneFriendly && (
                    <Badge className="ml-2 bg-green-100 text-green-700 border-green-300 h-5 px-1.5">
                      Phone-Friendly
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <motion.button
                  onClick={() => onFiltersChange({ ...filters, phoneFriendly: !filters.phoneFriendly })}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full px-4 py-3 rounded-xl text-sm transition-all border-2 flex items-center gap-3 ${
                    filters.phoneFriendly
                      ? 'bg-green-50 text-green-700 border-green-500 shadow-md shadow-green-200'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-green-500'
                  }`}
                  aria-label={filters.phoneFriendly ? 'Remove phone-friendly filter' : 'Filter by phone-friendly detailers'}
                >
                  <Phone className={`w-5 h-5 ${filters.phoneFriendly ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="flex-1 text-left">Phone-Friendly Detailers Only</span>
                  {filters.phoneFriendly && <Badge className="bg-green-600 text-white">Active</Badge>}
                </motion.button>
                <p className="text-xs text-gray-600 mt-2">
                  Show detailers who prefer phone calls for quick communication
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Water Source */}
            <AccordionItem value="water-source" className="border-b border-gray-200">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Droplet className="w-5 h-5 text-[#0078FF]" />
                  <span>Water Source</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-2">
                  {waterSourceOptions.map((option) => {
                    const isSelected = filters.waterSource === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => onFiltersChange({ 
                          ...filters, 
                          waterSource: isSelected ? 'any' : option.value 
                        })}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all border-2 text-left flex items-center gap-3 ${
                          isSelected
                            ? 'bg-[#0078FF] text-white border-[#0078FF] shadow-md shadow-blue-200'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#0078FF]'
                        }`}
                        aria-label={`Filter by ${option.label.toLowerCase()}`}
                      >
                        <Droplet className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                        {option.label}
                      </motion.button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Filter detailers by their water source requirements
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Availability */}
            <AccordionItem value="availability" className="border-b-0">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#0078FF]" />
                  <span>Availability</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-2">
                  {availabilityOptions.map((option) => {
                    const isSelected = filters.availability === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => onFiltersChange({ 
                          ...filters, 
                          availability: isSelected ? null : option.value 
                        })}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all border-2 text-left ${
                          isSelected
                            ? 'bg-[#0078FF] text-white border-[#0078FF] shadow-md shadow-blue-200'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#0078FF]'
                        }`}
                      >
                        {option.label}
                      </motion.button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-white space-y-3">
          <Button
            onClick={handleApply}
            className="w-full h-12 bg-[#0078FF] hover:bg-[#0056CC] text-white shadow-lg shadow-blue-200/50"
          >
            Apply Filters
            {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
          </Button>
          {activeFiltersCount > 0 && (
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full h-10 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Reset All Filters
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Standalone Filters Panel (for dedicated filters page)
export function FiltersPanelStandalone({ filters, onFiltersChange, onApply, onReset }: FiltersPanelProps) {
  const activeFiltersCount = 
    (filters.minRating ? 1 : 0) +
    (filters.availability ? 1 : 0) +
    filters.services.length +
    (filters.distance < 50 ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0);

  const toggleService = (service: string) => {
    const newServices = filters.services.includes(service)
      ? filters.services.filter(s => s !== service)
      : [...filters.services, service];
    onFiltersChange({ ...filters, services: newServices });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF5FF] to-white pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0078FF] to-[#0056CC] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <SlidersHorizontal className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl">Filters & Sorting</h1>
                {activeFiltersCount > 0 && (
                  <p className="text-sm text-gray-600">{activeFiltersCount} filters active</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <Accordion type="multiple" defaultValue={['distance', 'services', 'rating', 'price', 'availability']}>
          {/* Distance Range */}
          <AccordionItem value="distance" className="mb-4">
            <Card className="border-2 border-gray-200 overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0078FF]/10 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#0078FF]" />
                  </div>
                  <span className="text-lg">Distance Range</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Within</span>
                    <span className="text-xl text-[#0078FF]">{filters.distance} miles</span>
                  </div>
                  <Slider
                    value={[filters.distance]}
                    onValueChange={(value) => onFiltersChange({ ...filters, distance: value[0] })}
                    min={5}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>5 miles</span>
                    <span>50 miles</span>
                  </div>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Services - Use same pattern for other sections */}
          {/* Rating, Price, Availability sections follow similar structure */}
        </Accordion>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200 shadow-xl">
        <div className="max-w-4xl mx-auto flex gap-3">
          {activeFiltersCount > 0 && (
            <Button
              onClick={onReset}
              variant="outline"
              className="flex-1 h-12 border-2 border-gray-300 hover:bg-gray-50"
            >
              Reset Filters
            </Button>
          )}
          <Button
            onClick={onApply}
            className={`${activeFiltersCount > 0 ? 'flex-1' : 'w-full'} h-12 bg-[#0078FF] hover:bg-[#0056CC] text-white shadow-lg shadow-blue-200/50`}
          >
            Apply Filters
            {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
