import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Play, Pause } from 'lucide-react';
import { Progress } from './ui/progress';
import { motion } from 'motion/react';

interface VoiceNotePlayerProps {
  audioUrl: string;
  duration: number;
  transcript?: string;
  isSender?: boolean;
}

export function VoiceNotePlayer({ 
  audioUrl, 
  duration, 
  transcript,
  isSender = false 
}: VoiceNotePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center gap-3 p-3 rounded-2xl max-w-xs ${
          isSender
            ? 'bg-[#0078FF] text-white ml-auto'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
            isSender
              ? 'bg-white/20 hover:bg-white/30'
              : 'bg-white hover:bg-gray-200'
          }`}
          aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
        >
          {isPlaying ? (
            <Pause className={`w-4 h-4 ${isSender ? 'text-white' : 'text-[#0078FF]'}`} />
          ) : (
            <Play className={`w-4 h-4 ml-0.5 ${isSender ? 'text-white' : 'text-[#0078FF]'}`} />
          )}
        </button>

        {/* Waveform & Duration */}
        <div className="flex-1 min-w-0">
          <div className="mb-1">
            <Progress 
              value={progress} 
              className={`h-1 ${isSender ? 'bg-white/20' : 'bg-gray-200'}`}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={isSender ? 'text-white/80' : 'text-gray-600'}>
              {formatTime(currentTime)}
            </span>
            <span className={isSender ? 'text-white/80' : 'text-gray-600'}>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className={isSender ? 'text-right' : ''}>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            {showTranscript ? 'Hide' : 'Show'} transcript
          </button>
          {showTranscript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mt-1 p-2 rounded-lg text-xs ${
                isSender
                  ? 'bg-[#0078FF]/10 text-gray-700 ml-auto max-w-xs'
                  : 'bg-gray-50 text-gray-700 max-w-xs'
              }`}
            >
              <p className="italic">"{transcript}"</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
