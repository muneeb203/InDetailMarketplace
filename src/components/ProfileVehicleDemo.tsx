import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ProfilePageEnhanced } from './ProfilePageEnhanced';
import { VehicleManagement } from './VehicleManagement';
import { StatusStrip, BookingStatus } from './StatusStrip';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Detailer, Vehicle } from '../types';

// Mock detailer data
const mockDetailer: Detailer = {
  id: '1',
  role: 'detailer',
  email: 'mike@detailpro.com',
  phone: '555-0123',
  name: 'Mike Johnson',
  businessName: 'Elite Auto Detailing',
  bio: 'Professional auto detailing with 10+ years of experience. Specializing in ceramic coatings, paint correction, and luxury vehicle care. Every detail matters.',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  tagline: 'Precision Detailing for Discerning Owners',
  location: 'San Francisco, CA',
  serviceRadius: 15,
  serviceArea: {
    center: { lat: 37.7749, lng: -122.4194 },
    radius: 15,
  },
  priceRange: '$$$',
  rating: 4.9,
  reviewCount: 127,
  photos: [],
  portfolioImages: [
    {
      url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80',
      label: 'Tesla Model 3 - Ceramic Coating',
      category: 'Ceramic Coating',
    },
    {
      url: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&q=80',
      label: 'BMW M3 - Paint Correction',
      category: 'Paint Correction',
    },
    {
      url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
      label: 'Mercedes AMG - Full Detail',
      category: 'Exterior',
    },
  ],
  services: ['Full Detail', 'Ceramic Coating', 'Paint Correction', 'Interior Detailing'],
  specialties: ['Ceramic Coating', 'Paint Correction', 'Luxury Vehicles'],
  operatingHours: {
    monday: { isOpen: true, open: '9:00 AM', close: '6:00 PM' },
    tuesday: { isOpen: true, open: '9:00 AM', close: '6:00 PM' },
    wednesday: { isOpen: true, open: '9:00 AM', close: '6:00 PM' },
    thursday: { isOpen: true, open: '9:00 AM', close: '6:00 PM' },
    friday: { isOpen: true, open: '9:00 AM', close: '7:00 PM' },
    saturday: { isOpen: true, open: '10:00 AM', close: '4:00 PM' },
    sunday: { isOpen: false, open: '', close: '' },
  },
  isPro: true,
  wallet: 12,
  completedJobs: 350,
  responseTime: 15,
  acceptanceRate: 94,
  createdAt: new Date(),
};

// Mock vehicles
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    color: 'White',
    nickname: 'The Beast',
    photo: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&q=80',
    careNotes: 'Ceramic coated - use pH-neutral cleaners only',
    isDefault: true,
  },
  {
    id: '2',
    make: 'BMW',
    model: 'X5',
    year: 2021,
    color: 'Black',
    nickname: 'Daily Driver',
    careNotes: 'Leather interior - use leather-safe products',
    isDefault: false,
  },
];

