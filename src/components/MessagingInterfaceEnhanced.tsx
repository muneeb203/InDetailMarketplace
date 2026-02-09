import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Message, User } from '../types';
import { ArrowLeft, Send, Check, CheckCheck, Phone, Video, Mic, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { TypingIndicator } from './TypingIndicator';
import { VoiceNoteRecorder } from './VoiceNoteRecorder';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface MessagingInterfaceEnhancedProps {
  currentUserId: string;
  otherUser: User;
  messages: Message[];
  onBack: () => void;
  onSendMessage: (text: string) => void;
}

export function MessagingInterfaceEnhanced({
  currentUserId,
  otherUser,
  messages,
  onBack,
  onSendMessage,
}: MessagingInterfaceEnhancedProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showTyping]);

  // Simulate other user typing when they're about to send a message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.senderId !== currentUserId) {
        setShowTyping(true);
        const timer = setTimeout(() => setShowTyping(false), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, currentUserId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Simulate typing indicator
    if (e.target.value && !isTyping) {
      setIsTyping(true);
    } else if (!e.target.value && isTyping) {
      setIsTyping(false);
    }
  };

  const handleVoiceNoteSend = (audioBlob: Blob, duration: number, transcript?: string) => {
    // In production, this would upload the audio and send it as a message
    toast.success('Voice note sent!');
    setIsRecordingVoice(false);
    
    // Simulate adding voice note to messages
    const voiceMessage = `[Voice Note: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}] ${transcript || ''}`;
    onSendMessage(voiceMessage);
  };

  const handleCall = () => {
    setIsCalling(true);
    setCallDuration(0);
    
    // Simulate call duration
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // End call after random duration (for demo)
    setTimeout(() => {
      handleEndCall();
    }, 8000 + Math.random() * 7000);
  };

  const handleEndCall = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    const mins = Math.floor(callDuration / 60);
    const secs = callDuration % 60;
    const durationStr = `${mins}m ${secs}s`;

    setIsCalling(false);
    toast.success(`Call ended (${durationStr})`);
    
    // Add call log to messages
    onSendMessage(`[Call ended: ${durationStr}]`);
  };

  const handleVideoConsult = () => {
    toast.info('Video consult would start here');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="p-4">
          <Button variant="ghost" onClick={onBack} className="mb-3 -ml-2">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  {getInitials(otherUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="truncate">{otherUser.name}</h3>
                {otherUser.role === 'detailer' && (otherUser as any).businessName && (
                  <p className="text-sm text-gray-600 truncate">{(otherUser as any).businessName}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={handleCall}
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0 rounded-full border-[#0078FF] text-[#0078FF] hover:bg-[#0078FF] hover:text-white"
                aria-label="Start phone call"
              >
                <Phone className="w-4 h-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 w-9 p-0 rounded-full"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleVideoConsult}>
                    <Video className="w-4 h-4 mr-2" />
                    Video Consult
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-3 pb-24">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Start the conversation!</p>
            </motion.div>
          ) : (
            messages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 ${
                        isOwn
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-sm shadow-sm'
                          : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200 shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                    <div
                      className={`flex items-center gap-1 mt-1 px-1 ${
                        isOwn ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <p
                        className={`text-xs ${isOwn ? 'text-gray-500' : 'text-gray-500'}`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {isOwn && (
                        <span className="text-blue-600">
                          {message.read ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {showTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-start"
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <form onSubmit={handleSend} className="max-w-md mx-auto flex gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setIsRecordingVoice(true)}
            className="rounded-full w-12 h-12 border-[#0078FF] text-[#0078FF] hover:bg-[#0078FF] hover:text-white flex-shrink-0"
            aria-label="Record voice note"
          >
            <Mic className="w-5 h-5" />
          </Button>
          
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-full px-4"
            aria-label="Message input"
          />
          
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full w-12 h-12 shadow-md disabled:opacity-50 flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>

      {/* Voice Note Recorder */}
      <AnimatePresence>
        {isRecordingVoice && (
          <VoiceNoteRecorder
            onSend={handleVoiceNoteSend}
            onCancel={() => setIsRecordingVoice(false)}
          />
        )}
      </AnimatePresence>

      {/* Calling Overlay */}
      <AnimatePresence>
        {isCalling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="text-center text-white space-y-6">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto"
              >
                <Phone className="w-12 h-12" />
              </motion.div>

              <div>
                <h3 className="text-xl mb-2">Calling {otherUser.name}...</h3>
                <p className="text-lg tabular-nums">
                  {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
                </p>
              </div>

              <Button
                onClick={handleEndCall}
                size="lg"
                className="bg-red-600 hover:bg-red-700 rounded-full px-8"
              >
                End Call
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
