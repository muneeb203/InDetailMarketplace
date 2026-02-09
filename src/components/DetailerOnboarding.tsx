import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Briefcase, MapPin, Award, DollarSign, Camera, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface DetailerOnboardingProps {
  userName: string;
  onComplete: (data: {
    businessName: string;
    serviceRadius: number;
    location: string;
    specialties: string[];
    priceRange: string;
    portfolioPhoto?: string;
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

const PRICE_RANGES = [
  { value: '$', label: '$', description: 'Budget-friendly' },
  { value: '$$', label: '$$', description: 'Mid-range' },
  { value: '$$$', label: '$$$', description: 'Premium' },
  { value: '$$$$', label: '$$$$', description: 'Luxury' },
];

export function DetailerOnboarding({
  userName,
  onComplete,
}: DetailerOnboardingProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Step 1: Business Name
  const [businessName, setBusinessName] = useState('');

  // Step 2: Service Area
  const [location, setLocation] = useState('');
  const [serviceRadius, setServiceRadius] = useState([10]);

  // Step 3: Specialties
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  // Step 4: Price Range
  const [priceRange, setPriceRange] = useState('');

  // Step 5: Portfolio (optional)
  const [skipPortfolio, setSkipPortfolio] = useState(false);

  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    onComplete({
      businessName,
      serviceRadius: serviceRadius[0],
      location,
      specialties: selectedSpecialties,
      priceRange,
      portfolioPhoto: undefined,
    });
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
    if (step === 2) return location.trim().length > 0;
    if (step === 3) return selectedSpecialties.length > 0;
    if (step === 4) return priceRange.length > 0;
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
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or ZIP code"
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    setLocation('San Francisco, CA 94102');
                  }}
                >
                  <MapPin className="w-4 h-4" />
                  Use Current Location
                </Button>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Service Radius</label>
                    <span className="text-sm text-blue-600">
                      {serviceRadius[0]} miles
                    </span>
                  </div>
                  <Slider
                    value={serviceRadius}
                    onValueChange={setServiceRadius}
                    min={5}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 text-center">
                    You'll serve customers within this radius
                  </p>
                </div>

                {/* Map Placeholder */}
                <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs">Service area preview</p>
                  </div>
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
                  {SPECIALTIES.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant={
                        selectedSpecialties.includes(specialty)
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer px-3 py-2"
                      onClick={() => toggleSpecialty(specialty)}
                    >
                      {specialty}
                    </Badge>
                  ))}
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
                        <div className="text-left">
                          <p className="text-sm">{range.label}</p>
                          <p className="text-xs text-gray-600">{range.description}</p>
                        </div>
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
                  <h3>Add your first portfolio photo</h3>
                  <p className="text-sm text-gray-600">
                    Showcase your best work (optional)
                  </p>
                </div>

                {!skipPortfolio ? (
                  <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 transition-colors">
                    <div className="text-center text-gray-500">
                      <Camera className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Click to upload</p>
                      <p className="text-xs">or drag and drop</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    You can add portfolio photos later in your profile
                  </div>
                )}

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setSkipPortfolio(!skipPortfolio)}
                >
                  {skipPortfolio ? 'Add Photo' : 'Skip for Now'}
                </Button>
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
