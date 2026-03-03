# Profile Picture Upload Feature

## ✅ Implementation Complete

Profile picture upload has been added to client onboarding (Step 4 of 4).

## What Was Added

### 1. Upload Functions
- `uploadProfilePicture()` - Uploads avatar to Supabase Storage (`user-avatars` bucket)
- `updateUserAvatar()` - Saves avatar URL to database
- File validation (type, size)
- Automatic old avatar replacement

### 2. Onboarding Step 4
- Profile picture upload UI
- Image preview (circular, 128x128px)
- Upload/Change/Remove buttons
- Skip option (optional step)
- Progress indicator
- Error handling

### 3. File Storage
- Stored in **`user-avatars`** bucket (separate from business images)
- Path: `user-id/avatar.jpg`
- Max size: 5MB
- Formats: JPG, PNG, WebP, GIF

## Bucket Organization

**Two separate buckets**:

1. **`user-avatars`** (NEW) - User profile pictures
   - Client avatars
   - Detailer personal avatars
   - Path: `user-id/avatar.ext`

2. **`detailer-images`** (EXISTING) - Business images
   - Detailer logos
   - Portfolio images
   - Path: `dealer-id/logo.ext` or `dealer-id/portfolio-*.ext`

## Setup Required

### Create Supabase Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `user-avatars`
4. Public: ✅ YES
5. Click "Create bucket"

### Add Storage Policies

See `SUPABASE_STORAGE_SETUP.md` for detailed policy setup instructions.

Quick policies needed:
- Allow authenticated uploads (INSERT)
- Allow users to update own files (UPDATE)
- Allow users to delete own files (DELETE)
- Allow public read access (SELECT)

## Testing

1. Create `user-avatars` bucket (see above)
2. Sign up as new client
3. Complete onboarding steps 1-3
4. Step 4: Upload profile picture (or skip)
5. Click "Get Started"
6. Check Supabase Storage → `user-avatars` bucket for uploaded image

## Files Modified

- `src/services/imageUploadService.ts` - Upload functions (uses `user-avatars` bucket)
- `src/components/ClientOnboarding.tsx` - Step 4 UI
- `src/AppRoleAware.tsx` - Pass userId, handle avatarUrl

## Documentation

- `SUPABASE_STORAGE_SETUP.md` - Complete setup guide with policies