export function ProfileVehicleDemo() {
  const [detailer, setDetailer] = useState(mockDetailer);
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [viewMode, setViewMode] = useState<'customer' | 'detailer'>('detailer');
  const [statusDemo, setStatusDemo] = useState<BookingStatus>('requested');

  const handleDetailerUpdate = (updates: Partial<Detailer>) => {
    setDetailer({ ...detailer, ...updates });
  };

  const handleVehiclesUpdate = (updatedVehicles: Vehicle[]) => {
    setVehicles(updatedVehicles);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* View Mode Selector */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm">InDetail — Profile & Vehicle Demo</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === 'detailer' ? 'default' : 'outline'}
                onClick={() => setViewMode('detailer')}
              >
                Detailer View
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'customer' ? 'default' : 'outline'}
                onClick={() => setViewMode('customer')}
              >
                Customer View
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="profile" className="w-full">
        <div className="bg-white border-b sticky top-[73px] z-40">
          <div className="max-w-4xl mx-auto px-4">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="status">Status Demo</TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Profile Tab */}
        <TabsContent value="profile" className="m-0">
          <ProfilePageEnhanced
            detailer={detailer}
            isOwnProfile={viewMode === 'detailer'}
            userLocation={{ lat: 37.7849, lng: -122.4094 }}
            onUpdate={handleDetailerUpdate}
            onRequestQuote={() => alert('Request Quote clicked')}
            onMessage={() => alert('Message clicked')}
          />
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="m-0">
          <VehicleManagement vehicles={vehicles} onUpdate={handleVehiclesUpdate} />
        </TabsContent>

        {/* Status Demo Tab */}
        <TabsContent value="status" className="m-0">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card className="p-6">
              <h2 className="mb-4">Booking Status Tracker</h2>
              <p className="text-sm text-gray-600 mb-6">
                A reusable status component showing the booking progress. Click buttons to
                change the status.
              </p>

              {/* Status Strip */}
              <StatusStrip status={statusDemo} className="mb-6 rounded-lg border" />

              {/* Controls */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={statusDemo === 'requested' ? 'default' : 'outline'}
                  onClick={() => setStatusDemo('requested')}
                >
                  Requested
                </Button>
                <Button
                  size="sm"
                  variant={statusDemo === 'accepted' ? 'default' : 'outline'}
                  onClick={() => setStatusDemo('accepted')}
                >
                  Accepted
                </Button>
                <Button
                  size="sm"
                  variant={statusDemo === 'on-the-way' ? 'default' : 'outline'}
                  onClick={() => setStatusDemo('on-the-way')}
                >
                  On the Way
                </Button>
                <Button
                  size="sm"
                  variant={statusDemo === 'started' ? 'default' : 'outline'}
                  onClick={() => setStatusDemo('started')}
                >
                  Started
                </Button>
                <Button
                  size="sm"
                  variant={statusDemo === 'completed' ? 'default' : 'outline'}
                  onClick={() => setStatusDemo('completed')}
                >
                  Completed
                </Button>
              </div>
            </Card>

            {/* Component Features */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="mb-4">✨ New Features Implemented</h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="mb-2">Profile Page</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>✓ Edit mode toggle with inline editing</li>
                    <li>✓ Portfolio manager (upload, reorder, labels)</li>
                    <li>✓ Service area with radius selector</li>
                    <li>✓ Operating hours editor</li>
                    <li>✓ Trust badges & metrics</li>
                    <li>✓ Mini portfolio carousel</li>
                    <li>✓ Wallet/credits display</li>
                    <li>✓ Distance & service area chips</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2">Vehicle Management</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>✓ Vehicle cards with details</li>
                    <li>✓ Add/edit/delete vehicles</li>
                    <li>✓ Default vehicle setting</li>
                    <li>✓ Photo upload</li>
                    <li>✓ Care notes</li>
                    <li>✓ Expand/collapse details</li>
                    <li>✓ Empty states</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2">Visual Design</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>✓ Blue/white brand palette</li>
                    <li>✓ Rounded corners & soft shadows</li>
                    <li>✓ Smooth microinteractions</li>
                    <li>✓ Auto-save toasts</li>
                    <li>✓ Skeleton loaders ready</li>
                    <li>✓ Mobile-first responsive</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2">Trust & Exposure</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>✓ Verified badges with tooltips</li>
                    <li>✓ Response speed indicators</li>
                    <li>✓ "Serves your area" pills</li>
                    <li>✓ Distance calculations</li>
                    <li>✓ Specialty tags</li>
                    <li>✓ Portfolio categories</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Usage Guide */}
            <Card className="p-6">
              <h3 className="mb-4">🎯 How to Use</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <strong className="block mb-1">Profile Page:</strong>
                  <p className="text-gray-700">
                    Switch to "Detailer View" to see the Edit Profile button. Click it to
                    enter edit mode and modify all profile fields. The Portfolio tab lets
                    you manage work samples with drag-and-drop reordering.
                  </p>
                </div>
                <div>
                  <strong className="block mb-1">Vehicle Management:</strong>
                  <p className="text-gray-700">
                    Add vehicles with full details including photos and care notes. Set a
                    default vehicle for quick quote requests. Click cards to expand and see
                    full details.
                  </p>
                </div>
                <div>
                  <strong className="block mb-1">Status Tracker:</strong>
                  <p className="text-gray-700">
                    Reusable component that can be placed above chat interfaces or booking
                    details. Shows visual progress through the service lifecycle.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
