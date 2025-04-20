/**
 * API configuration for the application
 * 
 * This file contains the base URLs and endpoints for the APIs used in the application.
 * It centralizes the API URLs to make them easier to manage and change.
 */

// Determine the base URL for the backend API based on the environment
// Default to localhost for local development
const getBaseUrl = (): string => {
  // Check if we're in a production environment
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Default to localhost:8000 for development
  return 'http://localhost:8000';
};

export const API_BASE_URL = getBaseUrl();

// Endpoints
export const ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/health`,
  AGENT_RUN: `${API_BASE_URL}/api/agent/run`,
  // Add other endpoints as needed
};

// Common request options
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

/**
 * Helper function to build API URLs with query parameters
 */
export const buildUrl = (
  endpoint: string, 
  params: Record<string, string | number | boolean | undefined>
): string => {
  const url = new URL(endpoint);
  
  // Add all non-undefined parameters to the URL
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.toString();
}; 