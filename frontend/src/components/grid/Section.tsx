'use client';

import { useEffect, useState, useRef } from 'react';
import { Editor, EditorState, ContentState, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';

interface SectionProps {
  id: string;
  title: string;
  content: string;
  onClick: () => void;
  onContentChange: (content: string) => void;
}

const Section: React.FC<SectionProps> = ({ id, title, content, onClick, onContentChange }) => {
  const [editorState, setEditorState] = useState(() => {
    try {
      // Try to parse content as raw Draft.js content
      const contentObj = JSON.parse(content);
      return EditorState.createWithContent(convertFromRaw(contentObj));
    } catch {
      // If it's not valid JSON, treat it as plain text
      return EditorState.createWithContent(ContentState.createFromText(content));
    }
  });

  const editorRef = useRef<Editor>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    // This would handle updates from real-time collaboration in a real app
  }, []);

  const handleEditorChange = (state: EditorState) => {
    setEditorState(state);
    const content = convertToRaw(state.getCurrentContent());
    onContentChange(JSON.stringify(content));
  };

  const handleFocus = () => {
    setFocused(true);
    onClick();
  };

  const handleBlur = () => {
    setFocused(false);
  };

  return (
    <div 
      className={`section-container h-full transition-shadow duration-200 ${
        focused ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={handleFocus}
    >
      <div className="section-header p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <div 
        className="section-content p-4 h-[calc(100%-3rem)] overflow-auto"
        onClick={() => editorRef.current?.focus()}
      >
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={handleEditorChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
};

export default Section; 