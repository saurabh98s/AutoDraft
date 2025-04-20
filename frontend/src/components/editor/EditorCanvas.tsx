'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setActiveSection } from '../../store/slices/docSlice';
import Section from '../grid/Section';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface EditorCanvasProps {
  sections: Record<string, {
    id: string;
    title: string;
    content: string;
  }>;
  layout: {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    maxW?: number;
  }[];
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({ sections, layout }) => {
  const [currentLayout, setCurrentLayout] = useState(layout);
  const dispatch = useDispatch();

  const handleLayoutChange = (newLayout: any) => {
    setCurrentLayout(newLayout);
    // In a real application, we would save this to the backend
  };

  const handleSectionClick = (sectionId: string) => {
    dispatch(setActiveSection(sectionId));
  };

  const handleContentChange = (sectionId: string, newContent: string) => {
    // In a real application, we would save this change to the backend
    console.log(`Section ${sectionId} content changed:`, newContent);
  };

  return (
    <div className="editor-canvas w-full">
      <GridLayout
        className="layout"
        layout={currentLayout}
        cols={12}
        rowHeight={30}
        width={1200}
        onLayoutChange={handleLayoutChange}
        isDraggable={false}
        isResizable={true}
      >
        {Object.values(sections).map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
            <Section
              id={section.id}
              title={section.title}
              content={section.content}
              onClick={() => handleSectionClick(section.id)}
              onContentChange={(newContent) => handleContentChange(section.id, newContent)}
            />
          </div>
        ))}
      </GridLayout>
    </div>
  );
};

export default EditorCanvas; 