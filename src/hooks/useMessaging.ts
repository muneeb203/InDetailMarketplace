import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchMessages,
  sendMessage,
  subscribeToMessages,
  subscribeToTypingStatus,
  subscribeToReadReceipts,
  broadcastTypingStatus,
  updateReadReceipt,
  getMessageReadStatus,
  type MessageRow,
  type TypingStatus,
} from '../services/chatService';

export interface MessageWithStatus extends MessageRow {
  delivered: boolean;
  read: boolean;
}

export function useMessaging(
  conversationId: string | null,
  currentUserId: string,
  currentUserName: string,
  role: 'client' | 'detailer'
) {
  const [messages, setMessages] = useState<MessageWithStatus[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const typingChannelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const msgs = await fetchMessages(conversationId);
        const readStatus = await getMessageReadStatus(conversationId, currentUserId, role);
        
        const msgsWithStatus: MessageWithStatus[] = msgs.map(msg => ({
          ...msg,
          delivered: true, // All fetched messages are delivered
          read: msg.sender_id === currentUserId ? (readStatus.get(msg.id) ?? false) : false,
        }));
        
        setMessages(msgsWithStatus);
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [conversationId, currentUserId, role]);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = subscribeToMessages(conversationId, (newMsg) => {
      const msgWithStatus: MessageWithStatus = {
        ...newMsg,
        delivered: true,
        read: false,
      };
      setMessages(prev => [...prev, msgWithStatus]);

      // Auto-mark as read if it's from the other user
      if (newMsg.sender_id !== currentUserId) {
        updateReadReceipt(conversationId, currentUserId, role).catch(console.error);
      }
    });

    return unsubscribe;
  }, [conversationId, currentUserId, role]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = subscribeToTypingStatus(
      conversationId,
      currentUserId,
      setTypingUsers
    );

    return unsubscribe;
  }, [conversationId, currentUserId]);

  // Subscribe to read receipts
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = subscribeToReadReceipts(
      conversationId,
      role,
      (lastReadAt) => {
        setMessages(prev =>
          prev.map(msg => {
            if (msg.sender_id === currentUserId) {
              const isRead = new Date(msg.created_at) <= new Date(lastReadAt);
              return { ...msg, read: isRead };
            }
            return msg;
          })
        );
      }
    );

    return unsubscribe;
  }, [conversationId, currentUserId, role]);

  // Broadcast typing status
  const handleTyping = useCallback((isTyping: boolean) => {
    if (!conversationId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Cleanup old channel if exists
    if (typingChannelRef.current) {
      typingChannelRef.current.unsubscribe();
    }

    // Broadcast typing status
    typingChannelRef.current = broadcastTypingStatus(
      conversationId,
      currentUserId,
      currentUserName,
      isTyping
    );

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        if (typingChannelRef.current) {
          typingChannelRef.current.unsubscribe();
        }
        typingChannelRef.current = broadcastTypingStatus(
          conversationId,
          currentUserId,
          currentUserName,
          false
        );
      }, 3000);
    }
  }, [conversationId, currentUserId, currentUserName]);

  // Send message
  const handleSendMessage = useCallback(async (text: string) => {
    if (!conversationId || !text.trim()) return;

    try {
      // Stop typing indicator
      handleTyping(false);

      // Optimistically add message
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: MessageWithStatus = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: currentUserId,
        message_text: text,
        created_at: new Date().toISOString(),
        delivered: false,
        read: false,
      };
      setMessages(prev => [...prev, optimisticMsg]);

      // Send to server
      const sentMsg = await sendMessage(conversationId, currentUserId, text);
      
      // Update with real message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempId
            ? { ...sentMsg, delivered: true, read: false }
            : msg
        )
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    }
  }, [conversationId, currentUserId, handleTyping]);

  // Mark conversation as read
  const markAsRead = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      await updateReadReceipt(conversationId, currentUserId, role);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [conversationId, currentUserId, role]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingChannelRef.current) {
        typingChannelRef.current.unsubscribe();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    typingUsers,
    isLoading,
    error,
    handleSendMessage,
    handleTyping,
    markAsRead,
  };
}
