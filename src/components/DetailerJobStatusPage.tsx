import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
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
  AlertCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from "sonner";

type JobStatus = 'requested' | 'accepted' | 'on-the-way' | 'started' | 'completed' | 'cancelled';

interface StatusStep {
  id: JobStatus;
  label: string;
  icon: typeof Circle;
  confirmPrompt: string;
  confirmButton: string;
  timestamp?: string;
}

interface JobDetails {
  id: string;
  client: {
    name: string;
    avatar: string;
    phone: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
  };
  service: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  totalPrice: number;
  status: JobStatus;
  currentStep: number;
  steps: StatusStep[];
}

const mockJobDetails: JobDetails = {
  id: 'BK-2025-001',
  client: {
    name: 'Sarah Martinez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    phone: '(555) 123-4567',
  },
  vehicle: {
    make: 'Tesla',
    model: 'Model 3',
    year: 2022,
    color: 'Midnight Silver',
  },
  service: 'Premium Interior & Exterior Detail',
  scheduledDate: 'Oct 20, 2025',
  scheduledTime: '2:00 PM',
  address: '123 Main St, San Francisco, CA 94102',
  totalPrice: 189,
  status: 'accepted',
  currentStep: 1,
  steps: [
    {
      id: 'requested',
      label: 'Requested',
      icon: Circle,
      confirmPrompt: '',
      confirmButton: '',
      timestamp: 'Oct 19, 10:30 AM',
    },
    {
      id: 'accepted',
      label: 'Accepted',
      icon: Circle,
      confirmPrompt: 'Accept this job?',
      confirmButton: 'Accept Job',
      timestamp: 'Oct 19, 10:45 AM',
    },
    {
      id: 'on-the-way',
      label: 'On the Way',
      icon: Navigation,
      confirmPrompt: 'Confirm you are en route to the client.',
      confirmButton: 'Confirm En Route',
      timestamp: undefined,
    },
    {
      id: 'started',
      label: 'Started',
      icon: Play,
      confirmPrompt: 'Start the service now?',
      confirmButton: 'Start Service',
      timestamp: undefined,
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle2,
      confirmPrompt: 'Mark this job as completed?',
      confirmButton: 'Mark Complete',
      timestamp: undefined,
    },
  ],
};

interface DetailerJobStatusPageProps {
  bookingId?: string;
  onBack?: () => void;
  onNavigateToMessages?: () => void;
}

