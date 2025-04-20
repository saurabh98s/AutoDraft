import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface ComplianceCheckerProps {
  documentId?: string;
}

type ComplianceIssue = {
  id: string;
  section: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  suggestion?: string;
  fixed: boolean;
};

const ComplianceChecker: React.FC<ComplianceCheckerProps> = ({ documentId = 'default-doc' }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [complianceScore, setComplianceScore] = useState(0);
  const [issues, setIssues] = useState<ComplianceIssue[]>([]);

  // Initial compliance check on component mount
  useEffect(() => {
    runComplianceCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runComplianceCheck = async () => {
    setIsChecking(true);
    
    try {
      // Call the real compliance service endpoint
      const response = await fetch(`http://localhost:8000/projects/${documentId}/compliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Compliance check failed');
      }
      
      const data = await response.json();
      
      // Transform the real compliance data to match our UI component's expectations
      const transformedIssues: ComplianceIssue[] = [];
      
      // Process compliance issues
      if (data.compliance && data.compliance.issues) {
        data.compliance.issues.forEach((issue: any, index: number) => {
          transformedIssues.push({
            id: `compliance-${index}`,
            section: issue.category || 'General',
            severity: issue.severity as 'high' | 'medium' | 'low',
            message: issue.description,
            suggestion: issue.suggestion,
            fixed: false
          });
        });
      }
      
      // Add gap analysis issues if available
      if (data.gap_analysis && data.gap_analysis.gaps) {
        data.gap_analysis.gaps.forEach((gap: any, index: number) => {
          // Map importance levels to severity levels
          const severityMap: {[key: string]: 'high' | 'medium' | 'low'} = {
            'critical': 'high',
            'high': 'high',
            'medium': 'medium',
            'low': 'low'
          };
          
          transformedIssues.push({
            id: `gap-${index}`,
            section: gap.section || 'General',
            severity: severityMap[gap.importance] || 'medium',
            message: gap.gap_description,
            suggestion: gap.recommendation,
            fixed: false
          });
        });
      }
      
      // Calculate compliance score based on results
      let score = data.compliance?.score ? Math.round(data.compliance.score * 100) : 0;
      if (data.gap_analysis?.completeness_score) {
        // Average with gap analysis score if available
        score = Math.round((score + (data.gap_analysis.completeness_score * 100)) / 2);
      }
      
      setIssues(transformedIssues);
      setComplianceScore(score);
      setLastChecked(new Date());
      toast.success('Compliance check completed');
    } catch (error) {
      console.error('Error running compliance check:', error);
      toast.error('Failed to complete compliance check');
      
      // Fall back to the UI-friendly mock endpoint if the real service fails
      try {
        const mockResponse = await fetch(`http://localhost:8000/api/grants/${documentId}/compliance-check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (mockResponse.ok) {
          const mockData = await mockResponse.json();
          setIssues(mockData.issues);
          setComplianceScore(mockData.score);
          setLastChecked(new Date());
        } else {
          throw new Error('Mock compliance check also failed');
        }
      } catch (mockError) {
        console.error('Error running mock compliance check:', mockError);
        // Last resort - use hardcoded fallback data
        const fallbackIssues: ComplianceIssue[] = [
          {
            id: '1',
            section: 'Abstract',
            severity: 'high',
            message: 'Missing project timeline',
            suggestion: 'Add a brief timeline of key project milestones',
            fixed: false
          },
          {
            id: '2',
            section: 'Budget',
            severity: 'high',
            message: 'Budget exceeds maximum allowable amount',
            suggestion: 'Reduce budget to below $100,000',
            fixed: false
          },
          {
            id: '3',
            section: 'Methodology',
            severity: 'medium',
            message: 'Missing organizational capacity statement',
            suggestion: 'Add information about your organization\'s ability to execute the project',
            fixed: false
          },
          {
            id: '4',
            section: 'Introduction',
            severity: 'low',
            message: 'Section is too verbose',
            suggestion: 'Reduce length by 15-20%',
            fixed: false
          }
        ];
        
        setIssues(fallbackIssues);
        setComplianceScore(78); // Default score
        setLastChecked(new Date());
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleFixIssue = (id: string) => {
    setIssues(prev => 
      prev.map(issue => 
        issue.id === id ? { ...issue, fixed: true } : issue
      )
    );
    
    // Update compliance score
    const fixedCount = issues.filter(issue => issue.fixed || issue.id === id).length;
    const newScore = Math.min(100, Math.round((fixedCount / issues.length) * 100));
    setComplianceScore(newScore);
    
    toast.success('Issue fixed!');
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Compliance Checker</h2>
        <button
          type="button"
          onClick={runComplianceCheck}
          disabled={isChecking}
          className="px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Run Check'}
        </button>
      </div>
      
      {lastChecked && (
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-500">
            Last checked: {lastChecked.toLocaleString()}
          </div>
          <div className="flex items-center">
            <div className="text-lg font-bold mr-2">{complianceScore}%</div>
            <div className="w-32 bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  complianceScore >= 90 
                    ? 'bg-green-600' 
                    : complianceScore >= 70 
                    ? 'bg-yellow-500' 
                    : 'bg-red-600'
                }`}
                style={{ width: `${complianceScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      {isChecking ? (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {issues.length > 0 ? (
            issues.map(issue => (
              <div 
                key={issue.id} 
                className={`p-4 rounded-md border ${issue.fixed ? 'bg-gray-50 opacity-60' : 'bg-white'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-1">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getSeverityClass(issue.severity)} mr-2`}>
                        {issue.severity.toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-900">{issue.section}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{issue.message}</p>
                    {issue.suggestion && (
                      <p className="text-xs text-gray-600 italic">Suggestion: {issue.suggestion}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleFixIssue(issue.id)}
                    disabled={issue.fixed}
                    className={`ml-4 px-2 py-1 text-xs font-medium rounded ${
                      issue.fixed
                        ? 'bg-green-100 text-green-800 cursor-default'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    {issue.fixed ? 'Fixed' : 'Fix Issue'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              No compliance issues found!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplianceChecker; 