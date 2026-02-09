import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  MapPin, 
  MessageSquare, 
  FileText, 
  XCircle,
  Navigation,
  Play,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from "sonner";

type JobStatus = 'requested' | 'accepted' | 'on-the-way' | 'started' | 'completed' | 'cancelled';

interface StatusStep {
  id: JobStatus;
  label: string;
  icon: typeof Circle;
  timestamp?: string;
}

interface JobDetails {
  id: string;
  detailer: {
    name: string;
    avatar: string;
    rating: number;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
  };
  service: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  totalPrice: number;
  status: JobStatus;
  currentStep: number;
  eta?: string;
  lastUpdate?: string;
  steps: StatusStep[];
}

const mockJobDetails: JobDetails = {
  id: 'BK-2025-001',
  detailer: {
    name: 'Mike Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    rating: 4.9,
  },
  vehicle: {
    make: 'Tesla',
    model: 'Model 3',
    year: 2022,
  },
  service: 'Premium Interior & Exterior Detail',
  scheduledDate: 'Oct 20, 2025',
  scheduledTime: '2:00 PM',
  address: '123 Main St, San Francisco, CA 94102',
  totalPrice: 189,
  status: 'on-the-way',
  currentStep: 2,
  eta: '12 min',
  lastUpdate: '5 min ago',
  steps: [
    {
      id: 'requested',
      label: 'Requested',
      icon: Circle,
      timestamp: 'Oct 19, 10:30 AM',
    },
    {
      id: 'accepted',
      label: 'Accepted',
      icon: Circle,
      timestamp: 'Oct 19, 10:45 AM',
    },
    {
      id: 'on-the-way',
      label: 'On the Way',
      icon: Navigation,
      timestamp: 'Oct 20, 1:48 PM',
    },
    {
      id: 'started',
      label: 'Started',
      icon: Play,
      timestamp: undefined,
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle2,
      timestamp: undefined,
    },
  ],
};

interface ClientJobStatusPageProps {
  bookingId?: string;
  onBack?: () => void;
  onNavigateToMessages?: () => void;
}

export function ClientJobStatusPage({ 
  bookingId = 'BK-2025-001', 
  onBack,
  onNavigateToMessages 
}: ClientJobStatusPageProps) {
  const [jobDetails] = useState<JobDetails>(mockJobDetails);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleMessageDetailer = () => {
    if (onNavigateToMessages) {
      onNavigateToMessages();
    } else {
      toast.info('Opening conversation...');
    }
  };

  const handleCancelJob = () => {
    toast.success('Booking cancelled. Refund will be processed within 3-5 business days.');
    setShowCancelDialog(false);
    // In production, this would update the booking status
  };

  const canCancel = jobDetails.currentStep <= 1; // Can only cancel if Requested or Accepted

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#EAF5FF] to-white overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            {onBack && (
              <button
                onClick={onBack}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-xl">Job Status</h1>
              <p className="text-xs text-gray-600 leading-relaxed">
                Live updates from your trusted detailer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-4">
          {/* Detailer Info Card */}
          <Card className="p-4 border">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={jobDetails.detailer.avatar} />
                <AvatarFallback>{jobDetails.detailer.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm truncate">{jobDetails.detailer.name}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <span>★ {jobDetails.detailer.rating}</span>
                  <span>•</span>
                  <span>{jobDetails.vehicle.year} {jobDetails.vehicle.make} {jobDetails.vehicle.model}</span>
                </div>
              </div>
              <Button
                onClick={handleMessageDetailer}
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs border-[#0078FF] text-[#0078FF] hover:bg-[#0078FF] hover:text-white"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                Message
              </Button>
            </div>
          </Card>

          {/* Live Status Banner */}
          {jobDetails.currentStep > 0 && jobDetails.currentStep < 4 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-900">
                    {jobDetails.status === 'on-the-way' && 'Detailer is on the way'}
                    {jobDetails.status === 'started' && 'Service in progress'}
                    {jobDetails.status === 'accepted' && 'Detailer accepted your request'}
                  </span>
                </div>
                {jobDetails.eta && jobDetails.status === 'on-the-way' && (
                  <Badge className="bg-[#0078FF] text-white text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    ETA {jobDetails.eta}
                  </Badge>
                )}
              </div>
              {jobDetails.lastUpdate && (
                <p className="text-xs text-gray-600 mt-2">
                  Last update {jobDetails.lastUpdate}
                </p>
              )}
            </motion.div>
          )}

          {/* Status Timeline */}
          <Card className="p-4 border">
            <h2 className="text-sm mb-4">Progress</h2>
            <div className="relative">
              {jobDetails.steps.map((step, index) => {
                const isCompleted = index < jobDetails.currentStep;
                const isCurrent = index === jobDetails.currentStep;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="relative">
                    <div className="flex gap-3 pb-6 last:pb-0">
                      {/* Icon */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isCurrent
                              ? 'bg-[#0078FF] text-white animate-pulse'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </div>

                        {/* Connector Line */}
                        {index < jobDetails.steps.length - 1 && (
                          <div
                            className={`absolute left-4 top-8 w-0.5 h-6 transition-all ${
                              isCompleted ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`text-sm ${
                              isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                            }`}
                          >
                            {step.label}
                          </h3>
                          {step.timestamp && (
                            <span className="text-xs text-gray-500">{step.timestamp}</span>
                          )}
                        </div>
                        {isCurrent && (
                          <p className="text-xs text-[#0078FF] mt-1">Current status</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Booking Details Summary */}
          <Card className="p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm">Booking Details</h2>
              <Button
                onClick={() => setShowDetailsModal(true)}
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-[#0078FF] hover:bg-blue-50"
              >
                View Full Details
              </Button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#0078FF] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Scheduled</p>
                  <p className="text-sm text-gray-900">
                    {jobDetails.scheduledDate} at {jobDetails.scheduledTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#0078FF] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Location</p>
                  <p className="text-sm text-gray-900">{jobDetails.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-[#0078FF] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Service</p>
                  <p className="text-sm text-gray-900">{jobDetails.service}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleMessageDetailer}
              className="w-full bg-[#0078FF] hover:bg-[#0056CC] text-white h-11"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Detailer
            </Button>

            {canCancel && (
              <Button
                onClick={() => setShowCancelDialog(true)}
                variant="outline"
                className="w-full h-11 border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Full Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Booking Details</DialogTitle>
            <DialogDescription className="text-xs">
              Booking ID: {jobDetails.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">Service</p>
              <p className="text-sm text-gray-900">{jobDetails.service}</p>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-1">Vehicle</p>
              <p className="text-sm text-gray-900">
                {jobDetails.vehicle.year} {jobDetails.vehicle.make} {jobDetails.vehicle.model}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-1">Scheduled</p>
              <p className="text-sm text-gray-900">
                {jobDetails.scheduledDate} at {jobDetails.scheduledTime}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-1">Location</p>
              <p className="text-sm text-gray-900">{jobDetails.address}</p>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-1">Detailer</p>
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={jobDetails.detailer.avatar} />
                  <AvatarFallback>{jobDetails.detailer.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-900">{jobDetails.detailer.name}</p>
                  <p className="text-xs text-gray-600">★ {jobDetails.detailer.rating}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total</span>
                <span className="text-base text-gray-900">${jobDetails.totalPrice}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Cancel Booking?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to cancel this booking? A full refund will be processed within
              3-5 business days.
              {!canCancel && (
                <span className="block mt-2 text-red-600">
                  Cancellation is only available before the detailer is on the way.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelJob}
              className="bg-red-600 hover:bg-red-700 text-xs"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
