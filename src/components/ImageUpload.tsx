import { useState, useRef, ChangeEvent } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from "sonner";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  progress: number;
  uploaded: boolean;
  error?: string;
}

interface ImageUploadProps {
  maxImages?: number;
  onImagesChange?: (images: File[]) => void;
  helperText?: string;
}

export function ImageUpload({ 
  maxImages = 5, 
  onImagesChange,
  helperText = 'Upload photos to help detailers quote accurately.'
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToAdd = Array.from(files).slice(0, remainingSlots);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    const invalidFiles = filesToAdd.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error('Please upload only JPEG, PNG, or WEBP images');
      return;
    }

    // Validate file sizes (max 5MB each)
    const largeFiles = filesToAdd.filter(file => file.size > 5 * 1024 * 1024);
    if (largeFiles.length > 0) {
      toast.error('Each image must be less than 5MB');
      return;
    }

    // Create preview URLs and simulate upload
    const newImages: UploadedImage[] = filesToAdd.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
      progress: 0,
      uploaded: false,
    }));

    setImages(prev => [...prev, ...newImages]);

    // Simulate upload progress
    newImages.forEach((image, index) => {
      simulateUpload(image.id, index * 200);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateUpload = (imageId: string, delay: number) => {
    setTimeout(() => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, progress }
            : img
        ));

        if (progress >= 100) {
          clearInterval(interval);
          setImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, uploading: false, uploaded: true, progress: 100 }
              : img
          ));
          
          // Notify parent
          const updatedImages = images.map(img => 
            img.id === imageId ? { ...img, uploaded: true } : img
          );
          onImagesChange?.(updatedImages.filter(img => img.uploaded).map(img => img.file));
        }
      }, 100);
    }, delay);
  };

  const handleRemove = (imageId: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      // Clean up preview URL
      const removed = prev.find(img => img.id === imageId);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      
      // Notify parent
      onImagesChange?.(updated.filter(img => img.uploaded).map(img => img.file));
      
      return updated;
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <Card className="p-4 border-dashed border-2 border-gray-300 bg-gray-50/50 hover:bg-gray-50 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          capture="environment"
        />
        
        <button
          onClick={handleUploadClick}
          className="w-full flex flex-col items-center justify-center py-6 cursor-pointer"
          disabled={images.length >= maxImages}
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
            <Upload className="w-5 h-5 text-[#0078FF]" />
          </div>
          <p className="text-sm mb-1">
            {images.length >= maxImages ? 'Maximum images reached' : 'Upload Photos'}
          </p>
          <p className="text-xs text-gray-600">
            {helperText}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {images.length} / {maxImages} uploaded • Max 5MB each
          </p>
        </button>
      </Card>

      {/* Image Grid */}
      <AnimatePresence mode="popLayout">
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            {images.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <Card className="relative overflow-hidden border">
                  {/* Image Preview */}
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={image.preview}
                      alt="Upload preview"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Uploading Overlay */}
                    {image.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-full px-4">
                          <Progress value={image.progress} className="h-1 mb-2" />
                          <p className="text-white text-xs text-center">
                            Uploading {image.progress}%
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Success Badge */}
                    {image.uploaded && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}

                    {/* Error Badge */}
                    {image.error && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1">
                        <AlertCircle className="w-3 h-3" />
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(image.id)}
                      disabled={image.uploading}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-3 h-3 text-gray-700" />
                    </button>
                  </div>

                  {/* File Info */}
                  <div className="p-2 bg-white border-t">
                    <p className="text-xs text-gray-600 truncate">
                      {image.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(image.file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <ImageIcon className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-xs text-gray-600">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
