import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { MapPin, Navigation, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { ServiceArea } from '../types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ServiceRadiusSelectorProps {
  initialServiceArea?: ServiceArea;
  onServiceAreaChange: (serviceArea: ServiceArea) => void;
}

export function ServiceRadiusSelector({
  initialServiceArea,
  onServiceAreaChange,
}: ServiceRadiusSelectorProps) {
  const [address, setAddress] = useState(initialServiceArea?.address || '');
  const [radius, setRadius] = useState(initialServiceArea?.radius || 20);
  const [center, setCenter] = useState(initialServiceArea?.center || {
    lat: 39.7684,
    lng: -86.1581,
  });
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  // Simulate geocoding - in production, use Google Maps Geocoding API
  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
  };

  const handleGetCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(newCenter);
          setAddress('Your Current Location');
          setUseCurrentLocation(true);
          setLoading(false);
          
          onServiceAreaChange({
            center: newCenter,
            radius,
            address: 'Your Current Location',
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
      alert('Geolocation is not supported by your browser');
    }
  };

  const handleRadiusChange = (value: number[]) => {
    const newRadius = value[0];
    setRadius(newRadius);
    onServiceAreaChange({
      center,
      radius: newRadius,
      address,
    });
  };

  useEffect(() => {
    if (initialServiceArea) {
      setCenter(initialServiceArea.center);
      setRadius(initialServiceArea.radius);
      setAddress(initialServiceArea.address || '');
    }
  }, [initialServiceArea]);

  // Calculate approximate coverage area
  const coverageAreaSqMiles = Math.PI * radius * radius;
  const estimatedCustomers = Math.floor(coverageAreaSqMiles * 2.5); // Rough estimate

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          Set Your Service Area
        </CardTitle>
        <CardDescription>
          Define where you're willing to travel for jobs
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Address Input */}
        <div className="space-y-2">
          <Label htmlFor="address">Business Address</Label>
          <div className="flex gap-2">
            <Input
              id="address"
              placeholder="123 Main St, City, State ZIP"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleGetCurrentLocation}
              variant="outline"
              disabled={loading}
              className="flex-shrink-0"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {loading ? 'Getting...' : 'Use GPS'}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            This will be the center of your service radius
          </p>
        </div>

        {/* Map Preview */}
        <div className="relative h-64 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
          {/* Simulated Map - In production, use Google Maps or Mapbox */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Center Pin */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg relative z-10"
              >
                <MapPin className="w-6 h-6 text-white" />
              </motion.div>
              
              {/* Radius Circle */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.2 }}
                transition={{ delay: 0.2 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 rounded-full"
                style={{
                  width: `${radius * 6}px`,
                  height: `${radius * 6}px`,
                }}
              />
              
              {/* Radius Line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute top-1/2 left-6 h-0.5 bg-blue-600 origin-left"
                style={{ width: `${radius * 3}px` }}
              />
              
              {/* Radius Label */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute top-1/2 left-6 transform translate-x-full -translate-y-8 bg-blue-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                style={{ marginLeft: `${radius * 3}px` }}
              >
                {radius} mi
              </motion.div>
            </div>
          </div>

          {/* Map Placeholder Notice */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-gray-600 shadow-sm">
            Interactive map preview
          </div>
        </div>

        {/* Radius Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="radius">Service Radius</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    A larger radius increases your exposure to more customers,
                    but may require longer drive times
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="space-y-2">
            <Slider
              id="radius"
              min={5}
              max={50}
              step={1}
              value={[radius]}
              onValueChange={handleRadiusChange}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>5 mi</span>
              <span className="font-medium text-blue-600">{radius} miles</span>
              <span>50 mi</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Coverage Area</p>
            <p className="text-xl text-blue-600">
              {coverageAreaSqMiles.toFixed(0)} mi²
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Est. Customers</p>
            <p className="text-xl text-green-600">
              ~{estimatedCustomers.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4"
          >
            <h4 className="text-sm mb-2">💡 Recommended Settings</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• <strong>Urban areas:</strong> 10-15 miles is ideal</li>
              <li>• <strong>Suburban areas:</strong> 20-25 miles covers more ground</li>
              <li>• <strong>Rural areas:</strong> 30-40 miles may be necessary</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
          >
            <h4 className="text-sm mb-2">⚡ How it works</h4>
            <p className="text-xs text-gray-700">
              Customers within your radius will see you in search results. 
              You can always adjust this later in your profile settings.
            </p>
          </motion.div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-sm mb-2">Summary</h4>
          <div className="space-y-1 text-sm text-gray-700">
            <p>📍 <strong>Center:</strong> {address || 'Not set'}</p>
            <p>📏 <strong>Radius:</strong> {radius} miles</p>
            <p>🎯 <strong>Status:</strong> {address ? 'Ready' : 'Enter your address to continue'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
