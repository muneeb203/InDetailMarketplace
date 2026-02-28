import { supabase } from '../lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ConversationRow {
  id: string;
  client_id: string;
  dealer_id: string;
  created_at: string;
  client_last_read_at?: string | null;
  dealer_last_read_at?: string | null;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
}

/**
 * Client only: find existing conversation or create one.
 * Dealer cannot initiate conversations.
 */
export async function findOrCreateConversation(
  clientId: string,
  dealerId: string
): Promise<ConversationRow> {
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('client_id', clientId)
    .eq('dealer_id', dealerId)
    .maybeSingle();

  if (existing) return existing as ConversationRow;

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({ client_id: clientId, dealer_id: dealerId })
    .select()
    .single();

  if (error) throw error;
  return created as ConversationRow;
}

/**
 * Send a message. Both client and dealer can send once conversation exists.
 * Uses auth.getUser() to ensure sender_id matches auth.uid() for RLS.
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  messageText: string
): Promise<MessageRow> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('You must be signed in to send messages');
  const authUserId = user.id;

  // DEBUG: verify sender_id matches auth user (remove after fix confirmed)
  console.log('Current user (auth):', authUserId);
  console.log('Sending as sender_id:', authUserId);
  if (authUserId !== senderId) {
    console.warn('Mismatch: passed senderId', senderId, 'vs auth', authUserId);
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: authUserId,
      message_text: messageText,
    })
    .select()
    .single();

  if (error) throw error;
  return data as MessageRow;
}

/**
 * Client: fetch conversations where client_id = userId
 * Dealer: fetch conversations where dealer_id = userId
 */
export async function fetchConversations(
  userId: string,
  role: 'client' | 'detailer'
): Promise<ConversationRow[]> {
  const col = role === 'client' ? 'client_id' : 'dealer_id';
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq(col, userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ConversationRow[];
}

export interface ConversationWithDetails extends ConversationRow {
  otherPartyName: string;
  otherPartyAvatar?: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  /** Number of unread messages in this conversation for the current user */
  unreadCount?: number;
}

/**
 * Fetch conversations with other party name/avatar and last message preview.
 */
export async function fetchConversationsWithDetails(
  userId: string,
  role: 'client' | 'detailer'
): Promise<ConversationWithDetails[]> {
  const rows = await fetchConversations(userId, role);
  if (rows.length === 0) return [];

  const otherIds = rows.map((r) => (role === 'client' ? r.dealer_id : r.client_id));
  const lastPreviews = await Promise.all(rows.map((r) => getLastMessagePreview(r.id)));

  let otherPartyMap: Map<string, { name: string; avatar?: string }> = new Map();
  if (role === 'client') {
    const { data: dealers } = await supabase
      .from('dealer_profiles')
      .select('id, business_name, logo_url')
      .in('id', otherIds);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', otherIds);
    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
    (dealers || []).forEach((d) => {
      const p = profileMap.get(d.id);
      otherPartyMap.set(d.id, {
        name: d.business_name || p?.name || 'Detailer',
        avatar: d.logo_url || p?.avatar_url,
      });
    });
  } else {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', otherIds);
    (profiles || []).forEach((p) => {
      otherPartyMap.set(p.id, { name: p.name || 'Client', avatar: p.avatar_url });
    });
  }

  const withUnread = await Promise.all(
    rows.map(async (r, i) => {
      const otherId = role === 'client' ? r.dealer_id : r.client_id;
      const other = otherPartyMap.get(otherId);
      const last = lastPreviews[i];
      const unreadCount = await getUnreadCountForConversation(r.id, userId, role);
      return {
        ...r,
        otherPartyName: other?.name ?? 'Unknown',
        otherPartyAvatar: other?.avatar,
        lastMessagePreview: last?.message_text ?? undefined,
        lastMessageAt: last?.created_at,
        unreadCount,
      };
    })
  );
  return withUnread;
}

/**
 * Fetch messages for a conversation, ordered by created_at ascending.
 */
export async function fetchMessages(conversationId: string): Promise<MessageRow[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as MessageRow[];
}

/**
 * Get dealer display info (name, avatar) by id. Used when opening a new conversation.
 */
export async function getDealerDisplayInfo(
  dealerId: string
): Promise<{ name: string; avatar?: string }> {
  const [dealerRes, profileRes] = await Promise.all([
    supabase.from('dealer_profiles').select('id, business_name, logo_url').eq('id', dealerId).maybeSingle(),
    supabase.from('profiles').select('id, name, avatar_url').eq('id', dealerId).maybeSingle(),
  ]);
  const d = dealerRes.data;
  const p = profileRes.data;
  return {
    name: d?.business_name || p?.name || 'Detailer',
    avatar: d?.logo_url || p?.avatar_url,
  };
}

/**
 * Get last message preview for a conversation.
 */
export async function getLastMessagePreview(
  conversationId: string
): Promise<MessageRow | null> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as MessageRow | null;
}

/**
 * Mark a conversation as read by the current user.
 */
export async function markConversationAsRead(
  conversationId: string,
  userId: string,
  role: 'client' | 'detailer'
): Promise<void> {
  const col = role === 'client' ? 'client_last_read_at' : 'dealer_last_read_at';
  const { error } = await supabase
    .from('conversations')
    .update({ [col]: new Date().toISOString() })
    .eq('id', conversationId)
    .eq(role === 'client' ? 'client_id' : 'dealer_id', userId);

  if (error) throw error;
}

/**
 * Get unread message count for a single conversation.
 */
