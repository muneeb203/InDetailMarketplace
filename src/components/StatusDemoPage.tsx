import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Clock,
  Check,
  Navigation,
  Play,
  CheckCircle,
  X,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

type StatusStep =
  | 'requested'
  | 'accepted'
  | 'on-the-way'
  | 'started'
  | 'completed'
  | 'cancelled';

interface StatusDemoPageProps {
  onBack: () => void;
}

const STEPS: {
  key: StatusStep;
  label: string;
  icon: any;
  color: string;
}[] = [
  { key: 'requested', label: 'Requested', icon: Clock, color: 'gray' },
  { key: 'accepted', label: 'Accepted', icon: Check, color: 'blue' },
  { key: 'on-the-way', label: 'On the Way', icon: Navigation, color: 'indigo' },
  { key: 'started', label: 'Started', icon: Play, color: 'purple' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'green' },
];

const CANCEL_REASONS = [
  'Customer requested cancellation',
  'Unable to reach location',
  'Weather conditions',
  'Equipment issue',
  'Schedule conflict',
  'Other',
];

export function StatusDemoPage({ onBack }: StatusDemoPageProps) {
  const [currentStatus, setCurrentStatus] = useState<StatusStep>('requested');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [nextStatus, setNextStatus] = useState<StatusStep | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  const getConfirmationMessage = (status: StatusStep) => {
    switch (status) {
      case 'accepted':
        return {
          title: 'Accept this job?',
          description:
            'Confirm you want to accept this job request. The customer will be notified.',
          action: 'Accept Job',
        };
      case 'on-the-way':
        return {
          title: "You're on the way?",
          description:
            "Confirm you're en route to the customer's location. They'll receive an update.",
          action: 'Confirm On the Way',
        };
      case 'started':
        return {
          title: 'Start the service?',
          description:
            "Confirm you're starting the service now. The timer will begin.",
          action: 'Start Service',
        };
      case 'completed':
        return {
          title: 'Mark as completed?',
          description:
            'Confirm the job is completed and ready for customer review.',
          action: 'Mark Completed',
        };
      default:
        return {
          title: 'Confirm action',
          description: 'Are you sure you want to proceed?',
          action: 'Confirm',
        };
    }
  };

  const handleContinue = () => {
    if (currentIndex < STEPS.length - 1) {
      const next = STEPS[currentIndex + 1].key;
      setNextStatus(next);
      setShowConfirmModal(true);
    }
  };

  const handleConfirm = () => {
    if (nextStatus) {
      setCurrentStatus(nextStatus);
      setShowConfirmModal(false);
      setNextStatus(null);
      toast.success('Status updated', {
        description: `Job status changed to ${STEPS.find((s) => s.key === nextStatus)?.label}`,
      });
      
      // Analytics anchor
      console.log('Analytics: status_demo_step_confirmed', { status: nextStatus });
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (cancelReason) {
      setCurrentStatus('cancelled');
      setShowCancelModal(false);
      setCancelReason('');
      toast.error('Job cancelled', {
        description: `Reason: ${cancelReason}`,
      });
      
      // Analytics anchor
      console.log('Analytics: status_demo_cancelled', { reason: cancelReason });
    }
  };

  const handleReset = () => {
    setCurrentStatus('requested');
    toast.success('Demo reset');
  };

  const confirmMessage = nextStatus ? getConfirmationMessage(nextStatus) : null;
  const canCancel = currentStatus === 'accepted' || currentStatus === 'on-the-way';
  const isCompleted = currentStatus === 'completed' || currentStatus === 'cancelled';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h1>Status Demo</h1>
                <p className="text-sm text-gray-600">
                  Practice updating job status
                </p>
              </div>
            </div>

            {/* Info Banner */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900">
                    This demo helps you practice status updates your clients will see.
                    Each step requires confirmation before proceeding.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress Bar */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3>Job Progress</h3>
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </Card>

          {/* Status Steps */}
          <Card className="p-6">
            <div className="space-y-6">
              {currentStatus !== 'cancelled' ? (
                STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index <= currentIndex;
                  const isCurrent = step.key === currentStatus;

                  return (
                    <motion.div
                      key={step.key}
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0.4,
                      }}
                      className="flex items-start gap-4"
                    >
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCurrent
                            ? 'bg-blue-600 ring-4 ring-blue-100'
                            : isActive
                            ? 'bg-green-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            isCurrent
                              ? 'text-white'
                              : isActive
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-2">
                        <h4
                          className={
                            isCurrent ? 'text-blue-600' : isActive ? '' : 'text-gray-400'
                          }
                        >
                          {step.label}
                        </h4>
                        {isCurrent && (
                          <p className="text-sm text-gray-600 mt-1">Current status</p>
                        )}
                        {isActive && !isCurrent && (
                          <div className="flex items-center gap-2 mt-1">
                            <Check className="w-4 h-4 text-green-600" />
                            <p className="text-sm text-green-600">Completed</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="mb-2">Job Cancelled</h3>
                  <p className="text-sm text-gray-600">Reason: {cancelReason}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Mock Job Details */}
          {!isCompleted && (
            <Card className="p-6">
              <h3 className="mb-4">Mock Job Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer</span>
                  <span>John Doe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service</span>
                  <span>Full Detail</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle</span>
                  <span>2023 Tesla Model 3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span>123 Main St, SF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price</span>
                  <span>$150</span>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {!isCompleted ? (
              <>
                <Button
                  onClick={handleContinue}
                  className="w-full"
                  size="lg"
                  disabled={currentIndex >= STEPS.length - 1}
                >
                  Continue to Next Step
                </Button>
                {canCancel && (
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Cancel Job
                  </Button>
                )}
              </>
            ) : (
              <Button onClick={handleReset} className="w-full" size="lg">
                Reset Demo
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmMessage && (
        <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmMessage.title}</AlertDialogTitle>
              <AlertDialogDescription>{confirmMessage.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Back</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>
                {confirmMessage.action}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Cancel Modal */}
      <AlertDialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this job?</AlertDialogTitle>
            <AlertDialogDescription>
              Please select a reason for cancelling. The customer will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={cancelReason} onValueChange={setCancelReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {CANCEL_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelReason('')}>
              Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={!cancelReason}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
