import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Send, Loader } from 'lucide-react';
import { Message, Profile } from '../../../lib/types';
import { db } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../ui/Button';

type MessageListProps = {
  otherUser: Profile;
  bookingId?: string;
};

export default function MessageList({ otherUser, bookingId }: MessageListProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    const loadMessages = async () => {
      try {
        const messages = await db.messages.getConversation(user.id, otherUser.id);
        setMessages(messages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [user, otherUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    setIsSending(true);
    try {
      const message = await db.messages.send({
        sender_id: user.id,
        receiver_id: otherUser.id,
        booking_id: bookingId,
        content: newMessage.trim(),
      });

      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold">Chat with {otherUser.full_name}</h3>
        <p className="text-sm text-gray-500">{otherUser.email}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_id === user?.id
                    ? 'bg-primary-900 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {format(new Date(message.created_at), 'HH:mm')}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent"
            disabled={isSending}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={isSending || !newMessage.trim()}
            icon={isSending ? <Loader className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}