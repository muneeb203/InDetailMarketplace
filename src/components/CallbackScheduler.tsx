import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Calendar, Clock, Check, Phone } from 'lucide-react';
import { Card } from './ui/card';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface CallbackSchedulerProps {
  open: boolean;
  onClose: () => void;
  detailerName: string;
  onSchedule: (date: string, timeWindow: string) => void;
}

const availableDates = [
  { value: 'today', label: 'Today', date: new Date().toLocaleDateString() },
  { value: 'tomorrow', label: 'Tomorrow', date: new Date(Date.now() + 86400000).toLocaleDateString() },
  { value: 'day-after', label: new Date(Date.now() + 172800000).toLocaleDateString(), date: new Date(Date.now() + 172800000).toLocaleDateString() },
];

const timeWindows = [
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
  '5:00 PM - 6:00 PM',
];

export function CallbackScheduler({ 
  open, 
  onClose, 
  detailerName,
  onSchedule 
}: CallbackSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }

    onSchedule(selectedDate, selectedTime);
    setStep('confirm');
    
    setTimeout(() => {
      onClose();
      setStep('select');
      setSelectedDate('');
      setSelectedTime('');
    }, 2000);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('select');
      setSelectedDate('');
      setSelectedTime('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" aria-describedby="callback-scheduler-description">
        <p id="callback-scheduler-description" className="sr-only">
          Schedule a callback from {detailerName} by selecting a date and time window
        </p>
        {step === 'select' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0078FF]/10 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4 text-[#0078FF]" />
                </div>
                Request a Call
              </DialogTitle>
              <p className="text-sm text-gray-600">
                {detailerName} will call you during your selected time window
              </p>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Date Selection */}
              <div>
                <Label className="text-sm mb-2 block flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0078FF]" />
                  Select Date
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {availableDates.map((date) => (
                    <button
                      key={date.value}
                      onClick={() => setSelectedDate(date.value)}
                      className={`p-3 rounded-lg border-2 text-xs transition-all ${
                        selectedDate === date.value
                          ? 'border-[#0078FF] bg-[#0078FF]/5 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="mb-0.5">{date.label}</p>
                      <p className="text-gray-500">{date.date.split('/').slice(0, 2).join('/')}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Window Selection */}
              <div>
                <Label className="text-sm mb-2 block flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0078FF]" />
                  Select Time Window (1 hour)
                </Label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {timeWindows.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2.5 rounded-lg border-2 text-xs transition-all ${
                        selectedTime === time
                          ? 'border-[#0078FF] bg-[#0078FF]/5 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {selectedDate && selectedTime && (
                <Card className="p-3 bg-blue-50 border-blue-200">
                  <p className="text-xs text-gray-700 mb-1">Callback scheduled for:</p>
                  <p className="text-sm">
                    <strong>{availableDates.find(d => d.value === selectedDate)?.label}</strong>
                    {' '}at{' '}
                    <strong>{selectedTime}</strong>
                  </p>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSchedule}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 bg-[#0078FF] hover:bg-[#0056CC]"
              >
                <Phone className="w-4 h-4 mr-2" />
                Schedule Call
              </Button>
            </DialogFooter>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg mb-2">Call Scheduled!</h3>
            <p className="text-sm text-gray-600 mb-4">
              {detailerName} will call you during your selected time window.
              You'll receive a reminder 30 minutes before.
            </p>
            <p className="text-xs text-gray-500">
              {availableDates.find(d => d.value === selectedDate)?.label} at {selectedTime}
            </p>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
