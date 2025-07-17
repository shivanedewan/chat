'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import Sidebar from '@/components/Sidebar';
import ChatMessage from '@/components/ChatMessage';
import { useConversations } from '@/hooks/useConversations';
import { useEffect, useRef } from 'react';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedTool, setSelectedTool] = useState<{ id: number; name: string; icon: string } | null>({
    id: 5,
    name: 'Summarizer',
    icon: '📋',
  });

  const tools = [
    { id: 1, name: 'Grammar Correction', icon: '📝' },
    { id: 2, name: 'Code Assistant', icon: '💻' },
    { id: 3, name: 'File OCR', icon: '📄' },
    { id: 4, name: 'Paraphraser', icon: '🔄' },
    { id: 5, name: 'Summarizer', icon: '📋' },
  ];

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
    };

    if (isToolsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isToolsDropdownOpen]);

  const {
    conversations,
    currentConversationId,
    currentConversation,
    createNewConversation,
    addMessageToConversation,
    deleteConversation,
    selectConversation,
  } = useConversations();

  const handleSendMessage = async (message: string) => {
    if (!currentConversationId) {
      const newConv = createNewConversation();
      addMessageToConversation(newConv.id, {
        content: message,
        role: 'user',
      });
      // Simulate AI response
      setTimeout(() => {
        addMessageToConversation(newConv.id, {
          content: `I received your message: "${message}". This is a simulated response.`,
          role: 'assistant',
        });
      }, 1000);
    } else {
      addMessageToConversation(currentConversationId, {
        content: message,
        role: 'user',
      });
      // Simulate AI response
      setTimeout(() => {
        addMessageToConversation(currentConversationId, {
          content: `I received your message: "${message}". This is a simulated response.`,
          role: 'assistant',
        });
      }, 1000);
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://192.168.10.144/get_summary', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log('File uploaded successfully:', result);
      
      // Add file upload message to conversation
      if (currentConversationId) {
        addMessageToConversation(currentConversationId, {
          content: `File "${file.name}" uploaded successfully!`,
          role: 'user',
        });
      }
    } else {
      throw new Error('Upload failed');
    }
  };

  const handleNewChat = () => {
    createNewConversation();
    setIsSidebarOpen(false);
  };

  const handleToolSelect = (tool: { id: number; name: string; icon: string }) => {
    setSelectedTool(tool);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        conversations={conversations}
        onSelectConversation={selectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={deleteConversation}
        currentConversationId={currentConversationId}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">ChatGPT</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-md hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {/* Tools Dropdown */}
                {isToolsDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10" ref={dropdownRef}>
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 px-3 py-1">Tools</div>
                      {tools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => {
                            setSelectedTool(tool);
                            setIsToolsDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 bg-gray-50 rounded-md flex items-center gap-3 transition-colors"
                        >
                          <span className="text-lg">{tool.icon}</span>
                          <span className="text-sm text-gray-700">{tool.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <main className="flex-1 overflow-y-auto">
          {!currentConversation ? (
            // Welcome Screen
            <div className="max-w-4xl mx-auto px-4 py-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedTool ? `${selectedTool.name} Tool` : 'How can I help you today?'}
                </h2>
                <p className="text-gray-600">
                  {selectedTool 
                    ? `You're using the ${selectedTool.name} tool. Click on the tools icon to switch tools.`
                    : 'Click on the tools icon near the bottom right corner to select different tools available.'
                  }
                </p>
              </div>

              {/* Tool-specific prompts */}
              {selectedTool && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {selectedTool.id === 1 && (
                    <>
                      <div 
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                        onClick={() => handleSendMessage("Check grammar and spelling in this text: [Your text here]")}
                      >
                        <h3 className="font-medium text-gray-900 mb-2">Check grammar and spelling</h3>
                        <p className="text-sm text-gray-600">Paste your text to get grammar corrections</p>
                      </div>
                      <div 
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                        onClick={() => handleSendMessage("Improve the writing style of this text: [Your text here]")}
                      >
                        <h3 className="font-medium text-gray-900 mb-2">Improve writing style</h3>
                        <p className="text-sm text-gray-600">Make your writing more professional and clear</p>
                      </div>
                    </>
                  )}
                  {selectedTool.id === 2 && (
                    <>
                      <div 
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                        onClick={() => handleSendMessage("Debug this code: [Your code here]")}
                      >
                        <h3 className="font-medium text-gray-900 mb-2">Debug code</h3>
                        <p className="text-sm text-gray-600">Find and fix errors in your code</p>
                      </div>
                      <div 
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                        onClick={() => handleSendMessage("Explain this code: [Your code here]")}
                      >
                        <h3 className="font-medium text-gray-900 mb-2">Explain code</h3>
                        <p className="text-sm text-gray-600">Detailed explanation of code functionality</p>
                      </div>
                    </>
                  )}
                  {selectedTool.id === 3 && (
                    <>
                      <div 
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                        onClick={() => handleSendMessage("Extract text from this document")}
                      >
                        <h3 className="font-medium text-gray-900 mb-2">Extract text from document</h3>
                        <p className="text-sm text-gray-600">Upload a document to extract readable text</p>
                      </div>
                      <div 
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                        onClick={() => handleSendMessage("Convert image to text")}
                      >
                        <h3 className="font-medium text-gray-900 mb-2">Convert image to text</h3>
                        <p className="text-sm text-gray-600">Upload an image to extract text content</p>
                      </div>
                    </>
                  )}
                  {selectedTool.id === 4 && (
                    <>
                      <div 
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                        onClick={() => handleSendMessage("Rephrase this text: [Your text here]")}
                      >
                        <h3 className="font-medium text-gray-900 mb-2">Rephrase text</h3>
                        <p className="text-sm text-gray-600">Rewrite text while keeping the same meaning</p>
                      </div>
                      <div 
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                        onClick={() => handleSendMessage("Simplify this text: [Your text here]")}
                      >
                        <h3 className="font-medium text-gray-900 mb-2">Simplify text</h3>
                        <p className="text-sm text-gray-600">Make complex text easier to understand</p>
                      </div>
                    </>
                  )}
                  {selectedTool.id === 5 && (
                    <>
                      <div 
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                        onClick={() => handleSendMessage("Upload a document to get a summary")}
                      >
                        <h3 className="font-medium text-gray-900 mb-2">Upload document for summary</h3>
                        <p className="text-sm text-gray-600">Upload PDF, DOC, or text files to get a summary</p>
                      </div>
                      <div 
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                        onClick={() => handleSendMessage("Extract key points from document")}
                      >
                        <h3 className="font-medium text-gray-900 mb-2">Extract key points</h3>
                        <p className="text-sm text-gray-600">Get the main points and important information</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Default prompts when no tool is selected */}
              {!selectedTool && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div 
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                    onClick={() => handleSendMessage("Write a professional email")}
                  >
                    <h3 className="font-medium text-gray-900 mb-2">Write a professional email</h3>
                    <p className="text-sm text-gray-600">Draft a business email for any purpose</p>
                  </div>
                  <div 
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                    onClick={() => handleSendMessage("Explain a complex topic")}
                  >
                    <h3 className="font-medium text-gray-900 mb-2">Explain a complex topic</h3>
                    <p className="text-sm text-gray-600">Get a simple explanation of any concept</p>
                  </div>
                  <div 
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                    onClick={() => handleSendMessage("Help with code")}
                  >
                    <h3 className="font-medium text-gray-900 mb-2">Help with code</h3>
                    <p className="text-sm text-gray-600">Debug, explain, or write code</p>
                  </div>
                  <div 
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                    onClick={() => handleSendMessage("Creative writing")}
                  >
                    <h3 className="font-medium text-gray-900 mb-2">Creative writing</h3>
                    <p className="text-sm text-gray-600">Stories, poems, or creative content</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Chat Messages
            <div className="pb-32">
              {currentConversation.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          )}
        </main>

        {/* Search Bar */}
        <SearchBar
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          onToolSelect={handleToolSelect}
          disabled={false}
          currentTool={selectedTool}
        />
      </div>
    </div>
  );
}
