import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Play, Upload, X, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface DetailerIntroVideoProps {
  videoUrl?: string;
  onUpload?: (file: File) => void;
  onRemove?: () => void;
  isEditable?: boolean;
}

export function DetailerIntroVideo({ 
  videoUrl, 
  onUpload, 
  onRemove,
  isEditable = false 
}: DetailerIntroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video must be less than 50MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      onUpload?.(file);
      toast.success('Intro video uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  if (!videoUrl && !isEditable) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-2 border-[#0078FF]/20">
      {videoUrl ? (
        <div className="relative">
          {/* Video Player / Thumbnail */}
          <div className="relative aspect-video bg-gray-900">
            {!isPlaying ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <motion.button
                  onClick={() => setIsPlaying(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-2xl transition-all"
                  aria-label="Play intro video"
                >
                  <Play className="w-8 h-8 text-[#0078FF] ml-1" />
                </motion.button>
                <Badge className="absolute top-3 left-3 bg-[#0078FF] text-white border-0">
                  <Video className="w-3 h-3 mr-1" />
                  Meet Your Detailer
                </Badge>
              </div>
            ) : (
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
                onEnded={() => setIsPlaying(false)}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Caption */}
          <div className="p-3 bg-gradient-to-r from-[#0078FF]/5 to-transparent border-t border-[#0078FF]/10">
            <p className="text-xs text-gray-700">
              <strong>30-60 second introduction</strong> — Get to know your detailer before booking
            </p>
          </div>

          {/* Remove Button (Edit Mode) */}
          {isEditable && onRemove && (
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
              aria-label="Remove intro video"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
          )}
        </div>
      ) : isEditable ? (
        <div className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#0078FF]/10 rounded-full flex items-center justify-center mx-auto">
              <Video className="w-8 h-8 text-[#0078FF]" />
            </div>

            <div>
              <h3 className="text-sm mb-1">Add Your Intro Video</h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                Record a 30-60 second video introducing yourself and your services. 
                This helps build trust with potential clients.
              </p>
            </div>

            <div>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="intro-video-upload"
                disabled={isUploading}
              />
              <label htmlFor="intro-video-upload">
                <Button
                  as="span"
                  disabled={isUploading}
                  className="bg-[#0078FF] hover:bg-[#0056CC] cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Video'}
                </Button>
              </label>
            </div>

            <Card className="p-3 bg-blue-50 border-blue-200 text-left">
              <p className="text-xs text-gray-700">
                <strong>Tips for a great intro:</strong>
              </p>
              <ul className="text-xs text-gray-600 mt-1 space-y-0.5 ml-4 list-disc">
                <li>Introduce yourself and your experience</li>
                <li>Show your work or equipment</li>
                <li>Explain what makes your service special</li>
                <li>Keep it under 60 seconds</li>
              </ul>
            </Card>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

export function IntroVideoBadge() {
  return (
    <Badge className="bg-[#0078FF]/10 text-[#0078FF] border-[#0078FF]/30 text-xs">
      <Video className="w-3 h-3 mr-1" />
      Intro
    </Badge>
  );
}
