import { useState } from 'react';
import { Booking, Detailer } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, MapPin, Clock, CheckCircle2, Navigation, Sparkles, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';

interface ServiceStatusTrackerProps {
  booking: Booking;
  detailer: Detailer;
  onBack: () => void;
  onMessage: () => void;
  onUpdateStatus?: (status: Booking['status']) => void;
  isDetailer?: boolean;
}

export function ServiceStatusTracker({ 
  booking, 
  detailer, 
  onBack, 
  onMessage,
  onUpdateStatus,
  isDetailer = false
}: ServiceStatusTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState(booking.status);

  const getStatusProgress = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 25;
      case 'on-the-way': return 50;
      case 'started': return 75;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const handleStatusUpdate = (newStatus: Booking['status']) => {
    setCurrentStatus(newStatus);
    onUpdateStatus?.(newStatus);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const statusSteps = [
    { status: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { status: 'on-the-way', label: 'On the way', icon: Navigation },
    { status: 'started', label: 'In progress', icon: Sparkles },
    { status: 'completed', label: 'Completed', icon: CheckCircle2 }
  ] as const;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="p-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-24">
        <div className="p-6 space-y-6">
          {/* Status Progress */}
          <div className="bg-blue-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Service Status</h3>
              <Badge className={
                currentStatus === 'completed' ? 'bg-green-500' :
                currentStatus === 'started' ? 'bg-blue-500' :
                currentStatus === 'on-the-way' ? 'bg-yellow-500' :
                'bg-gray-500'
              }>
                {statusSteps.find(s => s.status === currentStatus)?.label}
              </Badge>
            </div>
            <Progress value={getStatusProgress(currentStatus)} className="mb-6" />
            
            {/* Status Steps */}
            <div className="space-y-3">
              {statusSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = statusSteps.findIndex(s => s.status === currentStatus) >= index;
                const isCurrent = step.status === currentStatus;
                
                return (
                  <div 
                    key={step.status}
                    className={`flex items-center gap-3 ${isActive ? 'opacity-100' : 'opacity-30'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <StepIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <span className={isCurrent ? '' : ''}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailer Info */}
          <div className="border rounded-xl p-4">
            <h3 className="mb-3">Your Detailer</h3>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {getInitials(detailer.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p>{detailer.name}</p>
                <p className="text-sm text-gray-600">{detailer.businessName}</p>
              </div>
              <Button variant="outline" size="sm" onClick={onMessage}>
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Booking Details */}
          <div className="border rounded-xl p-4 space-y-3">
            <h3>Booking Details</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">Date & Time</p>
                  <p>{booking.scheduledDate} at {booking.scheduledTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">Location</p>
                  <p>{booking.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">Services</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {booking.services.map(service => (
                      <Badge key={service} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-between">
              <span>Total</span>
              <span className="text-lg">${booking.price}</span>
            </div>
          </div>

          {/* Detailer Actions */}
          {isDetailer && currentStatus !== 'completed' && (
            <div className="border rounded-xl p-4">
              <h3 className="mb-3">Update Status</h3>
              <div className="space-y-2">
                {currentStatus === 'confirmed' && (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleStatusUpdate('on-the-way')}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    I'm on the way
                  </Button>
                )}
                {currentStatus === 'on-the-way' && (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleStatusUpdate('started')}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start service
                  </Button>
                )}
                {currentStatus === 'started' && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleStatusUpdate('completed')}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as completed
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Customer Live Updates Message */}
          {!isDetailer && currentStatus !== 'completed' && (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">
                You'll receive real-time updates as your detailer progresses
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action */}
      {!isDetailer && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-md mx-auto">
            <Button 
              onClick={onMessage}
              className="w-full"
              variant="outline"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Message Detailer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
