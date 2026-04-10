import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadButtonProps {
  onUpload: (file: File) => Promise<string>;
  currentImageUrl?: string;
  label?: string;
  variant?: 'logo' | 'portfolio';
  onDelete?: () => Promise<void>;
  className?: string;
}

export function ImageUploadButton({
  onUpload,
  currentImageUrl,
  label = 'Upload Image',
  variant = 'portfolio',
  onDelete,
  className = '',
}: ImageUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a JPEG, PNG, WebP, or GIF image',
      });
      return;
    }

    // Validate file size (5 MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large', {
        description: 'Image must be less than 5 MB',
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const url = await onUpload(file);
      toast.success('Image uploaded successfully!');
      setPreview(url);
    } catch (error: any) {
      toast.error('Upload failed', {
        description: error.message || 'Please try again',
      });
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setDeleting(true);
    try {
      await onDelete();
      setPreview(null);
      toast.success('Image deleted successfully');
    } catch (error: any) {
      toast.error('Delete failed', {
        description: error.message || 'Please try again',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Preview */}
      {preview && (
        <div className="relative group">
          <div
            className={`relative overflow-hidden rounded-lg border-2 border-gray-200 ${
              variant === 'logo' ? 'w-32 h-32' : 'w-full h-48'
            }`}
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleButtonClick}
                disabled={uploading || deleting}
                className="bg-white/90 hover:bg-white"
              >
                <Upload className="w-4 h-4 mr-1" />
                Change
              </Button>
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={uploading || deleting}
                  className="bg-red-500/90 hover:bg-red-600"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Button (shown when no preview) */}
      {!preview && (
        <Button
          onClick={handleButtonClick}
          disabled={uploading}
          variant="outline"
          className="w-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 h-auto py-8"
        >
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="text-sm text-gray-600">Uploading...</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG, WebP, or GIF (max 5 MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </Button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload status */}
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading image...</span>
        </div>
      )}
    </div>
  );
}
