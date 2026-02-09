import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Detailer, ServiceRequest } from '../types';
import { ArrowLeft, DollarSign, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { availableServices, vehicleTypes } from '../data/mockData';
import { PhotoUpload } from './PhotoUpload';
import { WaterSourceQuestion, WaterSourceAnswer } from './WaterSourceQuestion';
import { InPersonEstimateToggle } from './InPersonEstimateToggle';

interface BookingRequestFormProps {
  detailer?: Detailer;
  onBack: () => void;
  onSubmit: (request: Partial<ServiceRequest>) => void;
}

export function BookingRequestForm({ detailer, onBack, onSubmit }: BookingRequestFormProps) {
  const [formData, setFormData] = useState({
    vehicleType: '',
    services: [] as string[],
    preferredDate: '',
    preferredTime: '',
    location: '',
    notes: '',
    carPhotos: [] as string[],
    waterSource: null as WaterSourceAnswer | null,
    isInPersonEstimate: false
  });

  const [showLeadCost, setShowLeadCost] = useState(false);

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLeadCost(true);
  };

  const handleConfirmRequest = () => {
    const request: Partial<ServiceRequest> = {
      ...formData,
      status: 'pending',
      createdAt: new Date()
    };
    onSubmit(request);
  };

  const servicesToShow = detailer 
    ? detailer.services 
    : availableServices;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="p-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h2 className="mt-2">Request Service</h2>
          {detailer && (
            <p className="text-gray-600">from {detailer.businessName}</p>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto pb-24">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vehicle Type */}
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select
              value={formData.vehicleType}
              onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <Label>Services Needed</Label>
            <div className="space-y-2">
              {servicesToShow.map(service => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={formData.services.includes(service)}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                  <label
                    htmlFor={service}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {service}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferredDate">Preferred Date</Label>
              <Input
                id="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredTime">Preferred Time</Label>
              <Select
                value={formData.preferredTime}
                onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8:00 AM">8:00 AM</SelectItem>
                  <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                  <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                  <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                  <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                  <SelectItem value="1:00 PM">1:00 PM</SelectItem>
                  <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                  <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                  <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                  <SelectItem value="5:00 PM">5:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Service Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              placeholder="123 Main St, Your City"
            />
          </div>

          {/* Service Type (In-Person Estimate Toggle) */}
          <InPersonEstimateToggle
            value={formData.isInPersonEstimate}
            onChange={(value) => setFormData({ ...formData, isInPersonEstimate: value })}
          />

          {/* Car Photos */}
          <div className="space-y-2">
            <PhotoUpload
              photos={formData.carPhotos}
              onChange={(photos) => setFormData({ ...formData, carPhotos: photos })}
              maxPhotos={5}
              folder="car-photos"
              title="Car Photos (Optional)"
              description="Upload photos so detailers can give you the most accurate quote"
              showCamera={true}
            />
          </div>

          {/* Water Source Question */}
          <WaterSourceQuestion
            value={formData.waterSource}
            onChange={(value) => setFormData({ ...formData, waterSource: value })}
            role="client"
          />

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requests or details the detailer should know..."
              rows={4}
              aria-label="Additional notes for the detailer"
            />
            <p className="text-xs text-gray-500">
              Example: "Heavy pet hair in back seat" or "Please use fragrance-free products"
            </p>
          </div>

          {!detailer && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your request will be sent to up to 3 nearby detailers. They'll review and respond with quotes.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-md mx-auto">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={formData.services.length === 0 || !formData.vehicleType}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Submit Request
          </Button>
        </div>
      </div>

      {/* Lead Cost Modal */}
      {showLeadCost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="mb-2">Confirm Request</h3>
              <p className="text-gray-600">
                {detailer 
                  ? `Send this request to ${detailer.businessName}?`
                  : 'Send this request to nearby detailers?'
                }
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span>{formData.vehicleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Services:</span>
                  <span>{formData.services.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{formData.preferredDate}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowLeadCost(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRequest}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
