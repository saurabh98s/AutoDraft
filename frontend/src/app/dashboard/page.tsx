"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// Importing editor components
import DocumentGenerator from "../../components/editor/DocumentGenerator";
import SectionNav from "../../components/editor/SectionNav";
import EditorCanvas from "../../components/editor/EditorCanvas";
// Importing assistant and compliance components
import GrantBot from "../../components/assistant/GrantBot";
import ComplianceChecker from "../../components/compliance/ComplianceChecker";
import { useDispatch } from "react-redux";
import { setDocId } from "../../store/slices/docSlice";
import ResearchAssistant from "../../components/research/ResearchAssistant";
import { toast } from "react-toastify";

interface Grant {
  id: string;
  title: string;
  funder: string;
  deadline: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  updatedAt: string;
}

interface Section {
  id: string;
  title: string;
  content: string;
}

// Load from localStorage or return empty
function loadGrants(): Grant[] {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem("mockGrants");
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error("Failed to parse localStorage grants", err);
    }
  }
  return [];
}

// Save to localStorage
function saveGrants(grants: Grant[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("mockGrants", JSON.stringify(grants));
  }
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // New state for editor integration
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [currentGrant, setCurrentGrant] = useState<Grant | null>(null);
  
  // Keeping these variables although currently unused by components after prop changes
  // This preserves the functionality for future development
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sections, setSections] = useState<Section[]>([
    { id: "abstract", title: "Abstract", content: "" },
    { id: "introduction", title: "Introduction", content: "" },
    { id: "methodology", title: "Methodology", content: "" },
    { id: "budget", title: "Budget", content: "" },
    { id: "timeline", title: "Timeline", content: "" },
  ]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeSection, setActiveSection] = useState<string | null>("abstract");
  const [showBot, setShowBot] = useState<boolean>(false);
  const [showCompliance, setShowCompliance] = useState<boolean>(false);
  const [showResearch, setShowResearch] = useState<boolean>(false);

  // Convert sections array to Record for components that need it
  const sectionsRecord = sections.reduce((acc, section) => {
    acc[section.id] = section;
    return acc;
  }, {} as Record<string, Section>);

  // Default layout configuration
  const defaultLayout = sections.map((section, index) => ({
    i: section.id,
    x: 0,
    y: index * 6,
    w: 12,
    h: 6,
    minW: 6,
    maxW: 12
  }));

  // Load grants on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/dashboard/summary');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setGrants(data.grants);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fall back to local storage if API fails
        const storedGrants = loadGrants();
        if (storedGrants.length === 0) {
          // Initialize with mock data if empty
          const mockGrants: Grant[] = [
            {
              id: "1",
              title: "Community Health Initiative",
              funder: "Gates Foundation",
              deadline: "2023-12-15",
              status: "draft",
              updatedAt: "2023-11-01T10:30:00Z",
            },
            {
              id: "2",
              title: "Educational Outreach Program",
              funder: "Department of Education",
              deadline: "2023-11-30",
              status: "submitted",
              updatedAt: "2023-10-15T14:22:00Z",
            },
            {
              id: "3",
              title: "Environmental Conservation Project",
              funder: "Sierra Club",
              deadline: "2024-01-15",
              status: "approved",
              updatedAt: "2023-09-20T09:15:00Z",
            },
            {
              id: "4",
              title: "Mental Health Awareness Campaign",
              funder: "National Health Institute",
              deadline: "2023-12-01",
              status: "rejected",
              updatedAt: "2023-10-25T11:45:00Z",
            },
          ];
          setGrants(mockGrants);
          saveGrants(mockGrants);
        } else {
          setGrants(storedGrants);
        }
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Set document ID when current grant changes
  useEffect(() => {
    if (currentGrant) {
      dispatch(setDocId(currentGrant.id));
    }
  }, [currentGrant, dispatch]);

  // Handle editing a grant
  const handleEditGrant = async (grant: Grant) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/grants/${grant.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch grant details');
      }
      
      const grantData = await response.json();
      setCurrentGrant(grant);
      setSections(Object.values(grantData.sections));
      
      // Convert the sections record to array format if needed
      const sectionsRecord = grantData.sections;
      
      // Set the active section to the first one
      if (Object.keys(sectionsRecord).length > 0) {
        setActiveSection(Object.keys(sectionsRecord)[0]);
      }
      
      setShowEditor(true);
    } catch (error) {
      console.error('Error fetching grant details:', error);
      // Fallback behavior - just show the editor without sections data
      setCurrentGrant(grant);
      setShowEditor(true);
    } finally {
      setLoading(false);
    }
  };

  // Toggle back to grant list
  const handleBackToList = () => {
    setShowEditor(false);
    setCurrentGrant(null);
  };

  // Toggle compliance checker
  const toggleCompliance = () => {
    setShowCompliance(!showCompliance);
  };

  // Toggle AI assistant
  const toggleBot = () => {
    setShowBot(!showBot);
  };

  // Toggle research assistant
  const toggleResearch = () => {
    setShowResearch(!showResearch);
  };

  // Close assistant drawer
  const handleCloseBot = () => {
    setShowBot(false);
  };

  // Helper for status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Update section content
  const handleSectionUpdate = async (sectionId: string, newContent: string) => {
    // First update the local state
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, content: newContent } 
        : section
    ));
    
    // Then send the update to the API
    if (currentGrant) {
      try {
        const response = await fetch(`http://localhost:8000/api/grants/${currentGrant.id}/sections/${sectionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: newContent }),
        });
        
        if (!response.ok) {
          console.error('Failed to update section on the server');
        }
      } catch (error) {
        console.error('Error updating section:', error);
      }
    }
  };

  // Handle section content generation from research assistant
  const handleSectionGenerated = (sectionType: string, content: string) => {
    // Find the section that matches the type
    const sectionToUpdate = sections.find(
      section => section.title.toLowerCase() === sectionType.toLowerCase()
    );
    
    if (sectionToUpdate) {
      // Update the section in our local state
      const updatedSections = sections.map(section => 
        section.id === sectionToUpdate.id 
          ? { ...section, content } 
          : section
      );
      setSections(updatedSections);
      
      // Also update the section via API if we have a current grant
      if (currentGrant) {
        handleSectionUpdate(sectionToUpdate.id, content);
      }
      
      toast.success(`${sectionType} section updated with AI-generated content`);
    } else {
      toast.error(`Could not find section: ${sectionType}`);
    }
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-600 transition ease-in-out duration-150">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)] overflow-hidden bg-gray-50">
      {!showEditor ? (
        // Grant List View with improved UI
        <>
          {/* Animated Background Blobs */}
          <div
            className="animated-blob w-[500px] h-[500px] left-[-200px] top-[100px]"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="animated-blob w-[600px] h-[600px] right-[-250px] top-[300px]"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="animated-blob w-[400px] h-[400px] left-[30%] bottom-[-100px]"
            style={{ animationDelay: "4s" }}
          ></div>

          {/* Header */}
          <header className="bg-white shadow z-10 relative">
            <div className="container mx-auto px-4 py-6 flex items-center justify-between">
              <h1
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
                          animate-gradient animate-fade-in"
              >
                AutoDraft
              </h1>
              <div className="flex items-center space-x-4">
                <button
                  className="text-gray-600 hover:text-gray-900 animate-slide-up"
                  style={{ animationDelay: "0.3s" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>
                <div
                  className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium
                            animate-slide-up"
                  style={{ animationDelay: "0.4s" }}
                >
                  US
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main
            className="pt-16 pb-16 px-4 md:pt-20 md:pb-24 relative animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="container mx-auto">
              <div className="text-center max-w-4xl mx-auto mb-10">
                <h2
                  className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600
                            bg-clip-text text-transparent animate-gradient animate-slide-up"
                >
                  My Grants
                </h2>
                <p
                  className="text-xl text-gray-600 mt-4 animate-slide-up"
                  style={{ animationDelay: "0.3s" }}
                >
                  Manage and track your grant proposals with ease.
                </p>
                <div className="mt-6 animate-slide-up" style={{ animationDelay: "0.5s" }}>
                  <Link
                    href="/grant/new"
                    className="inline-flex items-center justify-center
                              px-4 py-2 rounded-md text-white shadow
                              bg-[#5f58df] hover:bg-[#504eb3]
                              focus:outline-none focus:ring-2 focus:ring-offset-2
                              focus:ring-[#5f58df] transition-colors"
                  >
                    New Grant
                  </Link>
                </div>
              </div>

              {/* Grant List */}
              <div
                className="bg-white p-8 rounded-xl shadow-md border border-gray-100 animate-slide-up"
                style={{ animationDelay: "0.6s" }}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Funder
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deadline
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {grants.map((grant, i) => (
                        <tr
                          key={grant.id}
                          className="hover:bg-gray-50 transition hover-lift animate-slide-up"
                          style={{ animationDelay: `${0.7 + i * 0.05}s` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {grant.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {grant.funder}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(grant.deadline).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                grant.status
                              )}`}
                            >
                              {grant.status.charAt(0).toUpperCase() + grant.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(grant.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditGrant(grant)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Edit
                            </button>
                            <Link
                              href={`/grant/${grant.id}`}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stats Cards */}
              <div
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12 animate-slide-up"
                style={{ animationDelay: "0.8s" }}
              >
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover-scale">
                  <div className="flex items-center">
                    <div className="p-3 rounded-md bg-indigo-100 text-indigo-600 animate-pulse-gentle">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500">Total Grants</dt>
                        <dd className="text-xl font-semibold text-gray-900">{grants.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover-scale">
                  <div className="flex items-center">
                    <div className="p-3 rounded-md bg-yellow-100 text-yellow-600 animate-pulse-gentle">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500">Pending</dt>
                        <dd className="text-xl font-semibold text-gray-900">
                          {grants.filter(
                            (g) => g.status === "draft" || g.status === "submitted"
                          ).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover-scale">
                  <div className="flex items-center">
                    <div className="p-3 rounded-md bg-green-100 text-green-600 animate-pulse-gentle">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500">Approved</dt>
                        <dd className="text-xl font-semibold text-gray-900">
                          {grants.filter((g) => g.status === "approved").length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover-scale">
                  <div className="flex items-center">
                    <div className="p-3 rounded-md bg-red-100 text-red-600 animate-pulse-gentle">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500">Rejected</dt>
                        <dd className="text-xl font-semibold text-gray-900">
                          {grants.filter((g) => g.status === "rejected").length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </>
      ) : (
        // Editor View
        <div className="editor-container p-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleBackToList}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Grants
            </button>
            <div className="flex space-x-3">
              <button
                onClick={toggleBot}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showBot 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                AI Assistant
              </button>
              <button
                onClick={toggleCompliance}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showCompliance 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Compliance Check
              </button>
              <button
                onClick={toggleResearch}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showResearch 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Research
              </button>
              <button className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                Save Draft
              </button>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {currentGrant ? currentGrant.title : "New Grant Application"}
          </h1>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/4">
              <div className="bg-white rounded-lg shadow-md">
                <SectionNav sections={sectionsRecord} />
              </div>
            </div>
            
            <div className="w-full md:w-2/4">
              {activeSection && (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <EditorCanvas
                    sections={sectionsRecord}
                    layout={defaultLayout}
                    onContentChange={(sectionId, content) => handleSectionUpdate(sectionId, content)}
                  />
                </div>
              )}
            </div>
            
            <div className="w-full md:w-1/4">
              {showBot && <GrantBot isOpen={showBot} onClose={handleCloseBot} />}
              {showCompliance && (
                <div className="bg-white rounded-lg shadow-md">
                  <ComplianceChecker documentId={currentGrant?.id || "new-doc"} />
                </div>
              )}
              {showResearch && (
                <div className="bg-white rounded-lg shadow-md">
                  <ResearchAssistant 
                    grantId={currentGrant?.id || "new-doc"} 
                    onSectionGenerated={handleSectionGenerated}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8">
            <DocumentGenerator documentId={currentGrant?.id || "new-doc"} />
          </div>
        </div>
      )}
    </div>
  );
}
