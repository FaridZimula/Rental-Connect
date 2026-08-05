import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';

interface Owner {
  id: string;
  name: string;
  avatar: string;
}

interface Message {
  id: string;
  sender: 'broker' | 'owner';
  content: string;
  time: string;
}

const mockOwners: Owner[] = [
  { id: '1', name: 'John Doe', avatar: '/images/logo1.png' },
  { id: '2', name: 'Alice Smith', avatar: '/images/logo2.png' },
  { id: '3', name: 'Mike Johnson', avatar: '/images/logo1.png' },
];

const mockMessages: { [ownerId: string]: Message[] } = {
  '1': [
    { id: 'm1', sender: 'broker', content: 'Hello John, please update your hostel info.', time: '09:00' },
    { id: 'm2', sender: 'owner', content: 'Thanks, I will do that.', time: '09:01' },
  ],
  '2': [
    { id: 'm1', sender: 'broker', content: 'Hi Alice, your documents are approved.', time: '10:00' },
    { id: 'm2', sender: 'owner', content: 'Thank you!', time: '10:01' },
  ],
  '3': [
    { id: 'm1', sender: 'broker', content: 'Mike, please check your email for updates.', time: '11:00' },
    { id: 'm2', sender: 'owner', content: 'Received, thanks.', time: '11:01' },
  ],
};

const MessagingSystem: React.FC = () => {
  const [selectedOwnerId, setSelectedOwnerId] = useState('1');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ [ownerId: string]: Message[] }>(mockMessages);
  const [showChat, setShowChat] = useState(window.innerWidth >= 768); // true for desktop, false for mobile
  const owner = mockOwners.find(o => o.id === selectedOwnerId);
  const chat = messages[selectedOwnerId] || [];

  // Responsive handler
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setShowChat(false);
      else setShowChat(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMsg: Message = {
      id: 'm' + Date.now(),
      sender: 'broker',
      content: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => ({
      ...prev,
      [selectedOwnerId]: [...(prev[selectedOwnerId] || []), newMsg],
    }));
    setInput('');
    setTimeout(() => {
      const chatBody = document.getElementById('chat-body');
      if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
    }, 50);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center py-0 px-0 md:py-10 md:px-4">
      <div className="w-full h-screen md:h-[600px] md:max-w-5xl bg-white md:rounded-2xl md:shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar: Owners */}
        <div className={`z-10 bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 md:w-1/3 w-full h-full md:static fixed top-0 left-0 ${showChat && window.innerWidth < 768 ? '-translate-x-full' : 'translate-x-0'}`}
          style={{ maxWidth: window.innerWidth < 768 ? '100vw' : undefined }}>
          <div className="p-4 font-bold text-lg border-b flex items-center gap-2 md:gap-0">
            <span className="md:hidden">Chats</span>
            <span className="hidden md:block">Hostel Owners</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mockOwners.map(o => (
              <div
                key={o.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-primary-50 transition ${selectedOwnerId === o.id ? 'bg-primary-100' : ''}`}
                onClick={() => {
                  setSelectedOwnerId(o.id);
                  if (window.innerWidth < 768) setShowChat(true);
                }}
              >
                <img src={o.avatar} alt={o.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{o.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col h-full bg-chat-whatsapp relative ${showChat ? 'block' : 'hidden'} md:block`}
          style={{ minWidth: 0 }}>
          {/* Sticky Chat Header */}
          <div className="sticky top-0 z-20 bg-white border-b flex items-center gap-3 px-4 py-3 shadow-sm">
            {window.innerWidth < 768 && (
              <button onClick={() => setShowChat(false)} className="md:hidden mr-2 text-gray-500 hover:text-primary-600">
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            {owner && <img src={owner.avatar} alt={owner.name} className="w-10 h-10 rounded-full object-cover" />}
            <div className="font-semibold text-lg text-gray-900">{owner?.name}</div>
          </div>
          {/* Chat Body */}
          <div id="chat-body" className="flex-1 overflow-y-auto px-2 py-4 md:p-6 space-y-2 bg-chat-whatsapp-pattern" style={{ background: 'linear-gradient(135deg, #ece5dd 0%, #fff 100%)' }}>
            {chat.map((m, i) => {
              const isBroker = m.sender === 'broker';
              const isFirst = i === 0 || chat[i - 1].sender !== m.sender;
              const isLast = i === chat.length - 1 || chat[i + 1].sender !== m.sender;
              return (
                <div key={m.id} className={`flex ${isBroker ? 'justify-end' : 'justify-start'}`}> 
                  <div className={`relative max-w-[80vw] md:max-w-xs px-4 py-2 rounded-2xl shadow text-sm ${isBroker ? 'bg-primary-500 text-white' : 'bg-white text-gray-900'} ${isFirst && isLast ? 'rounded-br-none md:rounded-br-2xl' : isFirst ? 'rounded-br-none' : isLast ? 'rounded-tr-none' : ''}`}
                    style={{
                      borderBottomRightRadius: isBroker && isLast ? 0 : undefined,
                      borderBottomLeftRadius: !isBroker && isLast ? 0 : undefined,
                    }}
                  >
                    <div>{m.content}</div>
                    <div className="text-xs text-gray-300 mt-1 text-right">{m.time}</div>
                    {/* Bubble tail */}
                    {isLast && (
                      <span className={`absolute ${isBroker ? 'right-0' : 'left-0'} bottom-0 w-3 h-3 overflow-hidden`}
                        style={{ transform: isBroker ? 'translateX(60%)' : 'translateX(-60%)' }}>
                        <svg viewBox="0 0 12 12" width="12" height="12">
                          <path d="M0,12 Q6,0 12,12" fill={isBroker ? '#3b82f6' : '#fff'} />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Chat Input */}
          <form
            className="sticky bottom-0 z-10 bg-white flex gap-2 items-center px-2 py-2 md:px-4 border-t"
            onSubmit={handleSend}
            style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.03)' }}
          >
            <input
              type="text"
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-100"
              placeholder="Type your message to the owner..."
              value={input}
              onChange={e => setInput(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 flex items-center justify-center shadow-md transition">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
      <style>{`
        .bg-chat-whatsapp-pattern {
          background: linear-gradient(135deg, #ece5dd 0%, #fff 100%);
        }
      `}</style>
    </div>
  );
};

export default MessagingSystem; 