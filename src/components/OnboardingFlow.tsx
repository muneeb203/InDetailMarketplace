import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { UserRole, Customer, Detailer } from '../types';
import { Car, Sparkles } from 'lucide-react';
import { PhotoUpload } from './PhotoUpload';

interface OnboardingFlowProps {
  onComplete: (user: Customer | Detailer) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    // Customer specific
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    // Detailer specific
    businessName: '',
    bio: '',
    serviceArea: '',
    priceRange: '',
    portfolioPhotos: [] as string[]
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
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
        vehicles: formData.vehicleType ? [{
          id: `v${Date.now()}`,
          type: formData.vehicleType,
          make: formData.vehicleMake,
          model: formData.vehicleModel,
          year: parseInt(formData.vehicleYear) || 2020
        }] : [],
        createdAt: new Date()
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
        portfolioPhotos: formData.portfolioPhotos,
        services: ['Full Detail', 'Exterior Wash', 'Interior Detail'],
        isPro: false,
        wallet: 100,
        completedJobs: 0,
        createdAt: new Date()
      };
      onComplete(detailer);
    }
  };

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-blue-600 mb-2">InDetail</h1>
            <p className="text-gray-600">Mobile Auto Detailing Marketplace</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-center mb-6">Choose Your Role</h2>
            
            <button
              onClick={() => handleRoleSelect('customer')}
              className="w-full bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-blue-500 transition-all group"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                  <Car className="w-8 h-8 text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="mb-2">I'm a Customer</h3>
                <p className="text-gray-600 text-center">Find mobile detailers near you</p>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('detailer')}
              className="w-full bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-blue-500 transition-all group"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                  <Sparkles className="w-8 h-8 text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="mb-2">I'm a Detailer</h3>
                <p className="text-gray-600 text-center">Get discovered by new clients</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <Button 
            variant="ghost" 
            onClick={() => setStep('role')}
            className="mb-2"
          >
            ← Back
          </Button>
          <h2>Complete Your Profile</h2>
          <p className="text-gray-600">
            {selectedRole === 'customer' ? 'Tell us about your vehicle' : 'Set up your business'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 pb-24">
          <div className="space-y-6">
            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                placeholder="Downtown, Midtown, etc."
              />
            </div>

            {/* Customer Specific Fields */}
            {selectedRole === 'customer' && (
              <>
                <div className="border-t pt-6 mt-6">
                  <h3 className="mb-4">Vehicle Information</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleType">Vehicle Type</Label>
                      <Select
                        value={formData.vehicleType}
                        onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
                      >
                        <SelectTrigger>
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
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicleModel">Model</Label>
                        <Input
                          id="vehicleModel"
                          value={formData.vehicleModel}
                          onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                          placeholder="Camry"
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
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Detailer Specific Fields */}
            {selectedRole === 'detailer' && (
              <>
                <div className="border-t pt-6 mt-6">
                  <h3 className="mb-4">Business Information</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        required
                        placeholder="Elite Auto Detailing"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        required
                        placeholder="Tell customers about your experience and services..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serviceArea">Service Area</Label>
                      <Input
                        id="serviceArea"
                        value={formData.serviceArea}
                        onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                        required
                        placeholder="Downtown (5 mile radius)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priceRange">Price Range</Label>
                      <Select
                        value={formData.priceRange}
                        onValueChange={(value) => setFormData({ ...formData, priceRange: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select price range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="$">$ - Budget Friendly</SelectItem>
                          <SelectItem value="$">$ - Moderate</SelectItem>
                          <SelectItem value="$$">$$ - Premium</SelectItem>
                          <SelectItem value="$$">$$ - Luxury</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <PhotoUpload
                        photos={formData.portfolioPhotos}
                        onChange={(photos) => setFormData({ ...formData, portfolioPhotos: photos })}
                        maxPhotos={10}
                        folder="portfolio"
                        title="Portfolio (Optional)"
                        description="Upload photos of your previous work. Before & After shots work great!"
                        showCamera={true}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-6">
            <div className="max-w-md mx-auto">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
