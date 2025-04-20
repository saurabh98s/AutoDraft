'use client';

import { useState, useRef, useEffect } from 'react';
import TextSelectionHelper from '../editor/TextSelectionHelper';

interface SectionProps {
  id: string;
  title: string;
  content: string;
  onClick?: () => void;
  onContentChange?: (newContent: string) => void;
}

const Section: React.FC<SectionProps> = ({ id, title, content, onClick, onContentChange }) => {
  const [localContent, setLocalContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionCoords, setSelectionCoords] = useState({ x: 0, y: 0 });
  const [showTextHelper, setShowTextHelper] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update local content when prop changes
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleTextSelection = () => {
    if (!isEditing) return;
    
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const selectedText = selection.toString();
      if (selectedText.trim().length > 0) {
        // Get selection coordinates
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectedText(selectedText);
        setSelectionCoords({ 
          x: rect.left + rect.width / 2, 
          y: rect.top 
        });
        setShowTextHelper(true);
      }
    } else {
      setShowTextHelper(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onContentChange) {
      onContentChange(localContent);
    }
  };

  const handleTransformedText = (newText: string) => {
    if (!textareaRef.current) return;
    
    // Get cursor position
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    // Replace selected text with transformed text
    const newContent = 
      localContent.substring(0, start) + 
      newText + 
      localContent.substring(end);
    
    setLocalContent(newContent);
    
    // Focus textarea and update cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPosition = start + newText.length;
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
    
    if (onContentChange) {
      onContentChange(newContent);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg h-full flex flex-col" onClick={onClick}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div>
          {isEditing ? (
            <button
              type="button"
              onClick={handleSave}
              className="px-2 py-1 text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
            >
              Save
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-2 py-1 text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
            >
              Edit
            </button>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <div className="relative flex-grow">
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={handleChange}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            className="w-full h-full min-h-[150px] p-2 border border-gray-300 rounded resize-none focus:ring-blue-500 focus:border-blue-500"
          />
          
          <TextSelectionHelper
            visible={showTextHelper}
            x={selectionCoords.x}
            y={selectionCoords.y}
            selectedText={selectedText}
            onTextTransform={handleTransformedText}
            onClose={() => setShowTextHelper(false)}
          />
        </div>
      ) : (
        <div className="prose max-w-none flex-grow overflow-y-auto whitespace-pre-wrap">
          {localContent || (
            <p className="text-gray-400 italic">No content yet. Click Edit to add content.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Section; 