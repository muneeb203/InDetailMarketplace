import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Camera, Mic, X, Check, ChevronRight } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { Card } from './ui/card';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { Progress } from './ui/progress';

interface WalkaroundCaptureProps {
  open: boolean;
  onClose: () => void;
  onComplete: (photos: File[], voiceNote?: Blob, notes?: string) => void;
}

export function WalkaroundCapture({ 
  open, 
  onClose, 
  onComplete 
}: WalkaroundCaptureProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [voiceNote, setVoiceNote] = useState<Blob | null>(null);
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleNext = () => {
    if (step === 1 && photos.length === 0) {
      toast.error('Please add at least 2 photos for the walkaround');
      return;
    }
    if (step < 3) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handleComplete = () => {
    if (photos.length < 2) {
      toast.error('Please add at least 2 photos');
      return;
    }

    onComplete(photos, voiceNote || undefined, notes || undefined);
    
    // Reset
    setTimeout(() => {
      setStep(1);
      setPhotos([]);
      setVoiceNote(null);
      setNotes('');
    }, 300);
  };

  const handleSkipVoice = () => {
    setStep(3);
  };

  const progressValue = (step / 3) * 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="walkaround-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0078FF]/10 rounded-full flex items-center justify-center">
              <Camera className="w-4 h-4 text-[#0078FF]" />
            </div>
            Vehicle Walkaround
          </DialogTitle>
          <div className="space-y-2">
            <p id="walkaround-description" className="text-sm text-gray-600">
              Document the vehicle's condition before starting
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Step {step} of 3</span>
                <span>{Math.round(progressValue)}%</span>
              </div>
              <Progress value={progressValue} className="h-1.5" />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Step 1: Photos */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <Card className="p-3 bg-blue-50 border-blue-200">
                <p className="text-xs text-gray-700">
                  <strong>Tip:</strong> Capture front, back, both sides, and any areas of concern
                </p>
              </Card>
              
              <ImageUpload
                maxImages={6}
                onImagesChange={setPhotos}
                helperText="Take 2-6 photos showing all angles of the vehicle"
              />

              <p className="text-xs text-gray-500 text-center">
                {photos.length} of 2-6 photos added
              </p>
            </motion.div>
          )}

          {/* Step 2: Voice Note (Optional) */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Card className="p-3 bg-blue-50 border-blue-200">
                <p className="text-xs text-gray-700">
                  <strong>Optional:</strong> Add a quick voice summary of the vehicle's condition
                </p>
              </Card>

              {!voiceNote ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      // In production, this would open the VoiceNoteRecorder
                      toast.info('Voice recording would start here');
                      setIsRecording(true);
                      setTimeout(() => {
                        setIsRecording(false);
                        // Mock voice note
                        setVoiceNote(new Blob(['mock audio'], { type: 'audio/webm' }));
                      }, 2000);
                    }}
                    disabled={isRecording}
                    className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0078FF] hover:bg-gray-50 transition-all"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <Mic className="w-8 h-8 text-red-600" />
                      </div>
                      <p className="text-sm">
                        {isRecording ? 'Recording...' : 'Tap to Record Voice Note'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Describe any scratches, dents, or special conditions
                      </p>
                    </div>
                  </button>

                  <Button
                    onClick={handleSkipVoice}
                    variant="ghost"
                    className="w-full text-xs"
                  >
                    Skip voice note
                  </Button>
                </div>
              ) : (
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">Voice note recorded</p>
                      <p className="text-xs text-gray-600">Ready to continue</p>
                    </div>
                    <button
                      onClick={() => setVoiceNote(null)}
                      className="p-1 hover:bg-green-200 rounded-full"
                      aria-label="Remove voice note"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <Card className="p-3 bg-blue-50 border-blue-200">
                <p className="text-xs text-gray-700">
                  <strong>Review:</strong> Walkaround will be saved to booking record
                </p>
              </Card>

              {/* Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#0078FF]" />
                    <span className="text-sm">Photos</span>
                  </div>
                  <span className="text-sm">{photos.length} photos</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-[#0078FF]" />
                    <span className="text-sm">Voice Note</span>
                  </div>
                  <span className="text-sm">
                    {voiceNote ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Added
                      </span>
                    ) : (
                      <span className="text-gray-500">Skipped</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Photo Grid Preview */}
              <div className="grid grid-cols-3 gap-2">
                {photos.slice(0, 6).map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Walkaround photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          {step > 1 && (
            <Button
              onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={step === 1 && photos.length < 2}
              className="flex-1 bg-[#0078FF] hover:bg-[#0056CC]"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Complete Walkaround
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