export function DetailerJobStatusPage({ 
  bookingId = 'BK-2025-001', 
  onBack,
  onNavigateToMessages 
}: DetailerJobStatusPageProps) {
  const [jobDetails, setJobDetails] = useState<JobDetails>(mockJobDetails);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNotes, setCancelNotes] = useState('');
  const [nextStep, setNextStep] = useState<StatusStep | null>(null);

  const handleAdvanceStatus = (step: StatusStep) => {
    setNextStep(step);
    setShowConfirmDialog(true);
  };

  const confirmAdvanceStatus = () => {
    if (!nextStep) return;

    const newSteps = [...jobDetails.steps];
    const stepIndex = newSteps.findIndex(s => s.id === nextStep.id);
    
    if (stepIndex !== -1) {
      const now = new Date();
      const timestamp = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        timestamp,
      };

      setJobDetails({
        ...jobDetails,
        status: nextStep.id,
        currentStep: stepIndex,
        steps: newSteps,
      });

      toast.success(
        <div>
          <p className="font-medium">Status updated ✓</p>
          <p className="text-xs text-gray-600 mt-1">Client will be notified</p>
        </div>
      );
    }

    setShowConfirmDialog(false);
    setNextStep(null);
  };

  const handleCancelJob = () => {
    if (!cancelReason) {
      toast.error('Please select a cancellation reason');
      return;
    }

    toast.success('Job cancelled. Client has been notified.');
    setShowCancelDialog(false);
    
    setJobDetails({
      ...jobDetails,
      status: 'cancelled',
    });
  };

  const handleMessageClient = () => {
    if (onNavigateToMessages) {
      onNavigateToMessages();
    } else {
      toast.info('Opening conversation...');
    }
  };

  const getNextAvailableStep = (): StatusStep | null => {
    if (jobDetails.currentStep >= jobDetails.steps.length - 1) {
      return null;
    }
    return jobDetails.steps[jobDetails.currentStep + 1];
  };

  const nextAvailableStep = getNextAvailableStep();

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
              <h1 className="text-xl">Job Status (Detailer)</h1>
              <p className="text-xs text-gray-600 leading-relaxed">
                Keep your client informed at each step.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-4">
          {/* Client Info Card */}
          <Card className="p-4 border">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={jobDetails.client.avatar} />
                <AvatarFallback>{jobDetails.client.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm truncate">{jobDetails.client.name}</h3>
                <p className="text-xs text-gray-600">{jobDetails.client.phone}</p>
                <p className="text-xs text-gray-600">
                  {jobDetails.vehicle.year} {jobDetails.vehicle.make} {jobDetails.vehicle.model}
                </p>
              </div>
              <Button
                onClick={handleMessageClient}
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs border-[#0078FF] text-[#0078FF] hover:bg-[#0078FF] hover:text-white"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                Message
              </Button>
            </div>
          </Card>

          {/* Current Status Banner */}
          {jobDetails.status !== 'completed' && jobDetails.status !== 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4"
            >
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#0078FF] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 mb-1">
                    Current Status: <span className="font-medium">{jobDetails.steps[jobDetails.currentStep].label}</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    Client will receive real-time notifications when you update the job status.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Status Control */}
          <Card className="p-4 border">
            <h2 className="text-sm mb-4">Status Control</h2>
            <div className="relative">
              {jobDetails.steps.map((step, index) => {
                const isCompleted = index < jobDetails.currentStep;
                const isCurrent = index === jobDetails.currentStep;
                const isNext = index === jobDetails.currentStep + 1;
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
                              ? 'bg-[#0078FF] text-white'
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
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3
                              className={`text-sm mb-1 ${
                                isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                              }`}
                            >
                              {step.label}
                            </h3>
                            {step.timestamp && (
                              <p className="text-xs text-gray-500">{step.timestamp}</p>
                            )}
                            {isCurrent && (
                              <Badge className="bg-[#0078FF] text-white text-xs px-2 py-0 mt-1">
                                Current
                              </Badge>
                            )}
                          </div>

                          {/* Action Button */}
                          {isNext && step.confirmPrompt && (
                            <Button
                              onClick={() => handleAdvanceStatus(step)}
                              size="sm"
                              className="bg-[#0078FF] hover:bg-[#0056CC] text-white h-8 text-xs px-3"
                            >
                              {step.id === 'on-the-way' && 'I\'m On The Way'}
                              {step.id === 'started' && 'Start Now'}
                              {step.id === 'completed' && 'Mark Complete'}
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
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
              <h2 className="text-sm">Job Details</h2>
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
              onClick={handleMessageClient}
              className="w-full bg-[#0078FF] hover:bg-[#0056CC] text-white h-11"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Client
            </Button>

            {jobDetails.status !== 'completed' && jobDetails.status !== 'cancelled' && (
              <Button
                onClick={() => setShowCancelDialog(true)}
                variant="outline"
                className="w-full h-11 border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Job
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Advance Status Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">
              {nextStep?.confirmPrompt}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              The client will receive an instant notification about this status update.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAdvanceStatus}
              className="bg-[#0078FF] hover:bg-[#0056CC] text-xs"
            >
              {nextStep?.confirmButton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Job Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Cancel Job?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Please select a reason for cancellation. The client will be notified and refunded.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-700 mb-1.5 block">Reason *</label>
              <Select value={cancelReason} onValueChange={setCancelReason}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency" className="text-xs">Personal Emergency</SelectItem>
                  <SelectItem value="equipment" className="text-xs">Equipment Issue</SelectItem>
                  <SelectItem value="weather" className="text-xs">Weather Conditions</SelectItem>
                  <SelectItem value="scheduling" className="text-xs">Scheduling Conflict</SelectItem>
                  <SelectItem value="other" className="text-xs">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-gray-700 mb-1.5 block">Additional Notes (optional)</label>
              <Textarea
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                placeholder="Provide additional context for the client..."
                className="text-xs resize-none"
                rows={3}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Keep Job</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelJob}
              className="bg-red-600 hover:bg-red-700 text-xs"
            >
              Cancel Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Full Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Job Details</DialogTitle>
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
              <p className="text-xs text-gray-600">{jobDetails.vehicle.color}</p>
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
              <p className="text-xs text-gray-600 mb-1">Client</p>
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={jobDetails.client.avatar} />
                  <AvatarFallback>{jobDetails.client.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-900">{jobDetails.client.name}</p>
                  <p className="text-xs text-gray-600">{jobDetails.client.phone}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm">Your Earnings</span>
                <span className="text-base text-gray-900">${jobDetails.totalPrice}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
