import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { UserRole, Customer, Detailer, ServiceArea, OperatingHours } from '../types';
import { Car, Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceRadiusSelector } from './ServiceRadiusSelector';
import { OperatingHoursEditor } from './OperatingHoursEditor';
import { ServiceSpecialtiesSelector } from './ServiceSpecialtiesSelector';
import { BusinessBrandingEditor } from './BusinessBrandingEditor';
import { PhotoUpload } from './PhotoUpload';

interface OnboardingFlowV2Props {
  onComplete: (user: Customer | Detailer) => void;
}

type CustomerStep = 'role' | 'basic' | 'vehicle';
type DetailerStep = 'role' | 'basic' | 'business' | 'service-area' | 'branding' | 'specialties' | 'hours' | 'portfolio';

export function OnboardingFlowV2({ onComplete }: OnboardingFlowV2Props) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [customerStep, setCustomerStep] = useState<CustomerStep>('role');
  const [detailerStep, setDetailerStep] = useState<DetailerStep>('role');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    businessName: '',
    bio: '',
    serviceArea: '',
    priceRange: '',
  });

  const [detailerExtras, setDetailerExtras] = useState<{
    serviceAreaGeo?: ServiceArea;
    tagline?: string;
    logoUrl?: string;
    serviceTags?: string[];
    operatingHours?: OperatingHours;
    portfolioPhotos?: string[];
  }>({});

  const isCustomer = selectedRole === 'customer';
  const totalSteps = isCustomer ? 3 : 8;
  
  const getCurrentStepNumber = () => {
    if (isCustomer) {
      return customerStep === 'role' ? 1 : customerStep === 'basic' ? 2 : 3;
    } else {
      const stepMap: Record<DetailerStep, number> = {
        'role': 1,
        'basic': 2,
        'business': 3,
        'service-area': 4,
        'branding': 5,
        'specialties': 6,
        'hours': 7,
        'portfolio': 8,
      };
      return stepMap[detailerStep];
    }
  };

  const currentStepNumber = getCurrentStepNumber();
  const progress = (currentStepNumber / totalSteps) * 100;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'customer') {
      setCustomerStep('basic');
    } else {
      setDetailerStep('basic');
    }
  };

  const handleBack = () => {
    if (isCustomer) {
      setCustomerStep(customerStep === 'vehicle' ? 'basic' : 'role');
    } else {
      const stepFlow: DetailerStep[] = ['role', 'basic', 'business', 'service-area', 'branding', 'specialties', 'hours', 'portfolio'];
      const currentIndex = stepFlow.indexOf(detailerStep);
      if (currentIndex > 0) {
        setDetailerStep(stepFlow[currentIndex - 1]);
      }
    }
  };

  const handleCustomerNext = () => {
    if (customerStep === 'basic') {
      setCustomerStep('vehicle');
    }
  };

  const handleDetailerNext = () => {
    const stepFlow: DetailerStep[] = ['basic', 'business', 'service-area', 'branding', 'specialties', 'hours', 'portfolio'];
    const currentIndex = stepFlow.indexOf(detailerStep);
    if (currentIndex < stepFlow.length - 1) {
      setDetailerStep(stepFlow[currentIndex + 1]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRole === 'customer') {
      const customer: Customer = {
        id: `c${Date.now()}`,
        role: 'customer',
        email: formData.email,
        phone: formData.phone,
        name: formData.name,
        location: formData.location,
        vehicles: formData.vehicleType
          ? [
              {
                id: `v${Date.now()}`,
                type: formData.vehicleType,
                make: formData.vehicleMake,
                model: formData.vehicleModel,
                year: parseInt(formData.vehicleYear) || 2020,
              },
            ]
          : [],
        createdAt: new Date(),
      };
      onComplete(customer);
    } else {
      const detailer: Detailer = {
        id: `d${Date.now()}`,
        role: 'detailer',
        email: formData.email,
        phone: formData.phone,
        name: formData.name,
        location: formData.location,
        businessName: formData.businessName,
        bio: formData.bio,
        tagline: detailerExtras.tagline,
        logoUrl: detailerExtras.logoUrl,
        serviceArea: formData.serviceArea,
        serviceAreaGeo: detailerExtras.serviceAreaGeo,
        priceRange: formData.priceRange,
        serviceTags: detailerExtras.serviceTags,
        operatingHours: detailerExtras.operatingHours,
        rating: 5.0,
        reviewCount: 0,
        photos: [],
        portfolioPhotos: detailerExtras.portfolioPhotos || [],
        services: ['Full Detail', 'Exterior Wash', 'Interior Detail'],
        isPro: false,
        wallet: 100,
        completedJobs: 0,
        responseTime: 15,
        createdAt: new Date(),
      };
      onComplete(detailer);
    }
  };

  const currentStep = isCustomer ? customerStep : detailerStep;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Progress Bar */}
      {currentStep !== 'role' && (
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <Button variant="ghost" onClick={handleBack} size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <span className="text-sm text-gray-600">
                Step {currentStepNumber} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Role Selection */}
          {currentStep === 'role' && (
            <RoleSelection onSelect={handleRoleSelect} />
          )}

          {/* Basic Information */}
          {currentStep === 'basic' && (
            <BasicInfoStep
              formData={formData}
              setFormData={setFormData}
              onNext={isCustomer ? handleCustomerNext : handleDetailerNext}
            />
          )}

          {/* Customer: Vehicle Details */}
          {isCustomer && currentStep === 'vehicle' && (
            <VehicleDetailsStep
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
            />
          )}

          {/* Detailer: Business Details */}
          {!isCustomer && currentStep === 'business' && (
            <BusinessDetailsStep
              formData={formData}
              setFormData={setFormData}
              onNext={handleDetailerNext}
            />
          )}

          {/* Detailer: Service Area */}
          {!isCustomer && currentStep === 'service-area' && (
            <ServiceAreaStep
              serviceArea={detailerExtras.serviceAreaGeo}
              onServiceAreaChange={(area) => {
                setDetailerExtras({ ...detailerExtras, serviceAreaGeo: area });
                setFormData({ ...formData, serviceArea: area.address || `${area.radius} mile radius` });
              }}
              onNext={handleDetailerNext}
            />
          )}

          {/* Detailer: Branding */}
          {!isCustomer && currentStep === 'branding' && (
            <BrandingStep
              businessName={formData.businessName}
              tagline={detailerExtras.tagline}
              logoUrl={detailerExtras.logoUrl}
              onChange={(data) => setDetailerExtras({ ...detailerExtras, ...data })}
              onNext={handleDetailerNext}
            />
          )}

          {/* Detailer: Specialties */}
          {!isCustomer && currentStep === 'specialties' && (
            <SpecialtiesStep
              specialties={detailerExtras.serviceTags}
              onChange={(tags) => setDetailerExtras({ ...detailerExtras, serviceTags: tags })}
              onNext={handleDetailerNext}
            />
          )}

          {/* Detailer: Operating Hours */}
          {!isCustomer && currentStep === 'hours' && (
            <OperatingHoursStep
              hours={detailerExtras.operatingHours}
              onChange={(hours) => setDetailerExtras({ ...detailerExtras, operatingHours: hours })}
              onNext={handleDetailerNext}
            />
          )}

          {/* Detailer: Portfolio */}
          {!isCustomer && currentStep === 'portfolio' && (
            <PortfolioStep
              photos={detailerExtras.portfolioPhotos || []}
              onChange={(photos) => setDetailerExtras({ ...detailerExtras, portfolioPhotos: photos })}
              onSubmit={handleSubmit}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Role Selection Component
function RoleSelection({ onSelect }: { onSelect: (role: UserRole) => void }) {
  return (
    <motion.div
      key="role"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-blue-600 mb-2">Welcome to InDetail</h1>
        <p className="text-gray-600">Mobile auto detailing marketplace</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-center mb-6">I want to...</h2>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('customer')}
          className="w-full bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all group"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-4 group-hover:from-blue-500 group-hover:to-blue-600 transition-all shadow-md">
              <Car className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="mb-2">Find a Detailer</h3>
            <p className="text-gray-600 text-center">Get your car detailed at your location</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('detailer')}
          className="w-full bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all group"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center mb-4 group-hover:from-indigo-500 group-hover:to-indigo-600 transition-all shadow-md">
              <Sparkles className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="mb-2">Grow My Business</h3>
            <p className="text-gray-600 text-center">Get discovered by new customers</p>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}

// Basic Info Step
function BasicInfoStep({ formData, setFormData, onNext }: any) {
  const isValid = formData.name && formData.email && formData.phone && formData.location;

  return (
    <motion.div
      key="basic"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h2 className="mb-2">Let's get started</h2>
        <p className="text-gray-600 mb-6">Tell us about yourself</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="John Doe"
              className="border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="john@example.com"
              className="border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              placeholder="(555) 123-4567"
              className="border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              placeholder="City, State"
              className="border-gray-300"
            />
          </div>
        </div>

        <Button
          onClick={onNext}
          disabled={!isValid}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

// Vehicle Details Step (Customer only)
function VehicleDetailsStep({ formData, setFormData, onSubmit }: any) {
  return (
    <motion.div
      key="vehicle"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-md"
    >
      <form onSubmit={onSubmit}>
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="mb-2">Your Vehicle</h2>
          <p className="text-gray-600 mb-6">Tell us about your car (optional)</p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select
                value={formData.vehicleType}
                onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sedan">Sedan</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Truck">Truck</SelectItem>
                  <SelectItem value="Coupe">Coupe</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Sports Car">Sports Car</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleMake">Make</Label>
                <Input
                  id="vehicleMake"
                  value={formData.vehicleMake}
                  onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                  placeholder="Toyota"
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleModel">Model</Label>
                <Input
                  id="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  placeholder="Camry"
                  className="border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleYear">Year</Label>
              <Input
                id="vehicleYear"
                type="number"
                value={formData.vehicleYear}
                onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                placeholder="2021"
                min="1990"
                max="2026"
                className="border-gray-300"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
          >
            Complete Setup
            <Check className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

// Business Details Step (Detailer only)
function BusinessDetailsStep({ formData, setFormData, onNext }: any) {
  const isValid = formData.businessName && formData.bio && formData.priceRange;

  return (
    <motion.div
      key="business"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h2 className="mb-2">Your Business</h2>
        <p className="text-gray-600 mb-6">Tell us about your detailing business</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
              placeholder="Premier Auto Detailing"
              className="border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio *</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              required
              placeholder="Professional mobile detailing with 10+ years experience..."
              className="border-gray-300 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priceRange">Price Range *</Label>
            <Select
              value={formData.priceRange}
              onValueChange={(value) => setFormData({ ...formData, priceRange: value })}
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$">$ - Budget Friendly</SelectItem>
                <SelectItem value="$$">$$ - Moderate</SelectItem>
                <SelectItem value="$$$">$$$ - Premium</SelectItem>
                <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={onNext}
          disabled={!isValid}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

// Service Area Step
function ServiceAreaStep({ serviceArea, onServiceAreaChange, onNext }: any) {
  const isValid = !!serviceArea?.center && !!serviceArea?.radius;

  return (
    <motion.div
      key="service-area"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-2xl"
    >
      <div className="space-y-6">
        <ServiceRadiusSelector
          initialServiceArea={serviceArea}
          onServiceAreaChange={onServiceAreaChange}
        />

        <Button
          onClick={onNext}
          disabled={!isValid}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

// Branding Step
function BrandingStep({ businessName, tagline, logoUrl, onChange, onNext }: any) {
  return (
    <motion.div
      key="branding"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-2xl"
    >
      <div className="space-y-6">
        <BusinessBrandingEditor
          businessName={businessName}
          initialTagline={tagline}
          initialLogoUrl={logoUrl}
          onChange={onChange}
        />

        <Button
          onClick={onNext}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
        >
          Continue (Optional)
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

// Specialties Step
function SpecialtiesStep({ specialties, onChange, onNext }: any) {
  return (
    <motion.div
      key="specialties"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-2xl"
    >
      <div className="space-y-6">
        <ServiceSpecialtiesSelector
          initialSpecialties={specialties}
          onChange={onChange}
        />

        <Button
          onClick={onNext}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
        >
          Continue (Optional)
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

// Operating Hours Step
function OperatingHoursStep({ hours, onChange, onNext }: any) {
  return (
    <motion.div
      key="hours"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-2xl"
    >
      <div className="space-y-6">
        <OperatingHoursEditor
          initialHours={hours}
          onChange={onChange}
        />

        <Button
          onClick={onNext}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
        >
          Continue (Optional)
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

// Portfolio Step
function PortfolioStep({ photos, onChange, onSubmit }: any) {
  return (
    <motion.div
      key="portfolio"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-2xl"
    >
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-6">
        <div>
          <h2 className="mb-2">Portfolio Photos</h2>
          <p className="text-gray-600">Showcase your best work (optional but recommended)</p>
        </div>

        <PhotoUpload
          maxPhotos={10}
          photos={photos}
          onPhotosChange={onChange}
          purpose="portfolio"
        />

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="text-sm mb-2">💡 Pro Tip</h4>
          <p className="text-xs text-gray-700">
            Detailers with portfolio photos get <strong>3x more bookings</strong> than those without.
            Add at least 5-7 high-quality photos to maximize your visibility!
          </p>
        </div>

        <Button
          onClick={onSubmit}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
        >
          Complete Setup
          <Check className="w-4 h-4 ml-2" />
        </Button>

        <Button
          onClick={onSubmit}
          variant="ghost"
          className="w-full"
        >
          Skip for Now
        </Button>
      </div>
    </motion.div>
  );
}
