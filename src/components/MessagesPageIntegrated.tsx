import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ArrowLeft, Send, Image as ImageIcon, User, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient';
import {
  findOrCreateConversation,
  sendMessage,
  fetchConversationsWithDetails,
  fetchMessages,
  subscribeToMessages,
  getDealerDisplayInfo,
  type ConversationWithDetails,
  type MessageRow,
} from '../services/chatService';

export function MessagesPageIntegrated({
  userId,
  userRole,
  dealerIdToOpen,
  onViewingConversation,
  onMarkAsRead,
}: {
  userId: string;
  userRole: 'client' | 'detailer';
  dealerIdToOpen?: string | null;
  onViewingConversation?: (conversationId: string | null) => void;
  onMarkAsRead?: (conversationId: string) => void;
}) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Use auth user id for message ownership (message.sender_id === auth.user().id)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthUserId(user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setAuthUserId(user?.id ?? null);
      });
    });
    return () => subscription.unsubscribe();
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadConversations = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    fetchConversationsWithDetails(userId, userRole)
      .then(setConversations)
      .catch((e) => {
        setError(e?.message ?? 'Failed to load conversations');
        setConversations([]);
      })
      .finally(() => setLoading(false));
  }, [userId, userRole]);

  // Load conversations on mount and when returning to list (so unread counts are fresh)
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // When returning to list from a conversation, refetch so unread counts are up to date
  const prevSelectedRef = useRef<typeof selectedConversation>(null);
  useEffect(() => {
    if (prevSelectedRef.current !== null && selectedConversation === null) {
      loadConversations();
    }
    prevSelectedRef.current = selectedConversation;
  }, [selectedConversation, loadConversations]);

  // When dealerIdToOpen is set (client clicked "Message Dealer"), find or create conversation and open it.
  // Note: parent should clear dealerIdToOpen after we've processed it to avoid re-running on remount.
  useEffect(() => {
    if (!dealerIdToOpen || userRole !== 'client' || !userId) return;
    setLoading(true);
    Promise.all([
      findOrCreateConversation(userId, dealerIdToOpen),
      getDealerDisplayInfo(dealerIdToOpen),
    ])
      .then(([conv, dealerInfo]) => {
        const enriched: ConversationWithDetails = {
          ...conv,
          otherPartyName: dealerInfo.name,
          otherPartyAvatar: dealerInfo.avatar,
        };
        setConversations((prev) => {
          const exists = prev.some((c) => c.id === conv.id);
          if (exists) return prev.map((c) => (c.id === conv.id ? enriched : c));
          return [enriched, ...prev];
        });
        setSelectedConversation(enriched);
      })
      .catch((e) => {
        setError(e?.message ?? 'Failed to start conversation');
      })
      .finally(() => setLoading(false));
  }, [dealerIdToOpen, userRole, userId]);

  // When conversation is selected: fetch messages, subscribe, mark as read, notify parent
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      onViewingConversation?.(null);
      return;
    }

    const convId = selectedConversation.id;
    onViewingConversation?.(convId);
    onMarkAsRead?.(convId);

    // Optimistically clear unread in list so row is no longer bold
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );

    fetchMessages(convId)
      .then(setMessages)
      .catch((e) => setError(e?.message ?? 'Failed to load messages'));

    const unsub = subscribeToMessages(convId, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });
    unsubscribeRef.current = unsub;

    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [selectedConversation?.id]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;
    setSending(true);
    setError(null);
    try {
      const newMsg = await sendMessage(selectedConversation.id, userId, messageText.trim());
      setMessageText('');
      // Add optimistically - Realtime often doesn't fire for same connection that inserted
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send message';
      setError(msg);
      toast.error('Could not send message', { description: msg });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const lastMessageTime = selectedConversation?.lastMessageAt
    ? formatTime(selectedConversation.lastMessageAt)
    : null;

  return (
    <div className="h-full flex flex-col bg-white">
      {!selectedConversation ? (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-xl">Messages</h1>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Seamless, real-time communication connecting clients and trusted local detailers.
            </p>
          </div>

          {error && (
            <div className="mx-4 mt-2 p-2 text-sm text-red-600 bg-red-50 rounded">
              {error}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {userRole === 'client'
                  ? 'No conversations yet. Message a detailer from the marketplace to start.'
                  : 'No conversations yet. Clients will appear here when they message you.'}
              </div>
            ) : (
              conversations.map((conv, index) => {
                const unread = conv.unreadCount ?? 0;
                const hasUnread = unread > 0;
                return (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedConversation(conv)}
                    className="p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 active:bg-blue-50"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-11 h-11 border border-gray-200 flex-shrink-0">
                        <AvatarImage src={conv.otherPartyAvatar} />
                        <AvatarFallback>{conv.otherPartyName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5 gap-2">
                          <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900' : ''}`}>
                            {conv.otherPartyName}
                          </p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {hasUnread && (
                              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-[#0078FF] text-white text-xs font-medium">
                                {unread > 99 ? '99+' : unread}
                              </span>
                            )}
                            {conv.lastMessageAt && (
                              <span className={`text-xs flex-shrink-0 ${hasUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                                {formatTime(conv.lastMessageAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className={`text-xs truncate ${hasUnread ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                          {conv.lastMessagePreview || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="p-3 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 -ml-1"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-9 h-9 border border-gray-200">
                  <AvatarImage src={selectedConversation.otherPartyAvatar} />
                  <AvatarFallback>{selectedConversation.otherPartyName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">{selectedConversation.otherPartyName}</p>
                  {lastMessageTime && (
                    <span className="text-xs text-gray-600">Active {lastMessageTime}</span>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {error && (
              <div className="p-2 text-sm text-red-600 bg-red-50 rounded">
                {error}
              </div>
            )}
            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-500">Messages</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {messages.map((message, index) => {
              // Use auth.user().id for ownership: if sender_id === current auth user → align right (own message)
              const isOwnMessage = authUserId != null && message.sender_id === authUserId;
              const showAvatar = !isOwnMessage && (
                index === 0 || messages[index - 1]?.sender_id !== message.sender_id
              );

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                  className={`flex gap-1.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwnMessage && (
                    <div className="w-6 flex-shrink-0">
                      {showAvatar && (
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={selectedConversation.otherPartyAvatar} />
                          <AvatarFallback className="text-xs">
                            {selectedConversation.otherPartyName[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    <div
                      className={`px-3 py-2 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-[#0078FF] text-white rounded-tr-sm'
                          : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.message_text}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-0.5 px-1">
                      {formatMessageTime(message.created_at)}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 flex-shrink-0">
                <ImageIcon className="w-4 h-4 text-gray-500" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="pr-10 h-9 text-sm rounded-full bg-gray-100 border-0 focus-visible:ring-2 focus-visible:ring-[#0078FF]"
                  disabled={sending}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sending}
                className="h-9 w-9 p-0 rounded-full bg-[#0078FF] hover:bg-[#0056CC] text-white disabled:bg-gray-300 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
