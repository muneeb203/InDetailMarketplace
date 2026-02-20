import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Briefcase, MapPin, Award, DollarSign, Camera, Check, Loader2, AlertCircle, Minus, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { getCurrentLocation } from '../services/geolocationService';
import { ServiceRadiusMap } from './ServiceRadiusMap';
import { uploadLogoToStorage, uploadPortfolioImageToStorage } from '../services/dealerImageService';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

interface DetailerOnboardingProps {
  userName: string;
  userId: string;
  onComplete: (data: {
    businessName: string;
    serviceRadius: number;
    location: string;
    locationLat: number;
    locationLng: number;
    specialties: string[];
    priceRange: string;
    portfolioImages?: string[];
    logoUrl?: string;
  }) => void;
}

const SPECIALTIES = [
  'Full Detail',
  'Ceramic Coating',
  'Paint Correction',
  'Interior Detailing',
  'Exterior Wash',
  'Wax & Polish',
  'Engine Bay Cleaning',
  'Headlight Restoration',
];

/** Price range options - only value ($, $$, $$$, $$$$) is saved to dealer_profiles.price_range */
const PRICE_RANGES = [
  { value: '$', label: '$' },
  { value: '$$', label: '$$' },
  { value: '$$$', label: '$$$' },
  { value: '$$$$', label: '$$$$' },
];

const MAX_PORTFOLIO_ONBOARDING = 5;

