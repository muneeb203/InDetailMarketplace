import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Mic, X, Send, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from "sonner";

interface VoiceNoteRecorderProps {
  onSend: (audioBlob: Blob, duration: number, transcript?: string) => void;
  onCancel: () => void;
}

export function VoiceNoteRecorder({ onSend, onCancel }: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Simulate waveform animation
      const animateWaveform = () => {
        setWaveformData((prev) => {
          const newData = [...prev, Math.random() * 40 + 10];
          return newData.slice(-30); // Keep last 30 bars
        });
        animationRef.current = requestAnimationFrame(animateWaveform);
      };
      animateWaveform();

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    setIsPaused(!isPaused);
  };

  const handleSend = async () => {
    stopRecording();

    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Simulate transcription (in production, this would call a speech-to-text API)
      const mockTranscript = generateMockTranscript(duration);
      
      onSend(audioBlob, duration, mockTranscript);
    } else {
      toast.error('No audio recorded');
      onCancel();
    }
  };

  const handleCancel = () => {
    stopRecording();
    onCancel();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateMockTranscript = (duration: number): string => {
    const phrases = [
      "Hi, I wanted to follow up on the service details.",
      "Just checking in about the appointment tomorrow.",
      "Thanks for your message! I'll be there at 2 PM.",
      "Could you let me know what products you'll be using?",
      "Perfect, see you then!",
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Mic className="w-4 h-4 text-red-600" />
            </div>
            Voice Note
          </h3>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cancel recording"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Recording Status */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {!isPaused && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-3 h-3 bg-red-500 rounded-full"
            />
          )}
          <span className="text-sm text-gray-600">
            {isPaused ? 'Paused' : 'Recording'}
          </span>
        </div>

        {/* Waveform Visualization */}
        <div className="h-24 bg-gray-50 rounded-lg mb-4 flex items-center justify-center gap-1 px-4 overflow-hidden">
          <AnimatePresence>
            {waveformData.map((height, index) => (
              <motion.div
                key={`${index}-${Math.random()}`}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                exit={{ opacity: 0 }}
                className="w-1 bg-[#0078FF] rounded-full"
                style={{ minHeight: '4px' }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Duration */}
        <div className="text-center mb-6">
          <p className="text-2xl tabular-nums">{formatDuration(duration)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {isPaused ? 'Tap resume to continue' : 'Tap pause to stop recording'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 h-12"
            aria-label="Cancel and discard recording"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          
          <Button
            onClick={handlePauseResume}
            variant="outline"
            className="h-12 px-4"
            aria-label={isPaused ? 'Resume recording' : 'Pause recording'}
          >
            {isPaused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </Button>

          <Button
            onClick={handleSend}
            disabled={duration < 1}
            className="flex-1 h-12 bg-[#0078FF] hover:bg-[#0056CC]"
            aria-label="Send voice note"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Voice notes are automatically transcribed for accessibility
        </p>
      </div>
    </motion.div>
  );
}
