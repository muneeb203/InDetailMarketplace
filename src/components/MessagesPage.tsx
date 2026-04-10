import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ArrowLeft, Send, Image as ImageIcon, MoreVertical, Phone, Video, User, Circle, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  image?: string;
  delivered?: boolean;
  read?: boolean;
}

interface Conversation {
  id: string;
  detailerId: string;
  detailerName: string;
  detailerAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
  isOnline: boolean;
  lastActive?: string;
  bookingType: string;
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    detailerId: 'mike-123',
    detailerName: 'Mike Johnson',
    detailerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    lastMessage: 'I\'ll be there at 10 AM sharp. Looking forward to it!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 15),
    unread: 2,
    isOnline: true,
    bookingType: 'Premium Detail',
  },
  {
    id: '2',
    detailerId: 'sarah-456',
    detailerName: 'Sarah Martinez',
    detailerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    lastMessage: 'The ceramic coating will take about 6-8 hours.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unread: 0,
    isOnline: false,
    lastActive: '2 hours ago',
    bookingType: 'Ceramic Coating',
  },
  {
    id: '3',
    detailerId: 'david-789',
    detailerName: 'David Chen',
    detailerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    lastMessage: 'Thanks for choosing us! See you next time.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    unread: 0,
    isOnline: false,
    lastActive: '5 days ago',
    bookingType: 'Basic Wash',
  },
];

const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1',
      senderId: 'user',
      text: 'Hi Mike! Looking forward to the detail tomorrow.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      delivered: true,
      read: true,
    },
    {
      id: '2',
      senderId: 'mike-123',
      text: 'Hello! Yes, I have you scheduled for 10 AM. I\'ll bring all the premium products.',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
    },
    {
      id: '3',
      senderId: 'user',
      text: 'Perfect! Do you need access to water and electricity?',
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      delivered: true,
      read: true,
    },
    {
      id: '4',
      senderId: 'mike-123',
      text: 'I\'ll be there at 10 AM sharp. Looking forward to it!',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    },
  ],
  '2': [
    {
      id: '1',
      senderId: 'user',
      text: 'How long will the ceramic coating take?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      delivered: true,
      read: true,
    },
    {
      id: '2',
      senderId: 'sarah-456',
      text: 'The ceramic coating will take about 6-8 hours. We do paint correction first.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  ],
  '3': [
    {
      id: '1',
      senderId: 'user',
      text: 'The car looks amazing! Thank you!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      delivered: true,
      read: true,
    },
    {
      id: '2',
      senderId: 'david-789',
      text: 'Thanks for choosing us! See you next time.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
  ],
};

export function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, messages]);

  // Handle user typing indicator
  const handleTyping = (text: string) => {
    setMessageText(text);
    
    // Broadcast typing status
    if (!isUserTyping && text.length > 0) {
      setIsUserTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      text: messageText,
      timestamp: new Date(),
      delivered: false,
      read: false,
    };

    setMessages({
      ...messages,
      [selectedConversation.id]: [...(messages[selectedConversation.id] || []), newMessage],
    });

    setMessageText('');
    setIsUserTyping(false);

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [selectedConversation.id]: prev[selectedConversation.id].map(msg =>
          msg.id === newMessage.id ? { ...msg, delivered: true } : msg
        ),
      }));
    }, 500);

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: selectedConversation.detailerId,
        text: 'Thanks for your message! I\'ll get back to you shortly.',
        timestamp: new Date(),
      };
      setMessages(prev => ({
        ...prev,
        [selectedConversation.id]: [...(prev[selectedConversation.id] || []), autoReply],
      }));

      // Simulate read receipt after 2 seconds
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [selectedConversation.id]: prev[selectedConversation.id].map(msg =>
            msg.id === newMessage.id ? { ...msg, read: true } : msg
          ),
        }));
      }, 2000);
    }, 2000);
  };

  const formatTime = (date: Date) => {
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

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF5FF] to-white flex">
      {/* Inbox List - Left Panel */}
      <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-96 border-r border-gray-200 bg-white`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl mb-1">Messages</h1>
          <p className="text-sm text-gray-600">{mockConversations.length} conversations</p>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {mockConversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar with online indicator */}
                <div className="relative">
                  <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                    <AvatarImage src={conversation.detailerAvatar} />
                    <AvatarFallback>{conversation.detailerName[0]}</AvatarFallback>
                  </Avatar>
                  {conversation.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm truncate">{conversation.detailerName}</p>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{conversation.bookingType}</p>
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                </div>

                {conversation.unread > 0 && (
                  <Badge className="bg-[#0078FF] text-white h-5 min-w-5 px-1.5 flex items-center justify-center">
                    {conversation.unread}
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Panel - Right Panel */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden -ml-2"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="relative">
                  <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                    <AvatarImage src={selectedConversation.detailerAvatar} />
                    <AvatarFallback>{selectedConversation.detailerName[0]}</AvatarFallback>
                  </Avatar>
                  {selectedConversation.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <p className="text-sm">{selectedConversation.detailerName}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    {selectedConversation.isOnline ? (
                      <>
                        <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                        <span>Online now</span>
                      </>
                    ) : (
                      <span>Active {selectedConversation.lastActive}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Video className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => {/* View profile */}}
                >
                  <User className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {/* Date Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-500">Today</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {messages[selectedConversation.id]?.map((message, index) => {
              const isUser = message.senderId === 'user';
              const showAvatar = !isUser && (
                index === 0 || 
                messages[selectedConversation.id][index - 1]?.senderId !== message.senderId
              );

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 flex-shrink-0">
                      {showAvatar && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={selectedConversation.detailerAvatar} />
                          <AvatarFallback>{selectedConversation.detailerName[0]}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}

                  <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${
                        isUser
                          ? 'bg-[#0078FF] text-white rounded-tr-sm'
                          : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-xs text-gray-500">
                        {formatMessageTime(message.timestamp)}
                      </span>
                      {isUser && (
                        <span className="text-xs">
                          {message.read ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                          ) : message.delivered ? (
                            <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-2"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedConversation.detailerAvatar} />
                    <AvatarFallback>{selectedConversation.detailerName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1 px-4 py-3 bg-gray-100 rounded-2xl rounded-tl-sm">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            {/* Show when user is typing (for demo purposes) */}
            {isUserTyping && (
              <div className="text-xs text-gray-500 mb-2 px-2">
                You are typing...
              </div>
            )}
            <div className="flex items-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 flex-shrink-0"
              >
                <ImageIcon className="w-5 h-5 text-gray-500" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  value={messageText}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="pr-12 h-10 rounded-full bg-gray-100 border-0 focus-visible:ring-2 focus-visible:ring-[#0078FF]"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="h-10 w-10 p-0 rounded-full bg-[#0078FF] hover:bg-[#0056CC] text-white disabled:bg-gray-300 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State - Desktop Only */
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center max-w-sm px-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#0078FF]/10 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-12 h-12 text-[#0078FF]" />
            </div>
            <h3 className="mb-2">Select a conversation</h3>
            <p className="text-gray-600">
              Choose a conversation from the list to view messages and continue chatting with your detailer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}
