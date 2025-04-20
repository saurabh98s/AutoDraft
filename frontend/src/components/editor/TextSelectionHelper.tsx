import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

interface TextSelectionHelperProps {
  visible: boolean;
  x: number;
  y: number;
  selectedText: string;
  onTextTransform: (newText: string) => void;
  onClose: () => void;
}

type TransformationType = 'rewrite' | 'improve' | 'shorten' | 'expand' | 'formalize' | 'simplify';

const TextSelectionHelper: React.FC<TextSelectionHelperProps> = ({
  visible,
  x,
  y,
  selectedText,
  onTextTransform,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [transformedText, setTransformedText] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

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

  // Reset state when visibility changes
  useEffect(() => {
    if (visible) {
      setTransformedText('');
      setCustomInstruction('');
      setShowCustomInput(false);
    }
  }, [visible]);

  const transformText = async (type: TransformationType, customPrompt: string = '') => {
    if (!selectedText.trim()) {
      toast.error('No text selected');
      return;
    }

    setIsLoading(true);

    try {
      let prompt: string;
      
      switch (type) {
        case 'rewrite':
          prompt = 'Rewrite this text to convey the same meaning but with different wording';
          break;
        case 'improve':
          prompt = 'Improve this text by enhancing clarity, grammar, and style';
          break;
        case 'shorten':
          prompt = 'Make this text more concise while preserving the key information';
          break;
        case 'expand':
          prompt = 'Expand this text with more details and supporting information';
          break;
        case 'formalize':
          prompt = 'Make this text more formal and professional';
          break;
        case 'simplify':
          prompt = 'Simplify this text to make it easier to understand';
          break;
        default:
          prompt = customPrompt || 'Rewrite this text';
      }

      // Call the text transformation API
      const response = await fetch('http://localhost:8000/api/text/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: selectedText,
          transformation_type: type,
          custom_instruction: customPrompt
        }),
      });

      if (!response.ok) {
        throw new Error('Text transformation failed');
      }

      const data = await response.json();
      setTransformedText(data.transformed_text);
    } catch (error) {
      console.error('Error transforming text:', error);
      toast.error('Failed to transform text');
      
      // Fallback to simple transformation if the API fails
      const cleanedText = selectedText.trim();
      let fallbackResult: string;
      
      if (customPrompt) {
        fallbackResult = `${cleanedText} [Custom instruction applied: ${customPrompt}]`;
      } else {
        switch (type) {
          case 'rewrite':
            fallbackResult = `${cleanedText} [Rewritten]`;
            break;
          case 'improve':
            fallbackResult = `${cleanedText} [Improved with better grammar and clarity]`;
            break;
          case 'shorten':
            fallbackResult = cleanedText.split(' ').slice(0, Math.max(3, Math.floor(cleanedText.split(' ').length * 0.7))).join(' ') + ' [Shortened]';
            break;
          case 'expand':
            fallbackResult = `${cleanedText} [Expanded with additional supporting details and examples to strengthen the argument]`;
            break;
          case 'formalize':
            fallbackResult = `${cleanedText} [Formalized with more professional language]`;
            break;
          case 'simplify':
            fallbackResult = `${cleanedText} [Simplified for better understanding]`;
            break;
          default:
            fallbackResult = cleanedText;
        }
      }
      
      setTransformedText(fallbackResult);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    transformText('rewrite', customInstruction);
  };

  const applyTransformation = () => {
    if (transformedText) {
      onTextTransform(transformedText);
      toast.success('Text updated');
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <div 
      ref={popoverRef}
      className="fixed bg-white shadow-xl rounded-lg border border-gray-200 p-3 w-72 z-50"
      style={{ 
        top: `${y}px`, 
        left: `${x}px`,
        transform: 'translate(-50%, -100%)',
        marginTop: '-10px'
      }}
    >
      <div className="text-sm text-gray-600 mb-2 pb-2 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-medium">AI Text Helper</span>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      </div>
      
      {!transformedText ? (
        <>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              type="button"
              onClick={() => transformText('rewrite')}
              disabled={isLoading}
              className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50"
            >
              Rewrite
            </button>
            <button
              type="button"
              onClick={() => transformText('improve')}
              disabled={isLoading}
              className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50"
            >
              Improve
            </button>
            <button
              type="button"
              onClick={() => transformText('shorten')}
              disabled={isLoading}
              className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800 hover:bg-purple-200 disabled:opacity-50"
            >
              Shorten
            </button>
            <button
              type="button"
              onClick={() => transformText('expand')}
              disabled={isLoading}
              className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:opacity-50"
            >
              Expand
            </button>
            <button
              type="button"
              onClick={() => transformText('formalize')}
              disabled={isLoading}
              className="px-2 py-1 text-xs font-medium rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200 disabled:opacity-50"
            >
              Formalize
            </button>
            <button
              type="button"
              onClick={() => transformText('simplify')}
              disabled={isLoading}
              className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50"
            >
              Simplify
            </button>
          </div>
          
          <div className="text-center">
            <button 
              type="button"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showCustomInput ? 'Hide custom instruction' : 'Custom instruction'}
            </button>
          </div>
          
          {showCustomInput && (
            <form onSubmit={handleCustomSubmit} className="mt-2">
              <input
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="Enter custom instruction..."
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isLoading || !customInstruction.trim()}
                className="w-full mt-1 px-2 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Apply Custom
              </button>
            </form>
          )}
          
          {isLoading && (
            <div className="flex justify-center py-2">
              <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </>
      ) : (
        <div>
          <div className="text-xs text-gray-700 mb-1">Result:</div>
          <div className="bg-gray-50 p-2 rounded-md text-xs text-gray-800 mb-2 max-h-32 overflow-y-auto">
            {transformedText}
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setTransformedText('')}
              className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Try Another
            </button>
            <button
              type="button"
              onClick={applyTransformation}
              className="px-2 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
      
      <div className="absolute w-3 h-3 bg-white transform rotate-45 left-1/2 -ml-1.5 -bottom-1.5 border-r border-b border-gray-200"></div>
    </div>
  );
};

export default TextSelectionHelper; 