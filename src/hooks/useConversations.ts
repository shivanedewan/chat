import { useState, useEffect } from 'react';
import { Conversation, Message } from '@/components/Sidebar';

const STORAGE_KEY = 'chatgpt-conversations';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConversations(parsed);
      } catch (error) {
        console.error('Failed to parse stored conversations:', error);
      }
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: Date.now(),
      messages: [],
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    return newConversation;
  };

  const addMessageToConversation = (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const updatedMessages = [...conv.messages, newMessage];
        // Update title based on first user message
        let title = conv.title;
        if (message.role === 'user' && conv.messages.length === 0) {
          title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
        }
        return {
          ...conv,
          title,
          messages: updatedMessages,
        };
      }
      return conv;
    }));
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
    }
  };

  const getCurrentConversation = () => {
    return conversations.find(conv => conv.id === currentConversationId) || null;
  };

  const selectConversation = (conversation: Conversation) => {
    setCurrentConversationId(conversation.id);
  };

  return {
    conversations,
    currentConversationId,
    currentConversation: getCurrentConversation(),
    createNewConversation,
    addMessageToConversation,
    deleteConversation,
    selectConversation,
  };
}; 