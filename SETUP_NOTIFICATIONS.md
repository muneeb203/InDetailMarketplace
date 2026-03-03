# Notification System Setup Guide

## Step 1: Create Notifications Table

Go to **Supabase Dashboard → SQL Editor → New Query** and run:

```sql
-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: System can insert notifications for any user
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

Click **Run** and wait for "Success. No rows returned"

---

## Step 2: Create Notification Triggers

Run this SQL to automatically create notifications:

```sql
-- Function to notify on order status change
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_name TEXT;
  v_dealer_name TEXT;
  v_status_text TEXT;
BEGIN
  -- Get client name
  SELECT name INTO v_client_name
  FROM profiles
  WHERE id = NEW.client_id;

  -- Get dealer business name
  SELECT business_name INTO v_dealer_name
  FROM dealer_profiles
  WHERE id = NEW.dealer_id;

  -- Determine status text
  CASE NEW.status
    WHEN 'pending' THEN v_status_text := 'pending review';
    WHEN 'accepted' THEN v_status_text := 'accepted';
    WHEN 'in_progress' THEN v_status_text := 'in progress';
    WHEN 'completed' THEN v_status_text := 'completed';
    WHEN 'cancelled' THEN v_status_text := 'cancelled';
    ELSE v_status_text := NEW.status;
  END CASE;

  -- If this is a new order (INSERT)
  IF TG_OP = 'INSERT' THEN
    -- Notify dealer about new order
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      NEW.dealer_id,
      'order',
      'New Order Received',
      'You have a new order from ' || COALESCE(v_client_name, 'a client'),
      '/orders-queue'
    );

    -- Notify client that order was created
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      NEW.client_id,
      'order',
      'Order Placed Successfully',
      'Your order has been sent to ' || COALESCE(v_dealer_name, 'the detailer'),
      '/my-orders'
    );

  -- If this is an order update (UPDATE)
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Notify client about status change
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      NEW.client_id,
      'status_update',
      'Order Status Updated',
      'Your order is now ' || v_status_text || ' by ' || COALESCE(v_dealer_name, 'the detailer'),
      '/my-orders'
    );

    -- Notify dealer about status change (if client changed it)
    IF NEW.status IN ('cancelled') THEN
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (
        NEW.dealer_id,
        'status_update',
        'Order Status Updated',
        'Order from ' || COALESCE(v_client_name, 'client') || ' is now ' || v_status_text,
        '/orders-queue'
      );
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for order notifications
DROP TRIGGER IF EXISTS trigger_order_notifications ON orders;
CREATE TRIGGER trigger_order_notifications
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_status_change();

-- Function to notify on new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sender_name TEXT;
  v_recipient_id UUID;
  v_conversation RECORD;
BEGIN
  -- Get conversation details
  SELECT client_id, dealer_id INTO v_conversation
  FROM conversations
  WHERE id = NEW.conversation_id;

  -- Determine recipient (opposite of sender)
  IF NEW.sender_id = v_conversation.client_id THEN
    v_recipient_id := v_conversation.dealer_id;
  ELSE
    v_recipient_id := v_conversation.client_id;
  END IF;

  -- Get sender name
  SELECT name INTO v_sender_name
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Create notification for recipient
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (
    v_recipient_id,
    'message',
    'New Message',
    COALESCE(v_sender_name, 'Someone') || ' sent you a message',
    '/messages'
  );

  RETURN NEW;
END;
$$;

-- Create trigger for message notifications
DROP TRIGGER IF EXISTS trigger_message_notifications ON messages;
CREATE TRIGGER trigger_message_notifications
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Function to notify on new review
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_name TEXT;
BEGIN
  -- Get client name
  SELECT name INTO v_client_name
  FROM profiles
  WHERE id = NEW.client_id;

  -- Notify dealer about new review
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (
    NEW.dealer_id,
    'review',
    'New Review Received',
    COALESCE(v_client_name, 'A client') || ' left you a ' || NEW.rating || '-star review',
    '/pro-public-profile'
  );

  RETURN NEW;
END;
$$;

-- Create trigger for review notifications
DROP TRIGGER IF EXISTS trigger_review_notifications ON dealer_reviews;
CREATE TRIGGER trigger_review_notifications
  AFTER INSERT ON dealer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_review();
```

Click **Run** and wait for success.

---

## Step 3: Enable Realtime for Notifications

1. Go to **Database → Replication** in Supabase Dashboard
2. Find the `notifications` table
3. Toggle it **ON** to enable realtime updates

---

## Step 4: Test the System

### Test Order Notifications:
1. As a client, create a new order
2. Both client and detailer should get notifications
3. As detailer, mark order "In Progress"
4. Client should get a notification
5. Check the bell icon - should show red dot with count

### Test Message Notifications:
1. Send a message from client to detailer
2. Detailer should get notification
3. Send reply from detailer
4. Client should get notification

### Test Review Notifications:
1. As client, leave a review for detailer
2. Detailer should get notification

---

## Troubleshooting

### Red dot not showing?
- Make sure you ran Step 1 and Step 2 SQL
- Check browser console for errors
- Refresh the page

### Notifications not appearing?
- Verify triggers were created: Run `SELECT * FROM pg_trigger WHERE tgname LIKE '%notification%';`
- Check if notifications table has data: `SELECT * FROM notifications;`
- Enable Realtime in Step 3

### "Permission denied" errors?
- Make sure RLS policies were created in Step 1
- Check you're signed in as the correct user

---

## What Gets Notified

✅ **Orders**: New order, status changes (accepted, in progress, completed, cancelled)
✅ **Messages**: New messages from other party
✅ **Reviews**: New reviews left by clients
✅ **Bookings**: New booking requests, status changes

All notifications show:
- Red dot on bell icon when unread
- Count of unread notifications
- Real-time updates (no page refresh needed)
- Click notification to navigate to relevant page
