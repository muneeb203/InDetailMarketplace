import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import {
  uploadLogo,
  uploadPortfolioImage,
  deletePortfolioImage,
  replacePortfolioImage,
  validateFile,
  MAX_PORTFOLIO_IMAGES,
} from '../../services/dealerImageService';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { toast } from 'sonner';

interface DealerImageManagerProps {
  userId: string;
  onLogoChange?: (url: string | null) => void;
  onPortfolioChange?: (urls: string[]) => void;
  /** When false, only show logo section (e.g. for Profile Info). Default: true */
  showPortfolio?: boolean;
}

export function DealerImageManager({
  userId,
  onLogoChange,
  onPortfolioChange,
  showPortfolio = true,
}: DealerImageManagerProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [imageDeleting, setImageDeleting] = useState<string | null>(null);
  const [imageReplacing, setImageReplacing] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [portfolioPreview, setPortfolioPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dealer_profiles')
        .select('logo_url, portfolio_images')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setLogoUrl(data?.logo_url ?? null);
      setPortfolioImages(Array.isArray(data?.portfolio_images) ? data.portfolio_images : []);
    } catch (err: any) {
      console.error('Failed to fetch dealer profile:', err);
      toast.error('Failed to load images', {
        description: err?.message ?? 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Notify parent only when logo changes from user upload (not on initial load)
  useEffect(() => {
    onPortfolioChange?.(portfolioImages);
  }, [portfolioImages, onPortfolioChange]);

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setLogoError(null);
    try {
      validateFile(file);
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
      handleLogoUpload(file);
    } catch (err: any) {
      setLogoError(err.message);
      toast.error(err.message);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      setLogoUploading(true);
      setLogoError(null);
      const url = await uploadLogo(userId, file);
      setLogoUrl(url);
      setLogoPreview(null);
      onLogoChange?.(url);
      toast.success('Logo updated successfully');
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to upload logo';
      setLogoError(msg);
      toast.error(msg);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLogoError('Only image files are allowed');
      return;
    }
    handleLogoFileSelect({ target: { files: [file] } } as any);
  };

  const handleLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePortfolioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setPortfolioError(null);
    try {
      validateFile(file);
      if (portfolioImages.length >= MAX_PORTFOLIO_IMAGES) {
        throw new Error('Maximum 5 portfolio images allowed');
      }
      const reader = new FileReader();
      reader.onload = () => setPortfolioPreview(reader.result as string);
      reader.readAsDataURL(file);
      handlePortfolioUpload(file);
    } catch (err: any) {
      setPortfolioError(err.message);
      toast.error(err.message);
    }
  };

  const handlePortfolioUpload = async (file: File) => {
    try {
      setPortfolioUploading(true);
      setPortfolioError(null);
      const url = await uploadPortfolioImage(userId, file, portfolioImages);
      setPortfolioImages((prev) => [...prev, url]);
      setPortfolioPreview(null);
      toast.success('Image added to portfolio');
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to upload image';
      setPortfolioError(msg);
      toast.error(msg);
    } finally {
      setPortfolioUploading(false);
    }
  };

  const handleDeletePortfolio = async (imageUrl: string) => {
    try {
      setImageDeleting(imageUrl);
      const updated = await deletePortfolioImage(userId, imageUrl, portfolioImages);
      setPortfolioImages(updated);
      toast.success('Image removed');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete image');
    } finally {
      setImageDeleting(null);
    }
  };

  const handleReplacePortfolio = async (oldUrl: string, file: File) => {
    try {
      setImageReplacing(oldUrl);
      setPortfolioError(null);
      const newUrl = await replacePortfolioImage(userId, oldUrl, file, portfolioImages);
      setPortfolioImages((prev) =>
        prev.map((url) => (url === oldUrl ? newUrl : url))
      );
      toast.success('Image replaced');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to replace image');
    } finally {
      setImageReplacing(null);
    }
  };

  const handleReplacePortfolioFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    oldUrl: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      validateFile(file);
      handleReplacePortfolio(oldUrl, file);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-xl bg-gray-200" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", !showPortfolio && "space-y-0")}>
      {/* Logo Section */}
      <div>
        <h3 className="font-semibold text-base text-gray-900 mb-3">Logo</h3>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div
            className={cn(
              "w-24 h-24 rounded-xl border-2 flex-shrink-0 overflow-hidden flex items-center justify-center",
              "border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer",
              logoUploading && "opacity-60 pointer-events-none"
            )}
            onClick={() => !logoUploading && logoInputRef.current?.click()}
            onDrop={handleLogoDrop}
            onDragOver={handleLogoDragOver}
          >
            {logoUploading ? (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            ) : logoPreview ? (
              <img
                src={logoPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : logoUrl ? (
              <ImageWithFallback
                src={logoUrl}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2">
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                <span className="text-xs text-gray-500">No logo</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleLogoFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoInputRef.current?.click()}
              disabled={logoUploading}
              className="gap-2"
            >
              {logoUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Upload New Logo
            </Button>
            <p className="text-xs text-gray-500">
              PNG or JPG, max 5MB. Drag & drop supported.
            </p>
            {logoError && (
              <p className="text-sm text-red-600">{logoError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      {showPortfolio && (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-base text-gray-900">
            Portfolio Images
          </h3>
          <span className="text-sm text-gray-500">
            {portfolioImages.length}/{MAX_PORTFOLIO_IMAGES}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {portfolioImages.map((url, index) => {
            const replaceInputId = `replace-portfolio-${index}`;
            return (
            <div
              key={url}
              className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100"
            >
              {imageDeleting === url || imageReplacing === url ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              ) : null}
              <ImageWithFallback
                src={url}
                alt="Portfolio"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => handleReplacePortfolioFileSelect(e, url)}
                  className="hidden"
                  id={replaceInputId}
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={() =>
                    document.getElementById(replaceInputId)?.click()
                  }
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => handleDeletePortfolio(url)}
                  disabled={!!imageDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
          })}
          {portfolioImages.length < MAX_PORTFOLIO_IMAGES && (
            <div
              onClick={() =>
                !portfolioUploading && portfolioInputRef.current?.click()
              }
              className={cn(
                "aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors",
                portfolioUploading && "opacity-60 pointer-events-none"
              )}
            >
              <input
                ref={portfolioInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handlePortfolioFileSelect}
                className="hidden"
              />
              {portfolioUploading ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
              ) : (
                <Plus className="w-8 h-8 text-gray-400 mb-2" />
              )}
              <span className="text-sm text-gray-600">Add Image</span>
            </div>
          )}
        </div>
        {portfolioError && (
          <p className="text-sm text-red-600 mt-2">{portfolioError}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          PNG or JPG, max 5MB each. Maximum 5 images.
        </p>
      </div>
      )}
    </div>
  );
}
