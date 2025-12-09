'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageCircle,
  Send,
  X,
  Circle,
  MousePointer2,
  Crown,
  Eye,
  Edit3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  status: 'online' | 'away' | 'offline';
  role: 'owner' | 'editor' | 'viewer';
  cursorPosition?: { x: number; y: number };
  currentScene?: number;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  message: string;
  timestamp: Date;
}

interface CollaborationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Collaborator;
  collaborators: Collaborator[];
  onInvite: () => void;
}

// Mock data for demo
const MOCK_COLLABORATORS: Collaborator[] = [
  {
    id: 'user-1',
    name: 'You',
    avatar: '👤',
    color: '#8B5CF6',
    status: 'online',
    role: 'owner',
    currentScene: 0,
  },
  {
    id: 'user-2',
    name: 'Alex',
    avatar: '🧑‍🎨',
    color: '#3B82F6',
    status: 'online',
    role: 'editor',
    cursorPosition: { x: 45, y: 60 },
    currentScene: 1,
  },
  {
    id: 'user-3',
    name: 'Sam',
    avatar: '👩‍💻',
    color: '#10B981',
    status: 'away',
    role: 'editor',
    currentScene: 0,
  },
  {
    id: 'user-4',
    name: 'Jordan',
    avatar: '🎬',
    color: '#F59E0B',
    status: 'offline',
    role: 'viewer',
  },
];

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    userId: 'user-2',
    userName: 'Alex',
    userColor: '#3B82F6',
    message: 'I updated the character positions in scene 2!',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: 'msg-2',
    userId: 'user-3',
    userName: 'Sam',
    userColor: '#10B981',
    message: 'Looks great! Should we add more dialogue?',
    timestamp: new Date(Date.now() - 180000),
  },
  {
    id: 'msg-3',
    userId: 'user-1',
    userName: 'You',
    userColor: '#8B5CF6',
    message: 'Yes, let me work on that now.',
    timestamp: new Date(Date.now() - 60000),
  },
];

export default function CollaborationPanel({
  isOpen,
  onClose,
  currentUser,
  collaborators = MOCK_COLLABORATORS,
  onInvite,
}: CollaborationPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'chat'>('users');
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUser?.id || 'user-1',
      userName: currentUser?.name || 'You',
      userColor: currentUser?.color || '#8B5CF6',
      message: newMessage.trim(),
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: Collaborator['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3 text-yellow-400" />;
      case 'editor': return <Edit3 className="w-3 h-3 text-blue-400" />;
      case 'viewer': return <Eye className="w-3 h-3 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed right-4 bottom-4 z-40 w-80 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          <span className="font-medium text-white">Collaboration</span>
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
            {collaborators.filter(c => c.status === 'online').length} online
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Team
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-1" />
                Chat
              </button>
            </div>

            {/* Content */}
            <div className="h-80">
              {activeTab === 'users' && (
                <div className="p-3 space-y-2 overflow-y-auto h-full">
                  {collaborators.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors"
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                          style={{ backgroundColor: user.color + '30' }}
                        >
                          {user.avatar}
                        </div>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(user.status)}`}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-white font-medium text-sm truncate">
                            {user.name}
                          </span>
                          {getRoleIcon(user.role)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.currentScene !== undefined
                            ? `Viewing Scene ${user.currentScene + 1}`
                            : user.status}
                        </div>
                      </div>

                      {/* Cursor indicator */}
                      {user.cursorPosition && user.status === 'online' && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MousePointer2 className="w-3 h-3" style={{ color: user.color }} />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Invite Button */}
                  <button
                    onClick={onInvite}
                    className="w-full p-3 border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-xl text-gray-400 hover:text-purple-400 transition-colors text-sm"
                  >
                    + Invite collaborator
                  </button>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="flex flex-col h-full">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${msg.userId === (currentUser?.id || 'user-1') ? 'flex-row-reverse' : ''}`}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
                          style={{ backgroundColor: msg.userColor + '30' }}
                        >
                          {collaborators.find(c => c.id === msg.userId)?.avatar || '👤'}
                        </div>
                        <div className={`max-w-[70%] ${msg.userId === (currentUser?.id || 'user-1') ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium" style={{ color: msg.userColor }}>
                              {msg.userName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                          <div
                            className={`px-3 py-2 rounded-xl text-sm ${
                              msg.userId === (currentUser?.id || 'user-1')
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-800 text-gray-200'
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-gray-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl transition-colors"
                      >
                        <Send className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Cursor overlay component for showing collaborator cursors on the stage
export function CollaboratorCursors({ collaborators }: { collaborators: Collaborator[] }) {
  return (
    <>
      {collaborators
        .filter(c => c.cursorPosition && c.status === 'online' && c.id !== 'user-1')
        .map((collaborator) => (
          <motion.div
            key={collaborator.id}
            className="absolute pointer-events-none z-50"
            style={{
              left: `${collaborator.cursorPosition!.x}%`,
              top: `${collaborator.cursorPosition!.y}%`,
            }}
            animate={{
              left: `${collaborator.cursorPosition!.x}%`,
              top: `${collaborator.cursorPosition!.y}%`,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <MousePointer2
              className="w-5 h-5 -rotate-12"
              style={{ color: collaborator.color }}
              fill={collaborator.color}
            />
            <div
              className="absolute left-4 top-4 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
              style={{ backgroundColor: collaborator.color }}
            >
              {collaborator.name}
            </div>
          </motion.div>
        ))}
    </>
  );
}
