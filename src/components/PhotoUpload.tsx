import { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Upload, X, Camera, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadPhoto, deletePhoto, UploadedPhoto } from '../services/photoStorageService';
import { motion, AnimatePresence } from 'motion/react';

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  folder: 'portfolio' | 'car-photos';
  title?: string;
  description?: string;
  showCamera?: boolean;
}

export function PhotoUpload({
  photos,
  onChange,
  maxPhotos = 10,
  folder,
  title = 'Upload Photos',
  description,
  showCamera = true
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = maxPhotos - photos.length;

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    
    // Check if adding these files would exceed the limit
    if (photos.length + files.length > maxPhotos) {
      setError(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    try {
      const fileArray = Array.from(files);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        const uploaded = await uploadPhoto(fileArray[i], folder);
        uploadedUrls.push(uploaded.url);
        setUploadProgress({ current: i + 1, total: files.length });
      }

      onChange([...photos, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photos');
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  }, [photos, maxPhotos, folder, onChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDelete = async (index: number) => {
    const photoUrl = photos[index];
    
    try {
      // Delete from storage (in production, this would delete from cloud)
      await deletePhoto(`photo_${index}`, photoUrl);
      
      // Remove from local state
      const newPhotos = photos.filter((_, i) => i !== index);
      onChange(newPhotos);
    } catch (err) {
      console.error('Failed to delete photo:', err);
    }
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos];
    const [movedPhoto] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, movedPhoto);
    onChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      {title && (
        <div>
          <h3 className="mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <AnimatePresence>
            {photos.map((photo, index) => (
              <motion.div
                key={photo}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group"
              >
                <img
                  src={photo}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Photo Number Badge */}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  #{index + 1}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Area */}
      {photos.length < maxPhotos && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center transition-all
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
            ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50/50'}
          `}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
            capture={showCamera ? 'environment' : undefined}
          />

          {uploading ? (
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
              <div>
                <p className="text-sm">
                  Uploading {uploadProgress.current} of {uploadProgress.total}...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2 max-w-xs mx-auto">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
              
              <h4 className="mb-1">
                {dragActive ? 'Drop photos here' : 'Upload Photos'}
              </h4>
              
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop or click to browse
              </p>

              <div className="flex gap-2 justify-center flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>

                {showCamera && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      const input = fileInputRef.current;
                      if (input) {
                        input.setAttribute('capture', 'environment');
                        input.click();
                      }
                    }}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-3">
                JPEG or PNG • Max {maxPhotos} photos • {remainingSlots} remaining
              </p>
            </>
          )}
        </div>
      )}

      {/* Success/Error Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {photos.length === maxPhotos && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"
        >
          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Maximum number of photos uploaded</span>
        </motion.div>
      )}
    </div>
  );
}
