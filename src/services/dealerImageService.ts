/**
 * Dealer Image Management Service
 * Handles logo and portfolio image uploads to Supabase Storage (dealer-assets bucket)
 * Structure: logos/{dealer_id}.{ext} | portfolio/{dealer_id}/{image_id}.{ext}
 */

import { supabase } from '../lib/supabaseClient';

const BUCKET = 'dealer-assets';
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const MAX_PORTFOLIO_IMAGES = 5;

export function validateFile(file: File): void {
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('File must be under 5MB');
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only PNG and JPG files are allowed');
  }
}

/**
 * Upload or replace dealer logo. Always overwrites existing.
 * MUST go to dealer-assets/logos/ (not portfolio) - this is the gig profile picture.
 */
export async function uploadLogo(userId: string, file: File): Promise<string> {
  validateFile(file);
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `logos/${userId}.${fileExt}`; // dealer-assets/logos/{userId}.{ext}

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Failed to upload logo');
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  const { error: dbError } = await supabase
    .from('dealer_profiles')
    .update({ logo_url: data.publicUrl })
    .eq('id', userId);

  if (dbError) {
    await supabase.storage.from(BUCKET).remove([filePath]);
    throw new Error(dbError.message || 'Failed to update profile');
  }

  return data.publicUrl;
}

/**
 * Upload logo to storage only (no DB update).
 * Use during onboarding before dealer_profiles row exists.
 * MUST go to dealer-assets/logos/ - this is the gig profile picture.
 */
export async function uploadLogoToStorage(userId: string, file: File): Promise<string> {
  validateFile(file);
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `logos/${userId}.${fileExt}`; // dealer-assets/logos/

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Failed to upload logo');
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Upload portfolio image to storage only (no DB update).
 * Use during onboarding before dealer_profiles row exists.
 * Goes to dealer-assets/portfolio/ (work samples, NOT the gig logo).
 */
export async function uploadPortfolioImageToStorage(
  userId: string,
  file: File
): Promise<string> {
  validateFile(file);
  const imageId = crypto.randomUUID();
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `portfolio/${userId}/${imageId}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Failed to upload image');
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Upload portfolio image. Max 5 allowed.
 */
export async function uploadPortfolioImage(
  userId: string,
  file: File,
  portfolioImages: string[]
): Promise<string> {
  validateFile(file);
  if (portfolioImages.length >= MAX_PORTFOLIO_IMAGES) {
    throw new Error('Maximum 5 portfolio images allowed');
  }

  const imageId = crypto.randomUUID();
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `portfolio/${userId}/${imageId}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Failed to upload image');
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  const updatedImages = [...portfolioImages, data.publicUrl];

  const { error: dbError } = await supabase
    .from('dealer_profiles')
    .update({ portfolio_images: updatedImages })
    .eq('id', userId);

  if (dbError) {
    await supabase.storage.from(BUCKET).remove([filePath]);
    throw new Error(dbError.message || 'Failed to update profile');
  }

  return data.publicUrl;
}

/**
 * Extract storage path from public URL
 */
function getStoragePathFromUrl(url: string): string | null {
  const match = url.split('/dealer-assets/')[1];
  return match || null;
}

/**
 * Delete portfolio image from storage and DB
 */
export async function deletePortfolioImage(
  userId: string,
  imageUrl: string,
  portfolioImages: string[]
): Promise<string[]> {
  const filePath = getStoragePathFromUrl(imageUrl);
  if (filePath) {
    await supabase.storage.from(BUCKET).remove([filePath]);
  }

  const updatedImages = portfolioImages.filter((img) => img !== imageUrl);

  const { error: dbError } = await supabase
    .from('dealer_profiles')
    .update({ portfolio_images: updatedImages })
    .eq('id', userId);

  if (dbError) {
    throw new Error(dbError.message || 'Failed to update profile');
  }

  return updatedImages;
}

/**
 * Replace portfolio image: delete old, upload new, keep same position
 */
export async function replacePortfolioImage(
  userId: string,
  oldImageUrl: string,
  file: File,
  portfolioImages: string[]
): Promise<string> {
  validateFile(file);
  const index = portfolioImages.indexOf(oldImageUrl);
  if (index === -1) {
    throw new Error('Image not found in portfolio');
  }

  // 1. Delete old from storage
  const oldPath = getStoragePathFromUrl(oldImageUrl);
  if (oldPath) {
    await supabase.storage.from(BUCKET).remove([oldPath]);
  }

  // 2. Upload new
  const imageId = crypto.randomUUID();
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `portfolio/${userId}/${imageId}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Failed to upload image');
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  const updatedImages = [...portfolioImages];
  updatedImages[index] = data.publicUrl;

  const { error: dbError } = await supabase
    .from('dealer_profiles')
    .update({ portfolio_images: updatedImages })
    .eq('id', userId);

  if (dbError) {
    await supabase.storage.from(BUCKET).remove([filePath]);
    throw new Error(dbError.message || 'Failed to update profile');
  }

  return data.publicUrl;
}

export { MAX_PORTFOLIO_IMAGES };
