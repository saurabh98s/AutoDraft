import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateSection } from '../../store/slices/docSlice';

interface SectionPanelProps {
  sectionId: string;
  onSave?: () => void;
}

const SectionPanel: React.FC<SectionPanelProps> = ({ sectionId, onSave }) => {
  const dispatch = useDispatch();
  const { sections } = useSelector((state: RootState) => state.doc);
  const section = sections[sectionId];
  
  const [content, setContent] = React.useState(section?.content || '');
  const [isEditing, setIsEditing] = React.useState(false);
  const [showGrantBot, setShowGrantBot] = React.useState(false);
  
  // Update local state when Redux store changes
  React.useEffect(() => {
    if (section) {
      setContent(section.content);
    }
  }, [section]);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = () => {
    if (sectionId && content !== undefined) {
      dispatch(updateSection({ 
        id: sectionId, 
        title: section.title, 
        content 
      }));
      setIsEditing(false);
      if (onSave) onSave();
    }
  };
  
  const handleGrantBotToggle = () => {
    setShowGrantBot(!showGrantBot);
  };
  
  if (!section) {
    return <div className="p-4 bg-gray-100 rounded">Select a section to edit</div>;
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold">{section.title}</h2>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleGrantBotToggle}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  showGrantBot 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-purple-500 text-white'
                }`}
              >
                GrantBot
              </button>
              <button 
                onClick={handleSave}
                className="px-3 py-1 text-sm font-medium rounded bg-green-600 text-white"
              >
                Save
              </button>
            </>
          ) : (
            <button 
              onClick={handleEdit}
              className="px-3 py-1 text-sm font-medium rounded bg-blue-600 text-white"
            >
              Edit
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded min-h-[200px]"
          />
        ) : (
          <div className="prose max-w-none">
            {content || <p className="text-gray-400 italic">No content yet. Click Edit to add content.</p>}
          </div>
        )}
        
        {/* GrantBot integration would go here */}
        {isEditing && showGrantBot && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-2">GrantBot</h3>
            <p className="text-sm text-gray-600 mb-4">
              Ask GrantBot to help improve your content.
            </p>
            
            {/* Placeholder for GrantBot UI */}
            <div className="flex">
              <input
                type="text"
                placeholder="Ask GrantBot for assistance..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
              />
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionPanel; 