export async function getUnreadCountForConversation(
  conversationId: string,
  userId: string,
  role: 'client' | 'detailer'
): Promise<number> {
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('client_last_read_at, dealer_last_read_at')
    .eq('id', conversationId)
    .maybeSingle();

  if (convError || !conv) return 0;

  const readCol = role === 'client' ? 'client_last_read_at' : 'dealer_last_read_at';
  const since = conv[readCol] || '1970-01-01T00:00:00Z';

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .gt('created_at', since);

  if (error) return 0;
  return count ?? 0;
}

/**
 * Get total unread message count for the user across all conversations.
 */
export async function getUnreadCount(
  userId: string,
  role: 'client' | 'detailer'
): Promise<number> {
  const { data: convs, error: convError } = await supabase
    .from('conversations')
    .select('id, client_id, dealer_id, client_last_read_at, dealer_last_read_at')
    .eq(role === 'client' ? 'client_id' : 'dealer_id', userId);

  if (convError || !convs?.length) return 0;

  const readCol = role === 'client' ? 'client_last_read_at' : 'dealer_last_read_at';
  let total = 0;

  for (const c of convs) {
    const since = c[readCol] || '1970-01-01T00:00:00Z';
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', c.id)
      .neq('sender_id', userId)
      .gt('created_at', since);
    if (!error && count != null) total += count;
  }

  return total;
}

/**
 * Subscribe to new messages for a conversation.
 * Returns unsubscribe function. Call it on component unmount.
 */
export function subscribeToMessages(
  conversationId: string,
  onInsert: (message: MessageRow) => void
): () => void {
  const channel = supabase
    .channel(`chat-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onInsert(payload.new as MessageRow);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel as RealtimeChannel);
  };
}

/**
 * Subscribe to new messages across all given conversations.
 * Use for global notification when user is not viewing a specific chat.
 * Returns unsubscribe function.
 */
export function subscribeToAllConversations(
  conversationIds: string[],
  onNewMessage: (message: MessageRow, conversationId: string) => void
): () => void {
  if (conversationIds.length === 0) return () => {};

  const channels: RealtimeChannel[] = [];
  for (const convId of conversationIds) {
    const ch = supabase
      .channel(`chat-global-${convId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          onNewMessage(payload.new as MessageRow, convId);
        }
      )
      .subscribe();
    channels.push(ch);
  }

  return () => {
    channels.forEach((ch) => supabase.removeChannel(ch));
  };
}

/**
 * Typing indicator: Broadcast typing status to other user in conversation.
 * Uses Supabase Realtime presence feature.
 */
export interface TypingStatus {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: number;
}

export function broadcastTypingStatus(
  conversationId: string,
  userId: string,
  userName: string,
  isTyping: boolean
): RealtimeChannel {
  const channel = supabase.channel(`typing-${conversationId}`, {
    config: { presence: { key: userId } },
  });

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        userId,
        userName,
        isTyping,
        timestamp: Date.now(),
      });
    }
  });

  return channel;
}

/**
 * Subscribe to typing indicators for a conversation.
 * Returns unsubscribe function.
 */
export function subscribeToTypingStatus(
  conversationId: string,
  currentUserId: string,
  onTypingChange: (typingUsers: TypingStatus[]) => void
): () => void {
  const channel = supabase.channel(`typing-${conversationId}`, {
    config: { presence: { key: currentUserId } },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const typingUsers: TypingStatus[] = [];

      Object.values(state).forEach((presences: any) => {
        presences.forEach((presence: any) => {
          if (presence.userId !== currentUserId && presence.isTyping) {
            typingUsers.push({
              userId: presence.userId,
              userName: presence.userName,
              isTyping: presence.isTyping,
              timestamp: presence.timestamp,
            });
          }
        });
      });

      onTypingChange(typingUsers);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Update message read status by updating conversation's last_read_at timestamp.
 * This automatically marks all messages before that timestamp as read.
 */
export async function updateReadReceipt(
  conversationId: string,
  userId: string,
  role: 'client' | 'detailer'
): Promise<void> {
  await markConversationAsRead(conversationId, userId, role);
}

/**
 * Get read status for messages in a conversation.
 * Returns map of message IDs to read status.
 */
export async function getMessageReadStatus(
  conversationId: string,
  userId: string,
  role: 'client' | 'detailer'
): Promise<Map<string, boolean>> {
  const { data: conv } = await supabase
    .from('conversations')
    .select('client_last_read_at, dealer_last_read_at')
    .eq('id', conversationId)
    .single();

  if (!conv) return new Map();

  const otherReadCol = role === 'client' ? 'dealer_last_read_at' : 'client_last_read_at';
  const otherReadAt = conv[otherReadCol];

  if (!otherReadAt) return new Map();

  const { data: messages } = await supabase
    .from('messages')
    .select('id, created_at, sender_id')
    .eq('conversation_id', conversationId)
    .eq('sender_id', userId);

  const readMap = new Map<string, boolean>();
  messages?.forEach((msg) => {
    const isRead = new Date(msg.created_at) <= new Date(otherReadAt);
    readMap.set(msg.id, isRead);
  });

  return readMap;
}

/**
 * Subscribe to read receipt updates for a conversation.
 * Fires when the other user reads messages.
 */
export function subscribeToReadReceipts(
  conversationId: string,
  role: 'client' | 'detailer',
  onReadUpdate: (lastReadAt: string) => void
): () => void {
  const otherReadCol = role === 'client' ? 'dealer_last_read_at' : 'client_last_read_at';

  const channel = supabase
    .channel(`read-receipts-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `id=eq.${conversationId}`,
      },
      (payload) => {
        const newReadAt = (payload.new as any)[otherReadCol];
        if (newReadAt) {
          onReadUpdate(newReadAt);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
