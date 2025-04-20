'use client';

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addMessage } from '../../store/slices/aiSlice';
import { useEventSource } from '../../hooks/useEventSource';

interface GrantBotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  toolCall?: {
    name: string;
    arguments: any;
  };
}

const GrantBot: React.FC<GrantBotProps> = ({ isOpen, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.ai.messages);
  const isStreaming = useSelector((state: RootState) => state.ai.isStreaming);

  const { startEventSource, stopEventSource } = useEventSource({
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.role) {
          // Regular message
          dispatch(addMessage({
            id: Date.now().toString(),
            role: data.role,
            content: data.content,
            timestamp: Date.now(),
          }));
        } else if (data.tool_call) {
          // Tool call
          dispatch(addMessage({
            id: Date.now().toString(),
            role: 'system',
            content: `Using tool: ${data.tool_call.name}`,
            timestamp: Date.now(),
            toolCall: {
              name: data.tool_call.name,
              arguments: data.tool_call.arguments,
            },
          }));
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    },
    onError: (error) => {
      console.error('SSE error:', error);
    },
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
    };
    dispatch(addMessage(userMessage));

    // In a real app, we'd connect to the backend here
    // For demo, simulate an API call
    startEventSource(`/api/agent/run?message=${encodeURIComponent(inputValue)}`);

    setInputValue('');
  };

  const getToolCallIcon = (toolName: string) => {
    switch (toolName) {
      case 'vector_search':
        return '🔍';
      case 'crm_fetch':
        return '📊';
      case 'compliance_check':
        return '🛡️';
      default:
        return '⚙️';
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 z-50 flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 015-2.906z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-medium">GrantBot</h2>
            <p className="text-xs text-gray-500">AI-powered grant assistant</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">Welcome to GrantBot</h3>
            <p className="mt-1 text-sm text-gray-500">
              I can help you write and improve your grant proposal. What would you like assistance with?
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.role === 'system'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  {message.toolCall && (
                    <div className="flex items-center text-xs mb-1">
                      <span className="mr-1">{getToolCallIcon(message.toolCall.name)}</span>
                      <span className="font-medium">{message.toolCall.name}</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse"></div>
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse delay-75"></div>
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick Reply Buttons */}
      <div className="px-4 py-2 border-t border-gray-200 flex flex-wrap gap-2">
        <button
          className="px-3 py-1 text-xs bg-gray-100 rounded-full text-gray-800 hover:bg-gray-200"
          onClick={() => setInputValue("How can I improve this section?")}
        >
          Improve section
        </button>
        <button
          className="px-3 py-1 text-xs bg-gray-100 rounded-full text-gray-800 hover:bg-gray-200"
          onClick={() => setInputValue("Make it more compelling")}
        >
          Make it compelling
        </button>
        <button
          className="px-3 py-1 text-xs bg-gray-100 rounded-full text-gray-800 hover:bg-gray-200"
          onClick={() => setInputValue("Add data to support this")}
        >
          Add data
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask GrantBot..."
            className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={isStreaming || !inputValue.trim()}
            className="absolute right-2 top-2 p-1 rounded-full bg-blue-600 text-white disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default GrantBot; 