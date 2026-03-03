-- Test if current user can fetch their notifications
-- Run this while logged in to your app

-- First, check who you are
SELECT auth.uid() as current_user_id;

-- Then try to fetch notifications for current user
SELECT 
  id,
  type,
  title,
  message,
  is_read,
  created_at
FROM notifications
WHERE user_id = auth.uid()
ORDER BY created_at DESC;


-- Count unread notifications
SELECT COUNT(*) as unread_count
FROM notifications
WHERE user_id = auth.uid()
AND is_read = false;
