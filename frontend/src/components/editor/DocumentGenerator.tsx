import { useState } from 'react';
import { toast } from 'react-toastify';

interface DocumentGeneratorProps {
  documentId: string;
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ documentId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState('docx');

  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Simulate document generation with progress updates
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setGenerationProgress(i);
      }
      
      toast.success(`Document generated successfully in ${selectedFormat.toUpperCase()} format!`);
      
      // Simulate download after a brief delay
      setTimeout(() => {
        // In a real implementation, this would trigger an actual file download
        const a = document.createElement('a');
        a.href = `#`;
        a.download = `grant-${documentId}.${selectedFormat}`;
        a.click();
      }, 500);
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Failed to generate document');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Document Generator</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedFormat('docx')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedFormat === 'docx' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Word (DOCX)
          </button>
          <button
            type="button"
            onClick={() => setSelectedFormat('pdf')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedFormat === 'pdf' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            PDF
          </button>
          <button
            type="button"
            onClick={() => setSelectedFormat('txt')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedFormat === 'txt' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Text (TXT)
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="include-toc"
              name="include-toc"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              defaultChecked
            />
            <label htmlFor="include-toc" className="ml-2 block text-sm text-gray-700">
              Include Table of Contents
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="include-appendices"
              name="include-appendices"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              defaultChecked
            />
            <label htmlFor="include-appendices" className="ml-2 block text-sm text-gray-700">
              Include Appendices
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="include-references"
              name="include-references"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              defaultChecked
            />
            <label htmlFor="include-references" className="ml-2 block text-sm text-gray-700">
              Include References
            </label>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
        <select
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          defaultValue="default"
        >
          <option value="default">Default Template</option>
          <option value="nih">NIH Format</option>
          <option value="nsf">NSF Format</option>
          <option value="foundation">Foundation Template</option>
          <option value="custom">Custom Template</option>
        </select>
      </div>
      
      {isGenerating && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Generating Document... {generationProgress}%
          </label>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${generationProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <button
        type="button"
        onClick={handleGenerateDocument}
        disabled={isGenerating}
        className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isGenerating ? 'Generating...' : 'Generate Document'}
      </button>
    </div>
  );
};

export default DocumentGenerator; 