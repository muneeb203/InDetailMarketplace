import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { UserRole, Customer, Detailer } from '../types';
import { Car, Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingFlowEnhancedProps {
  onComplete: (user: Customer | Detailer) => void;
}

export function OnboardingFlowEnhanced({ onComplete }: OnboardingFlowEnhancedProps) {
  const [step, setStep] = useState<'role' | 'basic' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
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

  const totalSteps = 3;
  const currentStepNumber = step === 'role' ? 1 : step === 'basic' ? 2 : 3;
  const progress = (currentStepNumber / totalSteps) * 100;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('basic');
  };

  const handleBasicNext = () => {
    setStep('details');
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
        serviceArea: formData.serviceArea,
        priceRange: formData.priceRange,
        rating: 5.0,
        reviewCount: 0,
        photos: [],
        services: ['Full Detail', 'Exterior Wash', 'Interior Detail'],
        isPro: false,
        wallet: 100,
        completedJobs: 0,
        createdAt: new Date(),
      };
      onComplete(detailer);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Progress Bar */}
      {step !== 'role' && (
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="max-w-md mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <Button variant="ghost" onClick={() => setStep(step === 'details' ? 'basic' : 'role')} size="sm">
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

      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {/* Role Selection */}
          {step === 'role' && (
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
                <p className="text-gray-600">
                  Mobile auto detailing marketplace
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-center mb-6">I want to...</h2>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect('customer')}
                  className="w-full bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all group"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-4 group-hover:from-blue-500 group-hover:to-blue-600 transition-all shadow-md">
                      <Car className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="mb-2">Find a Detailer</h3>
                    <p className="text-gray-600 text-center">
                      Get your car detailed at your location
                    </p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect('detailer')}
                  className="w-full bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all group"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center mb-4 group-hover:from-indigo-500 group-hover:to-indigo-600 transition-all shadow-md">
                      <Sparkles className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="mb-2">Grow My Business</h3>
                    <p className="text-gray-600 text-center">
                      Get discovered by new customers
                    </p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Basic Information */}
          {step === 'basic' && (
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
                      placeholder="Downtown, Midtown, etc."
                      className="border-gray-300"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleBasicNext}
                  disabled={!formData.name || !formData.email || !formData.phone || !formData.location}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Role-Specific Details */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="w-full max-w-md"
            >
              <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                  <h2 className="mb-2">
                    {selectedRole === 'customer' ? 'Your Vehicle' : 'Your Business'}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {selectedRole === 'customer'
                      ? 'Tell us about your car'
                      : 'Set up your business profile'}
                  </p>

                  <div className="space-y-4">
                    {selectedRole === 'customer' ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="vehicleType">Vehicle Type</Label>
                          <Select
                            value={formData.vehicleType}
                            onValueChange={(value) =>
                              setFormData({ ...formData, vehicleType: value })
                            }
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
                              onChange={(e) =>
                                setFormData({ ...formData, vehicleMake: e.target.value })
                              }
                              placeholder="Toyota"
                              className="border-gray-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="vehicleModel">Model</Label>
                            <Input
                              id="vehicleModel"
                              value={formData.vehicleModel}
                              onChange={(e) =>
                                setFormData({ ...formData, vehicleModel: e.target.value })
                              }
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
                            onChange={(e) =>
                              setFormData({ ...formData, vehicleYear: e.target.value })
                            }
                            placeholder="2021"
                            min="1990"
                            max="2026"
                            className="border-gray-300"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="businessName">Business Name *</Label>
                          <Input
                            id="businessName"
                            value={formData.businessName}
                            onChange={(e) =>
                              setFormData({ ...formData, businessName: e.target.value })
                            }
                            required
                            placeholder="Elite Auto Detailing"
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
                            placeholder="Tell customers about your experience..."
                            rows={4}
                            className="border-gray-300"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="serviceArea">Service Area *</Label>
                          <Input
                            id="serviceArea"
                            value={formData.serviceArea}
                            onChange={(e) =>
                              setFormData({ ...formData, serviceArea: e.target.value })
                            }
                            required
                            placeholder="Downtown (5 mile radius)"
                            className="border-gray-300"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="priceRange">Price Range *</Label>
                          <Select
                            value={formData.priceRange}
                            onValueChange={(value) =>
                              setFormData({ ...formData, priceRange: value })
                            }
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
                      </>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      selectedRole === 'detailer' &&
                      (!formData.businessName || !formData.bio || !formData.serviceArea)
                    }
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Complete Setup
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
