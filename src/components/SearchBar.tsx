'use client';

import { useState, useRef } from 'react';
import { Paperclip, Send, ChevronDown, Sparkles, X } from 'lucide-react';

interface SearchBarProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File) => Promise<void>;
  onToolSelect?: (tool: { id: number; name: string; icon: string }) => void;
  disabled?: boolean;
}

const SearchBar = ({ onSendMessage, onFileUpload, onToolSelect, disabled = false }: SearchBarProps) => {
  const [message, setMessage] = useState('');
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools = [
    { id: 1, name: 'Grammar Correction', icon: '📝' },
    { id: 2, name: 'Code Assistant', icon: '💻' },
    { id: 3, name: 'File OCR', icon: '📄' },
    { id: 4, name: 'Paraphraser', icon: '🔄' },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await onFileUpload(selectedFile);
      setMessage(`File "${selectedFile.name}" uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Upload error. Please check your connection.');
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (selectedFile) {
        uploadFile();
      } else {
        handleSend();
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 lg:ml-80">
      <div className="max-w-4xl mx-auto">
        {/* File Upload Status */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip size={16} className="text-blue-600" />
              <span className="text-sm text-blue-900">{selectedFile.name}</span>
              <span className="text-xs text-blue-600">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={uploadFile}
                disabled={isUploading || disabled}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={removeFile}
                className="text-blue-600 hover:text-blue-800"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="relative flex items-center bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.rtf"
          />

          {/* Attachment Icon */}
          <button 
            onClick={handleAttachmentClick}
            disabled={disabled}
            className="p-3 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>

          {/* Text Input */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedFile ? "Add a message (optional)..." : "Message ChatGPT..."}
            className="flex-1 p-3 resize-none border-none outline-none text-gray-900 placeholder-gray-500 min-h-[20px] max-h-32 disabled:bg-gray-50"
            rows={1}
            disabled={disabled}
          />

          {/* Tools Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              disabled={disabled}
              className="p-3 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <Sparkles size={16} />
              <ChevronDown size={16} />
            </button>

            {/* Tools Menu */}
            {isToolsOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 px-3 py-1">Tools</div>
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        if (onToolSelect) {
                          onToolSelect(tool);
                        }
                        setIsToolsOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex items-center gap-3 transition-colors"
                    >
                      <span className="text-lg">{tool.icon}</span>
                      <span className="text-sm text-gray-700">{tool.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={selectedFile ? uploadFile : handleSend}
            disabled={(!message.trim() && !selectedFile) || isUploading || disabled}
            className="p-3 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar; 