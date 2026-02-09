import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ArrowLeft, Send, Image as ImageIcon, User, Circle, MoreVertical, Activity } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  image?: string;
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
  bookingId?: string;
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
    bookingId: '1',
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
    },
    {
      id: '2',
      senderId: 'david-789',
      text: 'Thanks for choosing us! See you next time.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
  ],
};

export function MessagesPageIntegrated({ 
  onViewStatus 
}: { 
  onViewStatus?: (bookingId: string) => void;
} = {}) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages({
      ...messages,
      [selectedConversation.id]: [...(messages[selectedConversation.id] || []), newMessage],
    });

    setMessageText('');

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
    <div className="h-full flex flex-col bg-white">
      {/* Inbox List */}
      {!selectedConversation ? (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-xl">Messages</h1>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Seamless, real-time communication connecting clients and trusted local detailers.
            </p>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {mockConversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedConversation(conversation)}
                className="p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 active:bg-blue-50"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar with online indicator */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-11 h-11 border border-gray-200">
                      <AvatarImage src={conversation.detailerAvatar} />
                      <AvatarFallback>{conversation.detailerName[0]}</AvatarFallback>
                    </Avatar>
                    {conversation.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm truncate">{conversation.detailerName}</p>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{conversation.bookingType}</p>
                    <p className="text-xs text-gray-600 truncate">{conversation.lastMessage}</p>
                  </div>

                  {conversation.unread > 0 && (
                    <Badge className="bg-[#0078FF] text-white h-5 min-w-5 px-1.5 flex items-center justify-center text-xs flex-shrink-0">
                      {conversation.unread}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Chat Panel */
        <div className="h-full flex flex-col">
          {/* Chat Header */}
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
                <div className="relative">
                  <Avatar className="w-9 h-9 border border-gray-200">
                    <AvatarImage src={selectedConversation.detailerAvatar} />
                    <AvatarFallback>{selectedConversation.detailerName[0]}</AvatarFallback>
                  </Avatar>
                  {selectedConversation.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <p className="text-sm">{selectedConversation.detailerName}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    {selectedConversation.isOnline ? (
                      <>
                        <Circle className="w-1.5 h-1.5 fill-green-500 text-green-500" />
                        <span>Online now</span>
                      </>
                    ) : (
                      <span>Active {selectedConversation.lastActive}</span>
                    )}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => {}}>
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  {selectedConversation.bookingId && onViewStatus && (
                    <DropdownMenuItem onClick={() => onViewStatus(selectedConversation.bookingId!)}>
                      <Activity className="w-4 h-4 mr-2" />
                      View Job Status
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {/* Date Divider */}
            <div className="flex items-center gap-2 my-2">
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
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`flex gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 flex-shrink-0">
                      {showAvatar && (
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={selectedConversation.detailerAvatar} />
                          <AvatarFallback className="text-xs">{selectedConversation.detailerName[0]}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}

                  <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    <div
                      className={`px-3 py-2 rounded-2xl ${
                        isUser
                          ? 'bg-[#0078FF] text-white rounded-tr-sm'
                          : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-0.5 px-1">
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex gap-1.5"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={selectedConversation.detailerAvatar} />
                    <AvatarFallback className="text-xs">{selectedConversation.detailerName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-2xl rounded-tl-sm">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 flex-shrink-0"
              >
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
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
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
