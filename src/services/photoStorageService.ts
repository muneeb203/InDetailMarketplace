/**
 * Photo Storage Service
 * Handles image upload, compression, and storage
 * This is a mock implementation that simulates cloud storage
 * In production, integrate with Firebase Storage or Supabase Storage
 */

export interface UploadedPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  size: number;
  uploadedAt: Date;
}

/**
 * Compress and resize image to optimize file size
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not compress image'));
            }
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Create a thumbnail version of the image
 */
async function createThumbnail(file: File): Promise<string> {
  const thumbnailBlob = await compressImage(file, 400, 400, 0.8);
  return URL.createObjectURL(thumbnailBlob);
}

/**
 * Validate image file
 */
function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const maxSize = 10 * 1024 * 1024; // 10MB before compression
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG and PNG images are allowed'
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image must be smaller than 10MB'
    };
  }
  
  return { valid: true };
}

/**
 * Upload photo to cloud storage (mocked)
 * In production, this would upload to Firebase Storage or Supabase Storage
 */
export async function uploadPhoto(
  file: File,
  folder: 'portfolio' | 'car-photos'
): Promise<UploadedPhoto> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Compress image
  const compressedBlob = await compressImage(file);
  
  // Create thumbnail
  const thumbnailUrl = await createThumbnail(file);
  
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In production, upload to cloud storage here
  // const uploadPath = `${folder}/${userId}/${Date.now()}_${file.name}`;
  // const url = await cloudStorage.upload(uploadPath, compressedBlob);
  
  // For now, create a local object URL
  const url = URL.createObjectURL(compressedBlob);
  
  return {
    id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    url,
    thumbnailUrl,
    filename: file.name,
    size: compressedBlob.size,
    uploadedAt: new Date()
  };
}

/**
 * Upload multiple photos
 */
export async function uploadPhotos(
  files: File[],
  folder: 'portfolio' | 'car-photos',
  onProgress?: (current: number, total: number) => void
): Promise<UploadedPhoto[]> {
  const uploads: UploadedPhoto[] = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      const upload = await uploadPhoto(files[i], folder);
      uploads.push(upload);
      onProgress?.(i + 1, files.length);
    } catch (error) {
      console.error(`Failed to upload ${files[i].name}:`, error);
      // Continue with other uploads
    }
  }
  
  return uploads;
}

/**
 * Delete photo from storage (mocked)
 */
export async function deletePhoto(photoId: string, photoUrl: string): Promise<void> {
  // In production, delete from cloud storage
  // await cloudStorage.delete(photoUrl);
  
  // Revoke object URL to free memory
  URL.revokeObjectURL(photoUrl);
  
  // Simulate deletion delay
  await new Promise(resolve => setTimeout(resolve, 300));
}
