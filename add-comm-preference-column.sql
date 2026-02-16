-- Add communication preference column to dealer_profiles
-- This enables the "Request a Call" button for detailers who prefer phone calls

-- Step 1: Add the column
ALTER TABLE dealer_profiles 
ADD COLUMN IF NOT EXISTS comm_preference TEXT 
CHECK (comm_preference IN ('chat', 'voice', 'voice-chat'));

-- Step 2: Add comment
COMMENT ON COLUMN dealer_profiles.comm_preference 
IS 'Communication preference: chat (text only), voice (phone calls), voice-chat (both)';

-- Step 3: Set default for existing detailers (make them all voice-chat so button shows)
UPDATE dealer_profiles
SET comm_preference = 'voice-chat'
WHERE comm_preference IS NULL;

-- Step 4: Verify the update
SELECT 
  dp.id,
  dp.business_name,
  dp.comm_preference,
  p.phone
FROM dealer_profiles dp
LEFT JOIN profiles p ON dp.id = p.id
ORDER BY dp.created_at DESC;

-- Success message
SELECT '✅ Communication preference added! "Request a Call" button will now show for all detailers.' AS status;
