import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axios from 'axios';
import { Editor, EditorState, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';

interface Section {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface AISuggestion {
  id: string;
  content: string;
  status: string;
}

const ProjectEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  
  const [project, setProject] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProject(response.data);
        setSections(response.data.sections);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch project');
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, token]);

  const handleSectionSelect = (section: Section) => {
    setCurrentSection(section);
    const contentState = ContentState.createFromText(section.content || '');
    setEditorState(EditorState.createWithContent(contentState));
  };

  const handleEditorChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
    if (currentSection) {
      const content = newEditorState.getCurrentContent().getPlainText();
      updateSectionContent(currentSection.id, content);
    }
  };

  const updateSectionContent = async (sectionId: string, content: string) => {
    try {
      await axios.put(
        `http://localhost:8000/sections/${sectionId}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      setError('Failed to update section');
    }
  };

  const requestAISuggestion = async () => {
    if (!currentSection) return;

    try {
      const response = await axios.post(
        'http://localhost:8000/rag/query',
        {
          section_id: currentSection.id,
          content: editorState.getCurrentContent().getPlainText(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAiSuggestions([...aiSuggestions, response.data]);
    } catch (err) {
      setError('Failed to get AI suggestion');
    }
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    if (!currentSection) return;

    const contentState = ContentState.createFromText(suggestion.content);
    setEditorState(EditorState.createWithContent(contentState));
    updateSectionContent(currentSection.id, suggestion.content);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {project?.title || 'Loading...'}
        </h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Sections Sidebar */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Sections</h2>
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionSelect(section)}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    currentSection?.id === section.id
                      ? 'bg-blue-100 text-blue-800'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="col-span-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            {currentSection ? (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  {currentSection.title}
                </h2>
                <div className="border rounded-md p-4 min-h-[400px]">
                  <Editor
                    editorState={editorState}
                    onChange={handleEditorChange}
                  />
                </div>
                <button
                  onClick={requestAISuggestion}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Get AI Suggestion
                </button>
              </>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Select a section to edit
              </div>
            )}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">AI Suggestions</h2>
            <div className="space-y-4">
              {aiSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="border rounded-md p-4"
                >
                  <p className="text-gray-700 mb-2">{suggestion.content}</p>
                  <button
                    onClick={() => applySuggestion(suggestion)}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    Apply Suggestion
                  </button>
                </div>
              ))}
              {aiSuggestions.length === 0 && (
                <p className="text-gray-500 text-center">
                  No suggestions yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor; 