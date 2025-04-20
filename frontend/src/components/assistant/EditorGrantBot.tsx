'use client';

import { useState, useEffect, useRef } from 'react';
import { ENDPOINTS, buildUrl } from '../../config/api';

interface EditorGrantBotProps {
  sectionId: string;
  sectionText: string;
  onApplyChanges: (newText: string) => void;
}

interface Message {
  role: string;
  content: string;
  toolCall?: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

const EditorGrantBot: React.FC<EditorGrantBotProps> = ({
  sectionId,
  sectionText,
  onApplyChanges
}) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  const handleSendMessage = async (e: React.FormEvent | null, quickPrompt?: string) => {
    if (e) e.preventDefault();
    
    const message = quickPrompt || inputValue;
    if (!message.trim()) return;

    // Add user message to the chat
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    // Set loading state for UI
    setIsLoading(true);
    setCurrentResponse('Analyzing...');
    setError(null);
    
    console.log('EditorGrantBot: Sending message:', message);
    console.log('EditorGrantBot: Section ID:', sectionId);
    console.log('EditorGrantBot: Section text length:', sectionText.length);
    
    // Build URL with section context using the helper
    const url = buildUrl(ENDPOINTS.AGENT_RUN, {
      message,
      section_id: sectionId,
      // Limit section text length to avoid URL length issues
      section_text: sectionText.substring(0, 1000)
    });
    
    console.log('EditorGrantBot: Using API URL:', url);
    
    try {
      // First check if the backend is reachable
      try {
        const healthCheck = await fetch(ENDPOINTS.HEALTH);
        if (!healthCheck.ok) {
          console.error('EditorGrantBot: Backend health check failed:', healthCheck.status);
          throw new Error(`Backend health check failed with status ${healthCheck.status}`);
        }
        console.log('EditorGrantBot: Backend health check passed');
      } catch (healthError) {
        console.error('EditorGrantBot: Backend health check error:', healthError);
        throw new Error('Cannot connect to backend server. Please ensure it is running.');
      }
      
      // Now make the actual API call
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('EditorGrantBot: API request failed:', response.status);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('EditorGrantBot: Received response:', data);
      
      // Clear the temporary "Analyzing..." message
      setCurrentResponse('');
      
      // Handle tool calls if present
      if (data.tool_calls && data.tool_calls.length > 0) {
        console.log('EditorGrantBot: Processing tool calls:', data.tool_calls);
        data.tool_calls.forEach((toolCall: ToolCall) => {
          setMessages(prev => [...prev, { 
            role: 'system', 
            content: `Analyzing text...`,
            toolCall: toolCall
          }]);
        });
      }
      
      // Add assistant response
      if (data.content) {
        console.log('EditorGrantBot: Adding assistant response');
        setMessages(prev => [...prev, {
          role: data.role || 'assistant',
          content: data.content
        }]);
      } else {
        console.error('EditorGrantBot: No content in response');
        throw new Error('Received empty response from agent service');
      }
      
      // Handle error
      if (data.error) {
        console.error('EditorGrantBot: Error in response:', data.error);
        setError(data.content || 'An error occurred with the agent service.');
      }
      
    } catch (error) {
      console.error('EditorGrantBot: Error fetching from agent API:', error);
      setError(typeof error === 'object' && error !== null && 'message' in error 
        ? (error as Error).message 
        : 'Failed to connect to the assistant service. Please try again.');
    } finally {
      setIsLoading(false);
      setCurrentResponse('');
      setInputValue('');
    }
  };

  const handleApplyChanges = () => {
    // Find the last assistant message to apply
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMessage) {
      onApplyChanges(lastAssistantMessage.content);
    }
  };

  const getToolCallIcon = (toolName: string) => {
    switch (toolName) {
      case 'analyze_grant_text':
        return '🔍';
      case 'research_topic':
        return '📚';
      case 'check_compliance':
        return '✅';
      default:
        return '⚙️';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Chat Messages */}
      <div className="h-64 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 && !currentResponse && !error ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              Ask GrantBot to help you improve this section.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`text-sm ${message.role === 'user' ? 'text-right' : ''}`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.role === 'system'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  {message.toolCall && (
                    <div className="flex items-center text-xs mb-1">
                      <span className="mr-1">{getToolCallIcon(message.toolCall.name)}</span>
                      <span className="font-medium">{message.toolCall.name}</span>
                    </div>
                  )}
                  {message.content}
                </div>
              </div>
            ))}
            
            {/* Streaming response */}
            {isLoading && currentResponse && (
              <div className="text-sm">
                <div className="inline-block px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-800">
                  {currentResponse}
                  <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse"></span>
                </div>
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="text-sm text-center">
                <div className="inline-block px-4 py-2 rounded-lg bg-red-100 text-red-800">
                  {error}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Quick Suggestions */}
      <div className="p-2 border-t border-gray-200 grid grid-cols-4 gap-2">
        <button
          className="px-2 py-1 text-sm bg-gray-100 rounded text-gray-800 hover:bg-gray-200"
          onClick={() => handleSendMessage(null, "Improve this section")}
          disabled={isLoading}
        >
          Improve
        </button>
        <button
          className="px-2 py-1 text-sm bg-gray-100 rounded text-gray-800 hover:bg-gray-200"
          onClick={() => handleSendMessage(null, "Make it more compelling")}
          disabled={isLoading}
        >
          Make compelling
        </button>
        <button
          className="px-2 py-1 text-sm bg-gray-100 rounded text-gray-800 hover:bg-gray-200"
          onClick={() => handleSendMessage(null, "Simplify language")}
          disabled={isLoading}
        >
          Simplify
        </button>
        <button
          className="px-2 py-1 text-sm bg-gray-100 rounded text-gray-800 hover:bg-gray-200"
          onClick={() => handleSendMessage(null, "Add more detail")}
          disabled={isLoading}
        >
          Add detail
        </button>
      </div>
      
      {/* Input Form */}
      <div className="p-3 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask GrantBot..."
            className="flex-1 border border-gray-300 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
      
      {/* Apply Changes Button - only show if we have assistant messages */}
      {messages.some(m => m.role === 'assistant') && (
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleApplyChanges}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Apply Changes to Text
          </button>
        </div>
      )}
    </div>
  );
};

export default EditorGrantBot; 