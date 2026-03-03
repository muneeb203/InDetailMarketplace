-- Create function to notify on order status change
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

-- Create function to notify on new message
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

-- Create function to notify on new review
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

-- Create function to notify on booking status change
CREATE OR REPLACE FUNCTION notify_booking_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_name TEXT;
  v_dealer_name TEXT;
BEGIN
  -- Get names
  SELECT name INTO v_client_name FROM profiles WHERE id = NEW.client_id;
  SELECT business_name INTO v_dealer_name FROM dealer_profiles WHERE id = NEW.dealer_id;

  -- If this is a new booking
  IF TG_OP = 'INSERT' THEN
    -- Notify dealer
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      NEW.dealer_id,
      'booking',
      'New Booking Request',
      COALESCE(v_client_name, 'A client') || ' requested a booking',
      '/bookings'
    );

  -- If booking status changed
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Notify client
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      NEW.client_id,
      'booking',
      'Booking Status Updated',
      'Your booking with ' || COALESCE(v_dealer_name, 'the detailer') || ' is now ' || NEW.status,
      '/bookings'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for booking notifications (if bookings table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
    DROP TRIGGER IF EXISTS trigger_booking_notifications ON bookings;
    CREATE TRIGGER trigger_booking_notifications
      AFTER INSERT OR UPDATE ON bookings
      FOR EACH ROW
      EXECUTE FUNCTION notify_booking_status_change();
  END IF;
END $$;
