'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EditorCanvas from '../../../components/editor/EditorCanvas';
import SectionNav from '../../../components/editor/SectionNav';
import GrantBot from '../../../components/assistant/GrantBot';
import DocumentGenerator from '../../../components/editor/DocumentGenerator';
import ComplianceChecker from '../../../components/compliance/ComplianceChecker';
import { useAuth } from '../../../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { setDocId } from '../../../store/slices/docSlice';
import { setIsDrawerOpen } from '../../../store/slices/aiSlice';

// Mock data
const mockSections = {
  'section-1': {
    id: 'section-1',
    title: 'Executive Summary',
    content: 'This is the executive summary of our grant proposal.'
  },
  'section-2': {
    id: 'section-2',
    title: 'Organization Background',
    content: 'Information about our organization and its mission.'
  },
  'section-3': {
    id: 'section-3',
    title: 'Project Description',
    content: 'Detailed description of the project we are seeking funding for.'
  },
  'section-4': {
    id: 'section-4',
    title: 'Goals & Objectives',
    content: 'The specific goals and objectives of our project.'
  },
  'section-5': {
    id: 'section-5',
    title: 'Budget',
    content: 'Budget breakdown for the proposed project.'
  },
};

const mockLayout = [
  { i: 'section-1', x: 0, y: 0, w: 12, h: 6, minW: 6, maxW: 12 },
  { i: 'section-2', x: 0, y: 6, w: 12, h: 8, minW: 6, maxW: 12 },
  { i: 'section-3', x: 0, y: 14, w: 12, h: 10, minW: 6, maxW: 12 },
  { i: 'section-4', x: 0, y: 24, w: 12, h: 8, minW: 6, maxW: 12 },
  { i: 'section-5', x: 0, y: 32, w: 12, h: 8, minW: 6, maxW: 12 },
];

export default function GrantWorkspace() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [alignmentScore, setAlignmentScore] = useState(82);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'compliance', 'documents'
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const isAIDrawerOpen = useSelector((state: RootState) => state.ai.isDrawerOpen);

  useEffect(() => {
    // Set the document ID in Redux
    if (id) {
      dispatch(setDocId(id as string));
    }

    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Listen for online/offline status
    const handleOnline = () => setShowOfflineBanner(false);
    const handleOffline = () => setShowOfflineBanner(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [id, dispatch]);

  const toggleAIDrawer = () => {
    dispatch(setIsDrawerOpen(!isAIDrawerOpen));
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-600 transition ease-in-out duration-150">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading Grant Workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Offline Banner */}
      {showOfflineBanner && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-2 text-center z-50">
          You're offline – edits will sync automatically when you reconnect.
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AutoDraft
          </h1>
        </div>

        {/* Section Navigator */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Document Sections
          </h2>
          <SectionNav sections={mockSections} />
        </div>

        {/* Alignment Gauge */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Alignment Score</h3>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  {alignmentScore}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div
                style={{ width: `${alignmentScore}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button className="p-2 rounded hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                </svg>
              </button>
              <button className="p-2 rounded hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" />
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button className="p-2 rounded hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <button className="p-2 rounded hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('editor')}
              className={`py-3 px-6 text-sm font-medium ${
                activeTab === 'editor'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`py-3 px-6 text-sm font-medium ${
                activeTab === 'compliance'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Compliance
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-3 px-6 text-sm font-medium ${
                activeTab === 'documents'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documents
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'editor' && (
            <EditorCanvas sections={mockSections} layout={mockLayout} />
          )}
          
          {activeTab === 'compliance' && (
            <ComplianceChecker documentId={id as string} />
          )}
          
          {activeTab === 'documents' && (
            <DocumentGenerator documentId={id as string} />
          )}
        </div>
      </div>

      {/* AI Assistant Drawer */}
      <GrantBot isOpen={isAIDrawerOpen} onClose={() => dispatch(setIsDrawerOpen(false))} />

      {/* AI Assistant FAB */}
      <button
        onClick={toggleAIDrawer}
        className="fixed right-6 bottom-6 p-4 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </button>
    </div>
  );
} 