export function DetailerOnboarding({
  userName,
  userId,
  onComplete,
}: DetailerOnboardingProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Step 1: Business Name
  const [businessName, setBusinessName] = useState('');

  // Step 2: Service Area
  const [location, setLocation] = useState('');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [serviceRadius, setServiceRadius] = useState(10);
  const [radiusInput, setRadiusInput] = useState('10');

  const MIN_RADIUS = 5;
  const MAX_RADIUS = 100;
  const RADIUS_STEP = 5;

  useEffect(() => {
    setRadiusInput(String(serviceRadius));
  }, [serviceRadius]);

  // Step 3: Specialties
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  // Step 4: Price Range
  const [priceRange, setPriceRange] = useState('');

  // Step 5: Portfolio (optional) - first image = logo (logos folder), rest = portfolio
  const [skipPortfolio, setSkipPortfolio] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleRadiusInputChange = (value: string) => {
    setRadiusInput(value);
  };

  const handleRadiusBlur = () => {
    const num = parseInt(radiusInput, 10);
    if (isNaN(num) || num < MIN_RADIUS) {
      setServiceRadius(MIN_RADIUS);
      setRadiusInput(String(MIN_RADIUS));
    } else if (num > MAX_RADIUS) {
      setServiceRadius(MAX_RADIUS);
      setRadiusInput(String(MAX_RADIUS));
    } else {
      const stepped = Math.round(num / RADIUS_STEP) * RADIUS_STEP;
      const clamped = Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, stepped));
      setServiceRadius(clamped);
      setRadiusInput(String(clamped));
    }
  };

  const handleRadiusKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleComplete = () => {
    if (locationLat === null || locationLng === null) return;
    onComplete({
      businessName,
      serviceRadius,
      location,
      locationLat,
      locationLng,
      specialties: selectedSpecialties,
      priceRange,
      portfolioImages: portfolioImages.length > 0 ? portfolioImages : undefined,
      logoUrl: logoUrl ?? undefined,
    });
  };

  const handlePortfolioFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setPortfolioError(null);
    try {
      validateFile(file);
      const totalCount = (logoUrl ? 1 : 0) + portfolioImages.length;
      if (totalCount >= MAX_PORTFOLIO_ONBOARDING) {
        throw new Error('Maximum 5 images allowed');
      }
      setPortfolioUploading(true);
      if (!logoUrl) {
        const url = await uploadLogoToStorage(userId, file);
        setLogoUrl(url);
        toast.success('Profile picture added (saved to logos)');
      } else {
        const url = await uploadPortfolioImageToStorage(userId, file);
        setPortfolioImages((prev) => [...prev, url]);
        toast.success('Photo added to portfolio');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload';
      setPortfolioError(msg);
      toast.error(msg);
    } finally {
      setPortfolioUploading(false);
    }
  };

  const handleRemovePortfolioImage = (url: string) => {
    if (url === logoUrl) {
      setLogoUrl(null);
    } else {
      setPortfolioImages((prev) => prev.filter((u) => u !== url));
    }
  };

  const handlePortfolioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPortfolioError('Only image files allowed (PNG, JPG)');
      return;
    }
    handlePortfolioFileSelect({ target: { files: [file] } } as any);
  };

  const handlePortfolioDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  function validateFile(file: File): void {
    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED = ['image/png', 'image/jpeg', 'image/jpg'];
    if (file.size > MAX_SIZE) throw new Error('File must be under 5MB');
    if (!ALLOWED.includes(file.type)) throw new Error('Only PNG and JPG allowed');
  }

  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    setLocationSuccess(false);
    try {
      const result = await getCurrentLocation();
      setLocation(result.address);
      setLocationLat(result.latitude);
      setLocationLng(result.longitude);
      setLocationSuccess(true);
      setLocationError(null);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setLocationError(error?.message ?? 'Unable to fetch location');
      setLocationSuccess(false);
      setLocationLat(null);
      setLocationLng(null);
    } finally {
      setLocationLoading(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const canProceed = () => {
    if (step === 1) return businessName.trim().length > 0;
    if (step === 2) return location.trim().length > 0 && locationLat !== null && locationLng !== null;
    if (step === 3) return selectedSpecialties.length > 0;
    if (step === 4) return priceRange.length > 0;
    if (step === 5) return !!logoUrl;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col p-6">
      <div className="w-full max-w-md mx-auto space-y-6 flex-1">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1>Welcome, {userName}!</h1>
          <p className="text-sm text-gray-600">
            Let's set up your detailing business profile
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
          {/* Step 1: Business Name */}
          {step === 1 && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto">
                  <Briefcase className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-center space-y-2">
                  <h3>What's your business name?</h3>
                  <p className="text-sm text-gray-600">
                    This is how customers will find you
                  </p>
                </div>
                <div>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., Elite Auto Detailing"
                    className="text-center"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Service Area */}
          {step === 2 && (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-center space-y-2">
                  <h3>Where do you operate?</h3>
                  <p className="text-sm text-gray-600">
                    Set your base location and service radius
                  </p>
                </div>
                
                <div>
                  <label className="text-sm mb-2 block">Base Location</label>
                  <Input
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (!e.target.value) {
                        setLocationLat(null);
                        setLocationLng(null);
                        setLocationSuccess(false);
                      }
                    }}
                    placeholder="City or ZIP code (use button below to auto-detect)"
                    className={locationSuccess ? 'bg-green-50 border-green-200' : ''}
                  />
                </div>

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
                  {locationLoading ? 'Fetching location...' : 'Use Current Location'}
                </Button>

                {locationSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    Location detected
                  </div>
                )}

                {locationError && (
                  <div className="flex flex-col gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {locationError}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-red-300 text-red-700 hover:bg-red-100"
                      onClick={handleUseCurrentLocation}
                      disabled={locationLoading}
                    >
                      Retry
                    </Button>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-sm block">Service Radius</label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => setServiceRadius((r) => Math.max(MIN_RADIUS, r - RADIUS_STEP))}
                      disabled={serviceRadius <= MIN_RADIUS}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Slider
                      value={[serviceRadius]}
                      onValueChange={([v]) => setServiceRadius(v)}
                      min={MIN_RADIUS}
                      max={MAX_RADIUS}
                      step={RADIUS_STEP}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => setServiceRadius((r) => Math.min(MAX_RADIUS, r + RADIUS_STEP))}
                      disabled={serviceRadius >= MAX_RADIUS}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={MIN_RADIUS}
                      max={MAX_RADIUS}
                      step={RADIUS_STEP}
                      value={radiusInput}
                      onChange={(e) => handleRadiusInputChange(e.target.value)}
                      onBlur={handleRadiusBlur}
                      onKeyDown={handleRadiusKeyDown}
                      className="w-20 h-9 text-center"
                    />
                    <span className="text-sm text-gray-600">miles</span>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Min {MIN_RADIUS} miles. You&apos;ll serve customers within this radius.
                  </p>
                </div>

                {/* Map Preview with Service Area Circle */}
                <div className="h-48 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100">
                  {locationLat != null && locationLng != null ? (
                    <ServiceRadiusMap
                      lat={locationLat}
                      lng={locationLng}
                      radiusMiles={serviceRadius}
                      className="w-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <MapPin className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs">Use &quot;Use Current Location&quot; to see your service area on the map</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Specialties */}
          {step === 3 && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-center space-y-2">
                  <h3>What services do you offer?</h3>
                  <p className="text-sm text-gray-600">
                    Select all that apply
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((specialty) => {
                    const isSelected = selectedSpecialties.includes(specialty);
                    return (
                      <Badge
                        key={specialty}
                        variant={isSelected ? 'default' : 'outline'}
                        className={`cursor-pointer px-3 py-2 transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => toggleSpecialty(specialty)}
                      >
                        {specialty}
                      </Badge>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {selectedSpecialties.length} selected
                </p>
              </div>
            </Card>
          )}

          {/* Step 4: Price Range */}
          {step === 4 && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                  <h3>What's your price range?</h3>
                  <p className="text-sm text-gray-600">
                    This helps set customer expectations
                  </p>
                </div>
                <div className="space-y-2">
                  {PRICE_RANGES.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setPriceRange(range.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        priceRange === range.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">{range.label}</span>
                        {priceRange === range.value && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Step 5: Portfolio */}
          {step === 5 && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto">
                  <Camera className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-center space-y-2">
                  <h3>Add your profile picture & portfolio</h3>
                  <p className="text-sm text-gray-600">
                    First image = gig logo. Add more for your portfolio
                  </p>
                </div>

                <div className="space-y-3">
                    <div
                      onClick={() => !portfolioUploading && portfolioInputRef.current?.click()}
                      onDrop={handlePortfolioDrop}
                      onDragOver={handlePortfolioDragOver}
                      className={`h-40 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer transition-colors ${
                        portfolioUploading ? 'opacity-60 pointer-events-none' : 'hover:border-blue-500 hover:bg-blue-50/50'
                      }`}
                    >
                      <input
                        ref={portfolioInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handlePortfolioFileSelect}
                        className="hidden"
                      />
                      {portfolioUploading ? (
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400 mb-2" />
                      )}
                      <p className="text-sm text-gray-600">Click to upload</p>
                      <p className="text-xs text-gray-500">or drag and drop (PNG/JPG, max 5MB)</p>
                    </div>

                    {(logoUrl || portfolioImages.length > 0) && (
                      <div className="grid grid-cols-3 gap-2">
                        {logoUrl && (
                          <div key="logo" className="relative aspect-square rounded-lg overflow-hidden border-2 border-blue-300 group">
                            <ImageWithFallback
                              src={logoUrl}
                              alt="Profile picture (logo)"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded">Logo</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePortfolioImage(logoUrl)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {portfolioImages.map((url) => (
                          <div key={url} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group">
                            <ImageWithFallback
                              src={url}
                              alt="Portfolio"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePortfolioImage(url)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {portfolioError && (
                      <p className="text-sm text-red-600 text-center">{portfolioError}</p>
                    )}
                    <p className="text-xs text-gray-500 text-center">
                      {(logoUrl ? 1 : 0) + portfolioImages.length}/5 • First = gig logo
                    </p>
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
                Complete Setup
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
