import { useState } from 'react';
import { toast } from 'react-toastify';

interface ResearchAssistantProps {
  grantId: string;
  onSectionGenerated?: (sectionType: string, content: string) => void;
}

type ResearchStatus = 'idle' | 'researching' | 'generating' | 'completed' | 'error';

const ResearchAssistant: React.FC<ResearchAssistantProps> = ({ grantId, onSectionGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('abstract');
  const [status, setStatus] = useState<ResearchStatus>('idle');
  const [researchResults, setResearchResults] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generatedSources, setGeneratedSources] = useState<string[]>([]);
  const [generatingSections, setGeneratingSections] = useState(false);

  const sectionOptions = [
    { value: 'abstract', label: 'Abstract' },
    { value: 'introduction', label: 'Introduction' },
    { value: 'methodology', label: 'Methodology' },
    { value: 'budget', label: 'Budget' },
    { value: 'timeline', label: 'Timeline' }
  ];

  const runResearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a research query');
      return;
    }

    setStatus('researching');
    setResearchResults(null);
    setGeneratedContent('');
    setGeneratedSources([]);

    try {
      const response = await fetch(`http://localhost:8000/api/grants/${grantId}/research-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Research failed');
      }

      const data = await response.json();
      setResearchResults(data.results);
      setStatus('completed');
    } catch (error) {
      console.error('Error running research:', error);
      toast.error('Failed to complete research');
      setStatus('error');
    }
  };

  const generateSection = async (sectionType: string) => {
    setStatus('generating');
    setGeneratedContent('');
    setGeneratedSources([]);

    try {
      const response = await fetch(`http://localhost:8000/api/grants/${grantId}/generate-section/${sectionType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Section generation failed');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      setGeneratedSources(data.sources);
      setStatus('completed');

      // Notify parent component if callback provided
      if (onSectionGenerated) {
        onSectionGenerated(sectionType, data.content);
      }

      toast.success(`${sectionType} section generated successfully!`);
    } catch (error) {
      console.error('Error generating section:', error);
      toast.error('Failed to generate section');
      setStatus('error');
    }
  };

  const generateAllSections = async () => {
    setGeneratingSections(true);
    setStatus('generating');

    try {
      const response = await fetch(`http://localhost:8000/api/grants/${grantId}/generate-all-sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate all sections');
      }

      const data = await response.json();
      setStatus('completed');

      // Notify parent for each generated section
      if (onSectionGenerated) {
        Object.entries(data).forEach(([sectionType, sectionData]: [string, any]) => {
          onSectionGenerated(sectionData.title, sectionData.content);
        });
      }

      toast.success('All sections generated successfully!');
    } catch (error) {
      console.error('Error generating all sections:', error);
      toast.error('Failed to generate all sections');
      setStatus('error');
    } finally {
      setGeneratingSections(false);
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'researching':
        return 'Researching...';
      case 'generating':
        return 'Generating content...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error occurred';
      default:
        return 'Ready';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div 
        className="bg-blue-600 text-white p-4 cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold">Research Assistant</h3>
        <div className="flex items-center">
          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded mr-2">
            {getStatusLabel()}
          </span>
          <svg 
            className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="p-4">
          <div className="mb-4">
            <div className="mb-6 flex flex-col space-y-2">
              <label htmlFor="research-topic" className="block text-sm font-medium text-gray-700">
                Research Topic
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="research-topic"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter research topic or question"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  onClick={runResearch}
                  disabled={status === 'researching' || !query.trim()}
                >
                  Research
                </button>
              </div>
            </div>

            <div className="border-b border-gray-200 my-4"></div>

            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-800 mb-2">
                Generate Section Content
              </h4>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  {sectionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  onClick={() => generateSection(selectedSection)}
                  disabled={status === 'generating'}
                >
                  Generate
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  onClick={generateAllSections}
                  disabled={generatingSections}
                >
                  Generate All Sections
                </button>
              </div>
            </div>

            {(status === 'researching' || status === 'generating') && (
              <div className="flex justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}

            {/* Research Results */}
            {researchResults && (
              <div className="mt-4">
                <h4 className="text-lg font-medium text-gray-800 mb-2">Research Results</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h5 className="font-medium text-gray-700">Summary</h5>
                  <p className="text-gray-600 mb-4">{researchResults.summary}</p>
                  
                  {researchResults.findings && researchResults.findings.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-700 mt-2">Key Findings</h5>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {researchResults.findings.map((finding: any, index: number) => (
                          <li key={index} className="text-gray-600">
                            <div className="font-medium">{finding.source}</div>
                            <ul className="list-disc pl-5 mt-1">
                              {finding.key_points.map((point: string, i: number) => (
                                <li key={i} className="text-sm">{point}</li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generated Content */}
            {generatedContent && (
              <div className="mt-4">
                <h4 className="text-lg font-medium text-gray-800 mb-2">Generated Content</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">{generatedContent}</pre>
                  
                  {generatedSources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h5 className="font-medium text-gray-700 text-sm">Sources</h5>
                      <ul className="list-disc pl-5 mt-1">
                        {generatedSources.map((source, index) => (
                          <li key={index} className="text-xs text-gray-600">{source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => {
                        if (onSectionGenerated) {
                          onSectionGenerated(selectedSection, generatedContent);
                          toast.success('Content applied to section');
                        }
                      }}
                    >
                      Apply to Section
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchAssistant; 