import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { MapPin, Car, Bell, Check, ChevronDown, Search, Loader2, Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from './ui/utils';
import { reverseGeocode, searchLocations, type LocationResult } from '../services/geocodingService';

interface ClientOnboardingProps {
  userName: string;
  onComplete: (data: {
    location: string;
    location_lat: number | null;
    location_lng: number | null;
    vehicle?: { make: string; model: string; year: number };
    notifications: boolean;
  }) => void;
}

const MAKES = [
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Buick', 'Cadillac', 'Chevrolet',
  'Chrysler', 'Dodge', 'Ferrari', 'Fiat', 'Ford', 'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti',
  'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln', 'Maserati', 'Mazda',
  'McLaren', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Porsche', 'Ram', 'Rolls-Royce',
  'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
].sort();

const MIN_VEHICLE_YEAR = 1970;

function getCurrentYear() {
  return new Date().getFullYear();
}

export function ClientOnboarding({ userName, onComplete }: ClientOnboardingProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Step 1: Location — display string in input; lat/lng stored for DB
  const [locationDisplay, setLocationDisplay] = useState('');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationResult[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for manual location input (autocomplete)
  const DEBOUNCE_MS = 400;
  useEffect(() => {
    const q = locationDisplay.trim();
    if (!q || q.length < 2) {
      setLocationSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(q);
        setLocationSuggestions(results);
        setSuggestionsOpen(true);
      } catch {
        setLocationSuggestions([]);
      } finally {
        searchTimeoutRef.current = null;
      }
    }, DEBOUNCE_MS);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [locationDisplay]);

  const handleUseCurrentLocation = useCallback(async () => {
    setLocationError(null);
    setLocationLoading(true);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { display, lat, lng } = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );
          setLocationDisplay(display);
          setLocationLat(lat);
          setLocationLng(lng);
          setLocationSuggestions([]);
          setSuggestionsOpen(false);
        } catch (err) {
          setLocationError('Could not resolve your location. Please try manual entry.');
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Please enter your location manually.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError('Location unavailable. Please enter your location manually.');
        } else {
          setLocationError('Could not get your location. Please try again or enter manually.');
        }
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const handleSelectSuggestion = useCallback((result: LocationResult) => {
    setLocationDisplay(result.display);
    setLocationLat(result.lat);
    setLocationLng(result.lng);
    setSuggestionsOpen(false);
    setLocationSuggestions([]);
    setLocationError(null);
  }, []);

  const hasValidLocation = locationLat != null && locationLng != null;

  // Step 2: Vehicle (optional)
  const [skipVehicle, setSkipVehicle] = useState(false);
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [makeOpen, setMakeOpen] = useState(false);
  const [makeSearch, setMakeSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const filteredMakes = useMemo(() => {
    if (!makeSearch.trim()) return MAKES;
    const q = makeSearch.trim().toLowerCase();
    return MAKES.filter((m) => m.toLowerCase().includes(q));
  }, [makeSearch]);

  // Sync highlighted index when open or list changes; scroll into view
  useEffect(() => {
    if (!makeOpen) return;
    const idx = filteredMakes.indexOf(vehicleMake);
    const next = idx >= 0 ? idx : 0;
    const clamped = Math.min(next, Math.max(0, filteredMakes.length - 1));
    setHighlightedIndex(clamped);
    optionRefs.current[clamped]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [makeOpen, filteredMakes, vehicleMake]);

  useEffect(() => {
    if (makeOpen && filteredMakes.length > 0 && highlightedIndex >= filteredMakes.length) {
      setHighlightedIndex(Math.max(0, filteredMakes.length - 1));
    }
  }, [makeOpen, filteredMakes.length, highlightedIndex]);

  const selectMake = (make: string) => {
    setVehicleMake(make);
    setMakeOpen(false);
    setMakeSearch('');
  };

  const handleMakeKeyDown = (e: React.KeyboardEvent) => {
    if (filteredMakes.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((i) => (i + 1) % filteredMakes.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((i) => (i - 1 + filteredMakes.length) % filteredMakes.length);
        break;
      case 'Enter':
        e.preventDefault();
        selectMake(filteredMakes[highlightedIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        setMakeOpen(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    optionRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [highlightedIndex]);

  // Step 3: Notifications
  const [notifications, setNotifications] = useState(true);

  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const year = vehicleYear ? parseInt(vehicleYear, 10) : NaN;
    const validYear = !Number.isNaN(year) && year >= MIN_VEHICLE_YEAR && year <= getCurrentYear()
      ? year
      : undefined;
    onComplete({
      location: locationDisplay,
      location_lat: locationLat,
      location_lng: locationLng,
      vehicle:
        !skipVehicle && vehicleMake && vehicleModel && validYear != null
          ? {
              make: vehicleMake,
              model: vehicleModel,
              year: validYear,
            }
          : undefined,
      notifications,
    });
  };

  const currentYear = getCurrentYear();
  const yearNum = vehicleYear ? parseInt(vehicleYear, 10) : NaN;
  const isYearValid = !Number.isNaN(yearNum) && yearNum >= MIN_VEHICLE_YEAR && yearNum <= currentYear;

  const canProceed = () => {
    if (step === 1) return hasValidLocation;
    if (step === 2) return skipVehicle || (vehicleMake && vehicleModel && vehicleYear && isYearValid);
    return true;
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      setVehicleYear('');
      return;
    }
    // Allow only digits so user can type e.g. "2", "20", "202", "2024" without clamping mid-typing
    if (!/^\d+$/.test(raw)) return;
    // Optional: limit length to 4 digits
    if (raw.length > 4) return;
    setVehicleYear(raw);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col p-6">
      <div className="w-full max-w-md mx-auto space-y-6 flex-1">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1>Welcome, {userName}!</h1>
          <p className="text-sm text-gray-600">
            Let's get your account set up in just a few steps
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 text-center">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1"
        >
          {/* Step 1: Location */}
          {step === 1 && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-center space-y-2">
                  <h3>Where are you located?</h3>
                  <p className="text-sm text-gray-600">
                    We'll find detailers near you
                  </p>
                </div>
                <div ref={suggestionsRef} className="relative">
                  <Input
                    value={locationDisplay}
                    onChange={(e) => {
                      setLocationDisplay(e.target.value);
                      setLocationLat(null);
                      setLocationLng(null);
                    }}
                    placeholder="City or area (e.g. San Francisco, CA)"
                    className="text-center"
                    autoComplete="off"
                  />
                  {suggestionsOpen && locationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {locationSuggestions.map((s, i) => (
                        <button
                          key={`${s.lat}-${s.lng}-${i}`}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                          onClick={() => handleSelectSuggestion(s)}
                        >
                          {s.display}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {locationError && (
                  <p className="text-sm text-red-600 text-center">{locationError}</p>
                )}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleUseCurrentLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  Use Current Location
                </Button>
              </div>
            </Card>
          )}

          {/* Step 2: Vehicle */}
          {step === 2 && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto">
                  <Car className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-center space-y-2">
                  <h3>Tell us about your vehicle</h3>
                  <p className="text-sm text-gray-600">
                    This helps us provide accurate quotes (optional)
                  </p>
                </div>

                {!skipVehicle ? (
                  <>
                    <div className="relative overflow-visible">
                      <label className="text-sm mb-2 block">Make</label>
                      <Popover
                        open={makeOpen}
                        onOpenChange={(open) => {
                          setMakeOpen(open);
                          if (!open) setMakeSearch('');
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            aria-haspopup="listbox"
                            aria-expanded={makeOpen}
                            aria-label={vehicleMake ? `Make: ${vehicleMake}` : 'Select make'}
                            className={cn(
                              'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-input-background px-3 py-2 text-sm',
                              'hover:bg-input-background/80 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                              !vehicleMake && 'text-muted-foreground'
                            )}
                          >
                            <span className="truncate">{vehicleMake || 'Select make'}</span>
                            <ChevronDown className={cn('h-4 w-4 shrink-0 opacity-50 transition-transform', makeOpen && 'rotate-180')} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          side="top"
                          sideOffset={8}
                          avoidCollisions
                          collisionPadding={16}
                          onOpenAutoFocus={(e) => e.preventDefault()}
                          onCloseAutoFocus={(e) => e.preventDefault()}
                          className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[200px] max-w-[320px] z-[200] border border-gray-200 bg-white shadow-xl overflow-hidden rounded-md"
                          onKeyDown={handleMakeKeyDown}
                        >
                          <div className="p-2 border-b border-gray-100 bg-white">
                            <div className="relative">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                              <input
                                type="text"
                                placeholder="Search make..."
                                value={makeSearch}
                                onChange={(e) => setMakeSearch(e.target.value)}
                                onKeyDown={(e) => {
                                  if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
                                    e.preventDefault();
                                    handleMakeKeyDown(e as unknown as React.KeyboardEvent<HTMLDivElement>);
                                  } else {
                                    e.stopPropagation();
                                  }
                                }}
                                autoFocus
                                className="w-full h-8 pl-8 pr-3 rounded-md border border-gray-200 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          <div
                            ref={listRef}
                            role="listbox"
                            className="max-h-48 overflow-y-auto overflow-x-hidden overscroll-contain p-1"
                            tabIndex={-1}
                          >
                            {filteredMakes.length === 0 ? (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                No makes found
                              </div>
                            ) : (
                              filteredMakes.map((make, i) => (
                                <button
                                  key={make}
                                  ref={(el) => { optionRefs.current[i] = el; }}
                                  type="button"
                                  role="option"
                                  aria-selected={vehicleMake === make || highlightedIndex === i}
                                  onClick={() => selectMake(make)}
                                  className={cn(
                                    'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                                    vehicleMake === make && 'bg-blue-100 text-blue-900 font-medium',
                                    highlightedIndex === i && vehicleMake !== make && 'bg-gray-100',
                                    'hover:bg-gray-100 focus:bg-gray-100 outline-none'
                                  )}
                                >
                                  {make}
                                </button>
                              ))
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="text-sm mb-2 block">Model</label>
                      <Input
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        placeholder="e.g., Civic, Model 3"
                      />
                    </div>
                    <div>
                      <label className="text-sm mb-2 block">Year</label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0 h-10 w-10"
                          onClick={() => {
                            const num = vehicleYear ? parseInt(vehicleYear, 10) : currentYear;
                            const next = Number.isNaN(num) ? currentYear : Math.max(MIN_VEHICLE_YEAR, num - 1);
                            setVehicleYear(String(next));
                          }}
                          aria-label="Decrease year"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          inputMode="numeric"
                          value={vehicleYear}
                          onChange={handleYearChange}
                          onBlur={() => {
                            if (vehicleYear) {
                              const num = parseInt(vehicleYear, 10);
                              if (!Number.isNaN(num)) {
                                if (num < MIN_VEHICLE_YEAR) setVehicleYear(String(MIN_VEHICLE_YEAR));
                                else if (num > currentYear) setVehicleYear(String(currentYear));
                              }
                            }
                          }}
                          placeholder={String(currentYear)}
                          min={MIN_VEHICLE_YEAR}
                          max={currentYear}
                          className={cn('flex-1 text-center', !vehicleYear ? '' : !isYearValid ? 'border-red-500 focus-visible:ring-red-500' : '')}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0 h-10 w-10"
                          onClick={() => {
                            const num = vehicleYear ? parseInt(vehicleYear, 10) : currentYear - 1;
                            const next = Number.isNaN(num) ? currentYear : Math.min(currentYear, num + 1);
                            setVehicleYear(String(next));
                          }}
                          aria-label="Increase year"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Between {MIN_VEHICLE_YEAR} and {currentYear}
                      </p>
                      {vehicleYear && !isYearValid && (
                        <p className="text-xs text-red-600 mt-1">
                          Enter a year between {MIN_VEHICLE_YEAR} and {currentYear}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    You can add vehicle details later in your profile
                  </div>
                )}

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setSkipVehicle(!skipVehicle)}
                >
                  {skipVehicle ? 'Add Vehicle' : 'Skip for Now'}
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Notifications */}
          {step === 3 && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                  <Bell className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                  <h3>Stay updated</h3>
                  <p className="text-sm text-gray-600">
                    Get notified about quotes, booking updates, and special offers
                  </p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="text-sm">Enable Notifications</p>
                    <p className="text-xs text-gray-600">
                      SMS and push notifications
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="space-y-3">
          <Button
            onClick={handleNext}
            className="w-full gap-2"
            disabled={!canProceed()}
          >
            {step === totalSteps ? (
              <>
                <Check className="w-4 h-4" />
                Get Started
              </>
            ) : (
              'Continue'
            )}
          </Button>
          {step > 1 && (
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              className="w-full"
            >
              Back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
