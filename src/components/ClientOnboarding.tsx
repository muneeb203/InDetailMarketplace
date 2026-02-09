import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { MapPin, Car, Bell, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ClientOnboardingProps {
  userName: string;
  onComplete: (data: {
    location: string;
    vehicle?: { make: string; model: string; year: number };
    notifications: boolean;
  }) => void;
}

const MAKES = ['Acura', 'Audi', 'BMW', 'Chevrolet', 'Ford', 'Honda', 'Lexus', 'Mercedes-Benz', 'Tesla', 'Toyota'];

export function ClientOnboarding({ userName, onComplete }: ClientOnboardingProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Step 1: Location
  const [location, setLocation] = useState('');

  // Step 2: Vehicle (optional)
  const [skipVehicle, setSkipVehicle] = useState(false);
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');

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
    onComplete({
      location,
      vehicle:
        !skipVehicle && vehicleMake && vehicleModel && vehicleYear
          ? {
              make: vehicleMake,
              model: vehicleModel,
              year: parseInt(vehicleYear),
            }
          : undefined,
      notifications,
    });
  };

  const canProceed = () => {
    if (step === 1) return location.trim().length > 0;
    if (step === 2) return skipVehicle || (vehicleMake && vehicleModel && vehicleYear);
    return true;
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
                <div>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="ZIP code or city"
                    className="text-center"
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    // Mock geolocation
                    setLocation('San Francisco, CA 94102');
                  }}
                >
                  <MapPin className="w-4 h-4" />
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
                    <div>
                      <label className="text-sm mb-2 block">Make</label>
                      <Select value={vehicleMake} onValueChange={setVehicleMake}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select make" />
                        </SelectTrigger>
                        <SelectContent>
                          {MAKES.map((make) => (
                            <SelectItem key={make} value={make}>
                              {make}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Input
                        type="number"
                        value={vehicleYear}
                        onChange={(e) => setVehicleYear(e.target.value)}
                        placeholder="2023"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                      />
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
