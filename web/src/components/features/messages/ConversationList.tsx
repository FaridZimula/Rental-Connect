import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { MessageSquare, Loader } from 'lucide-react';
import { Message, Profile } from '../../../lib/types';
import { db } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

type ConversationListProps = {
  onSelectUser: (user: Profile) => void;
};

type Conversation = {
  otherUser: Profile;
  lastMessage: Message;
  unreadCount: number;
};

export default function ConversationList({ onSelectUser }: ConversationListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      try {
        // This would need to be implemented in the backend
        // For now, we'll just show a loading state
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load conversations:', error);
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary-900" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center h-12 w-12 bg-gray-100 rounded-full mb-4">
          <MessageSquare className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No conversations yet</h3>
        <p className="text-gray-500 mt-1">Start messaging with hostel owners or students</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <motion.div
          key={conversation.otherUser.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => onSelectUser(conversation.otherUser)}
          className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{conversation.otherUser.full_name}</h4>
              <p className="text-sm text-gray-500 line-clamp-1">
                {conversation.lastMessage.content}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {format(new Date(conversation.lastMessage.created_at), 'HH:mm')}
              </p>
              {conversation.unreadCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 w-5 bg-primary-900 text-white text-xs rounded-full mt-1">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}