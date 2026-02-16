import { supabase } from '../lib/supabaseClient';

const BUCKET_NAME = 'detailer-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Get the public URL for an image in storage
 */
export function getPublicImageUrl(path: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * Upload a detailer logo image
 * @param detailerId - The detailer's user ID
 * @param file - The image file to upload
 * @returns The public URL of the uploaded image
 */
export async function uploadDetailerLogo(
  detailerId: string,
  file: File
): Promise<string> {
  // Validate file
  validateImageFile(file);

  const fileExt = file.name.split('.').pop();
  const filePath = `${detailerId}/logo.${fileExt}`;

  // Delete existing logo if it exists
  await deleteImage(filePath).catch(() => {
    // Ignore error if file doesn't exist
  });

  // Upload new logo
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading logo:', error);
    throw new Error(`Failed to upload logo: ${error.message}`);
  }

  return getPublicImageUrl(data.path);
}

/**
 * Upload a portfolio image
 * @param detailerId - The detailer's user ID
 * @param file - The image file to upload
 * @returns The public URL of the uploaded image
 */
export async function uploadPortfolioImage(
  detailerId: string,
  file: File
): Promise<string> {
  // Validate file
  validateImageFile(file);

  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const filePath = `${detailerId}/portfolio-${timestamp}.${fileExt}`;

  // Upload image
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading portfolio image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  return getPublicImageUrl(data.path);
}

/**
 * Delete an image from storage
 * @param path - The path to the image (e.g., "user-id/logo.jpg")
 */
export async function deleteImage(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * List all images for a detailer
 * @param detailerId - The detailer's user ID
 * @returns Array of file paths
 */
export async function listDetailerImages(detailerId: string): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(detailerId);

  if (error) {
    console.error('Error listing images:', error);
    throw new Error(`Failed to list images: ${error.message}`);
  }

  return data.map((file) => `${detailerId}/${file.name}`);
}

/**
 * Validate image file before upload
 */
function validateImageFile(file: File): void {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024} MB`);
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File must be an image (JPEG, PNG, WebP, or GIF)');
  }
}

/**
 * Update detailer logo in database
 * @param detailerId - The detailer's user ID
 * @param logoUrl - The public URL of the logo
 */
export async function updateDetailerLogo(
  detailerId: string,
  logoUrl: string
): Promise<void> {
  const { error } = await supabase
    .from('dealer_profiles')
    .update({
      logo_url: logoUrl,
      logo_storage_path: logoUrl.split('/').slice(-2).join('/'), // Extract path from URL
    })
    .eq('id', detailerId);

  if (error) {
    console.error('Error updating logo in database:', error);
    throw new Error(`Failed to update logo: ${error.message}`);
  }
}

/**
 * Add portfolio image to database
 * @param detailerId - The detailer's user ID
 * @param imageUrl - The public URL of the image
 */
export async function addPortfolioImage(
  detailerId: string,
  imageUrl: string
): Promise<void> {
  // Get existing portfolio images
  const { data, error: fetchError } = await supabase
    .from('dealer_profiles')
    .select('portfolio_images')
    .eq('id', detailerId)
    .single();

  if (fetchError) {
    console.error('Error fetching portfolio images:', fetchError);
    throw new Error(`Failed to fetch portfolio images: ${fetchError.message}`);
  }

  const existingImages = data?.portfolio_images || [];

  // Add new image
  const { error: updateError } = await supabase
    .from('dealer_profiles')
    .update({
      portfolio_images: [...existingImages, imageUrl],
    })
    .eq('id', detailerId);

  if (updateError) {
    console.error('Error adding portfolio image:', updateError);
    throw new Error(`Failed to add portfolio image: ${updateError.message}`);
  }
}

/**
 * Remove portfolio image from database
 * @param detailerId - The detailer's user ID
 * @param imageUrl - The public URL of the image to remove
 */
export async function removePortfolioImage(
  detailerId: string,
  imageUrl: string
): Promise<void> {
  // Get existing portfolio images
  const { data, error: fetchError } = await supabase
    .from('dealer_profiles')
    .select('portfolio_images')
    .eq('id', detailerId)
    .single();

  if (fetchError) {
    console.error('Error fetching portfolio images:', fetchError);
    throw new Error(`Failed to fetch portfolio images: ${fetchError.message}`);
  }

  const existingImages = data?.portfolio_images || [];
  const updatedImages = existingImages.filter((url: string) => url !== imageUrl);

  // Update database
  const { error: updateError } = await supabase
    .from('dealer_profiles')
    .update({
      portfolio_images: updatedImages,
    })
    .eq('id', detailerId);

  if (updateError) {
    console.error('Error removing portfolio image:', updateError);
    throw new Error(`Failed to remove portfolio image: ${updateError.message}`);
  }

  // Delete from storage
  const path = imageUrl.split('/').slice(-2).join('/');
  await deleteImage(path);
}
