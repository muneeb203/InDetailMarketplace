import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  fetchConversations,
  getUnreadCount,
  markConversationAsRead,
  subscribeToAllConversations,
  type MessageRow,
} from '../services/chatService';

export function useUnreadMessages(
  userId: string | undefined,
  userRole: 'client' | 'detailer',
  viewingConversationId: string | null
) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refetch = useCallback(async () => {
    if (!userId) return;
    try {
      const count = await getUnreadCount(userId, userRole);
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, [userId, userRole]);

  const markAsRead = useCallback(
    async (conversationId: string) => {
      if (!userId) return;
      try {
        await markConversationAsRead(conversationId, userId, userRole);
        await refetch();
      } catch {
        // ignore
      }
    },
    [userId, userRole, refetch]
  );

  // Initial fetch and subscription
  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    refetch();

    let unsub: (() => void) | null = null;

    fetchConversations(userId, userRole)
      .then((convs) => {
        const ids = convs.map((c) => c.id);
        unsub = subscribeToAllConversations(ids, (msg: MessageRow, convId: string) => {
          // Only count and notify if message is from the other party
          if (msg.sender_id === userId) return;
          // Don't count or toast if user is viewing this conversation
          if (convId === viewingConversationId) return;
          setUnreadCount((prev) => prev + 1);
          const preview = msg.message_text?.slice(0, 50);
          toast.info('New message', {
            description: preview ? `${preview}${msg.message_text!.length > 50 ? '...' : ''}` : 'You have a new message',
          });
        });
      })
      .catch(() => {});

    return () => {
      unsub?.();
    };
  }, [userId, userRole, refetch, viewingConversationId]);

  return { unreadCount, refetch, markAsRead };
}
