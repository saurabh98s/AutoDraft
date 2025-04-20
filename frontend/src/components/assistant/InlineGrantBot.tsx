'use client';

import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useEventSource } from '../../hooks/useEventSource';

interface InlineGrantBotProps {
  visible: boolean;
  x: number;
  y: number;
  sectionId: string;
  sectionText: string;
  onTextReplace: (newText: string) => void;
  onClose: () => void;
}

const InlineGrantBot: React.FC<InlineGrantBotProps> = ({
  visible,
  x,
  y,
  sectionId,
  sectionText,
  onTextReplace,
  onClose
}) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  const { startEventSource, stopEventSource } = useEventSource({
    onMessage: (event: { data: string }) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.role) {
          // Add to current response for streaming effect
          setCurrentResponse(prev => prev + data.content);
        } else if (data.tool_call) {
          // Tool call - for future implementation
          console.log('Tool call:', data.tool_call);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    },
    onError: (error) => {
      console.error('SSE error:', error);
      setIsLoading(false);
    },
    onOpen: () => {
      setIsLoading(true);
      setCurrentResponse('');
    },
    onComplete: () => {
      setIsLoading(false);
      // Add complete message to message history
      if (currentResponse) {
        setMessages(prev => [...prev, { role: 'assistant', content: currentResponse }]);
      }
    }
  });

  // Close the popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopEventSource();
    };
  }, [stopEventSource]);

  // Reset when opened
  useEffect(() => {
    if (visible) {
      setMessages([]);
      setCurrentResponse('');
      setInputValue('');
    }
  }, [visible]);

  const handleSendMessage = (e: React.FormEvent | null, quickPrompt?: string) => {
    if (e) e.preventDefault();
    
    const message = quickPrompt || inputValue;
    if (!message.trim()) return;

    // Add user message to the chat
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    // Set loading state and connect to the API with section context
    setIsLoading(true);
    let url = `/api/agent/run?message=${encodeURIComponent(message)}`;
    if (sectionId) {
      url += `&section_id=${encodeURIComponent(sectionId)}`;
      url += `&section_text=${encodeURIComponent(sectionText)}`;
    }
    
    startEventSource(url);
    setInputValue('');
  };

  const handleApplyChanges = () => {
    // Find the last assistant message to apply
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMessage) {
      onTextReplace(lastAssistantMessage.content);
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <div 
      ref={popoverRef}
      className="fixed bg-white shadow-xl rounded-lg border border-gray-200 z-50"
      style={{ 
        top: `${y}px`, 
        left: `${x}px`,
        transform: 'translate(-50%, -100%)',
        marginTop: '-10px',
        width: '320px',
        maxHeight: '400px'
      }}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 015-2.906z" />
            </svg>
          </div>
          <span className="text-sm font-medium">GrantBot</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Chat Messages */}
      <div className="h-56 overflow-y-auto p-3">
        {messages.length === 0 && !currentResponse ? (
          <div className="text-center py-2">
            <p className="text-xs text-gray-500">
              How would you like to improve this section?
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`text-xs ${message.role === 'user' ? 'text-right' : ''}`}
              >
                <div
                  className={`inline-block px-3 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {/* Streaming response */}
            {isLoading && currentResponse && (
              <div className="text-xs">
                <div className="inline-block px-3 py-2 rounded-lg bg-gray-100 text-gray-800">
                  {currentResponse}
                  <span className="inline-block w-1 h-4 ml-1 bg-gray-400 animate-pulse"></span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Quick Suggestions */}
      <div className="p-2 border-t border-gray-200 grid grid-cols-2 gap-1">
        <button
          className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-800 hover:bg-gray-200"
          onClick={() => handleSendMessage(null, "Improve this section")}
        >
          Improve
        </button>
        <button
          className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-800 hover:bg-gray-200"
          onClick={() => handleSendMessage(null, "Make it more compelling")}
        >
          Make compelling
        </button>
        <button
          className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-800 hover:bg-gray-200"
          onClick={() => handleSendMessage(null, "Simplify language")}
        >
          Simplify
        </button>
        <button
          className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-800 hover:bg-gray-200"
          onClick={() => handleSendMessage(null, "Add more detail")}
        >
          Add detail
        </button>
      </div>
      
      {/* Input Form */}
      <div className="p-2 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask GrantBot..."
            className="flex-1 text-xs border border-gray-300 rounded-l-lg py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-600 text-white px-2 py-1 rounded-r-lg text-xs disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
      
      {/* Apply Changes Button - only show if we have assistant messages */}
      {messages.some(m => m.role === 'assistant') && (
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={handleApplyChanges}
            className="w-full bg-green-600 text-white py-1 rounded text-xs hover:bg-green-700"
          >
            Apply Changes to Text
          </button>
        </div>
      )}
    </div>
  );
};

export default InlineGrantBot; 