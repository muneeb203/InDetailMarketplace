// Simulated real-time messaging service
// In production, this would use Supabase Realtime or Firebase

import { Message } from '../types';

export interface TypingStatus {
  userId: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface ReadReceipt {
  messageId: string;
  userId: string;
  readAt: Date;
}

// Simulate typing indicator
export function simulateTypingIndicator(
  userId: string,
  callback: (status: TypingStatus) => void
): () => void {
  let timeoutId: NodeJS.Timeout;

  const sendTyping = (isTyping: boolean) => {
    callback({
      userId,
      isTyping,
      timestamp: new Date(),
    });
  };

  return () => {
    clearTimeout(timeoutId);
  };
}

// Simulate message delivery
export async function sendMessage(message: Omit<Message, 'id'>): Promise<Message> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    ...message,
    id: `m${Date.now()}`,
  };
}

// Simulate marking messages as read
export async function markMessagesAsRead(
  messageIds: string[],
  userId: string
): Promise<ReadReceipt[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return messageIds.map((id) => ({
    messageId: id,
    userId,
    readAt: new Date(),
  }));
}

// Simulate auto-response for demo
export function simulateDetailerResponse(
  customerId: string,
  detailerId: string,
  requestId: string
): Message {
  const responses = [
    "Thanks for reaching out! I'd be happy to help with your vehicle. What specific services are you interested in?",
    "Hi! I received your request. I can definitely work with your schedule. Let me know if you have any questions!",
    "Hello! I specialize in the services you mentioned. I'm available on the date you requested. Looking forward to working with you!",
  ];

  return {
    id: `m${Date.now()}`,
    senderId: detailerId,
    receiverId: customerId,
    requestId,
    text: responses[Math.floor(Math.random() * responses.length)],
    timestamp: new Date(Date.now() + 2000), // 2 seconds later
    read: false,
  };
}
