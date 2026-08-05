import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Image, File, X, Search, MoreVertical, ArrowLeft, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'broker' | 'owner';
  content: string;
  timestamp: string;
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
  status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: 'broker' | 'owner';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar?: string;
}

const mockConversations: Conversation[] = [
  {
    id: 'c1',
    participantId: 'b1',
    participantName: 'Broker John',
    participantRole: 'broker',
    lastMessage: 'Please update your hostel info.',
    lastMessageTime: '09:00',
    unreadCount: 1,
    avatar: '/images/logo2.png',
  },
  {
    id: 'c2',
    participantId: 'b2',
    participantName: 'Broker Alice',
    participantRole: 'broker',
    lastMessage: 'Your documents are approved.',
    lastMessageTime: '10:00',
    unreadCount: 0,
    avatar: '/images/logo1.png',
  },
];

const mockMessages: { [conversationId: string]: Message[] } = {
  c1: [
    {
      id: 'm1',
      senderId: 'b1',
      senderName: 'Broker John',
      senderRole: 'broker',
      content: 'Please update your hostel info.',
      timestamp: '2024-06-01T09:00:00Z',
      status: 'delivered',
    },
    {
      id: 'm2',
      senderId: 'current-user-id',
      senderName: 'Current User',
      senderRole: 'owner',
      content: 'Thanks, I will do that.',
      timestamp: '2024-06-01T09:01:00Z',
      status: 'sent',
    },
  ],
  c2: [
    {
      id: 'm1',
      senderId: 'b2',
      senderName: 'Broker Alice',
      senderRole: 'broker',
      content: 'Your documents are approved.',
      timestamp: '2024-06-01T10:00:00Z',
      status: 'delivered',
    },
    {
      id: 'm2',
      senderId: 'current-user-id',
      senderName: 'Current User',
      senderRole: 'owner',
      content: 'Thank you!',
      timestamp: '2024-06-01T10:01:00Z',
      status: 'sent',
    },
  ],
};

const MessagingSystem: React.FC<{ userRole: 'broker' | 'owner' }> = ({ userRole }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Add mock data for owner if empty
    if (userRole === 'owner' && conversations.length === 0) {
      setConversations(mockConversations);
      setSelectedConversation(mockConversations[0]);
      setMessages(mockMessages[mockConversations[0].id] || []);
    }
  }, [userRole, conversations.length]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'current-user-id', // TODO: Get from auth context
      senderName: 'Current User', // TODO: Get from auth context
      senderRole: userRole,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // TODO: Send message to backend
    try {
      // await sendMessage(message);
      // Update message status to delivered
      setMessages(prev =>
        prev.map(msg =>
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!selectedConversation) return;

    setIsLoading(true);
    try {
      // TODO: Implement file upload to cloud storage
      const uploadedFiles = await Promise.all(
        Array.from(files).map(async file => ({
          type: file.type.startsWith('image/') ? 'image' as const : 'file' as const,
          url: URL.createObjectURL(file), // Temporary URL, replace with actual upload
          name: file.name
        }))
      );

      const message: Message = {
        id: Date.now().toString(),
        senderId: 'current-user-id',
        senderName: 'Current User',
        senderRole: userRole,
        content: '',
        timestamp: new Date().toISOString(),
        attachments: uploadedFiles,
        status: 'sent'
      };

      setMessages(prev => [...prev, message]);
      // TODO: Send message with attachments to backend
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {selectedConversation ? (
            <>
              <button
                onClick={() => {
                  setSelectedConversation(null);
                  setShowConversations(true);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-800">
                {selectedConversation.participantName}
              </h1>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-gray-800">Messages</h1>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="h-[calc(100vh-80px)] lg:h-screen flex">
        {/* Conversations List */}
        <div className={`${showConversations ? 'block' : 'hidden'} lg:block w-full lg:w-80 border-r border-gray-200 flex flex-col bg-white`}>
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <MessageSquare className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500">No conversations yet</p>
                <p className="text-sm text-gray-400">Start a conversation to begin messaging</p>
              </div>
            ) : (
              filteredConversations.map(conversation => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    setShowConversations(false);
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {conversation.avatar ? (
                        <img
                          src={conversation.avatar}
                          alt={conversation.participantName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {conversation.participantName.charAt(0)}
                          </span>
                        </div>
                      )}
                      {conversation.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.participantName}
                        </p>
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${!showConversations ? 'block' : 'hidden'} lg:block flex-1 flex flex-col bg-white`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-3">
                  {selectedConversation.avatar ? (
                    <img
                      src={selectedConversation.avatar}
                      alt={selectedConversation.participantName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {selectedConversation.participantName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {selectedConversation.participantName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedConversation.participantRole}
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <MessageSquare className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-500">No messages yet</p>
                    <p className="text-sm text-gray-400">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.senderId === 'current-user-id' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === 'current-user-id'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        {message.attachments && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="bg-white bg-opacity-20 rounded p-2">
                                {attachment.type === 'image' ? (
                                  <img src={attachment.url} alt={attachment.name} className="max-w-full rounded" />
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <File className="h-4 w-4" />
                                    <span className="text-xs">{attachment.name}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    
                    {/* Attachment Menu */}
                    <AnimatePresence>
                      {isAttachmentMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
                        >
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                          >
                            <Image className="h-4 w-4" />
                            <span>Image</span>
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                          >
                            <File className="h-4 w-4" />
                            <span>File</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-primary-500 text-white p-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <MessageSquare className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingSystem; 