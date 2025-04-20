import useSWR from 'swr';
import { User } from '../store/slices/authSlice';
import { Section, ComplianceMark } from '../store/slices/docSlice';
import { OrgContext } from '../store/slices/crmSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Error types for better error handling
interface ApiError extends Error {
  info?: any;
  status?: number;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.') as ApiError;
    // @ts-expect-error - Adding custom properties to Error
    error.info = await res.json();
    // @ts-expect-error - Adding custom properties to Error
    error.status = res.status;
    throw error;
  }
  
  return res.json();
};

// Auth API
export const useAuth = () => {
  return useSWR<User>(`${API_URL}/auth/me`, fetcher);
};

export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Login failed');
  }
  
  return res.json();
};

// Backend validation error type
interface ValidationError {
  loc: string[];
  msg: string;
  type: string;
}

export const register = async (name: string, email: string, password: string, orgName: string = '') => {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      username: name, 
      email, 
      password, 
      organization_name: orgName 
    }),
    credentials: 'include',
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    // Handle different error response formats
    let errorMessage = 'Registration failed';
    
    if (typeof errorData.detail === 'string') {
      errorMessage = errorData.detail;
    } else if (Array.isArray(errorData.detail)) {
      // Handle validation errors array
      errorMessage = errorData.detail.map((err: ValidationError) => 
        err.msg || JSON.stringify(err)
      ).join(', ');
    } else if (errorData.message) {
      errorMessage = errorData.message;
    }
    
    throw new Error(errorMessage);
  }
  
  return res.json();
};

export const refreshToken = async () => {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Token refresh failed');
  }
  
  return res.json();
};

// Document API
export const useDocument = (docId: string) => {
  return useSWR<{ sections: Section[]; layout: any[] }>(
    docId ? `${API_URL}/doc/${docId}` : null,
    fetcher
  );
};

export const saveDocument = async (docId: string, data: { sections: Section[]; layout: any[] }) => {
  const res = await fetch(`${API_URL}/doc/${docId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Failed to save document');
  }
  
  return res.json();
};

export const useComplianceCheck = (docId: string) => {
  return useSWR<ComplianceMark[]>(
    docId ? `${API_URL}/compliance/check/${docId}` : null,
    fetcher
  );
};

// AI API
export const useAIGeneration = (docId: string, sectionId: string) => {
  return useSWR<{ content: string }>(
    docId && sectionId ? `${API_URL}/agent/generate/${docId}/${sectionId}` : null,
    fetcher
  );
};

// CRM API
export const useOrgContext = (orgId: string) => {
  return useSWR<OrgContext>(
    orgId ? `${API_URL}/crm/org/${orgId}/context` : null,
    fetcher
  );
};

export const useAlignmentScore = (orgId: string, funderId: string) => {
  return useSWR<{ score: number }>(
    orgId && funderId ? `${API_URL}/align?org=${orgId}&funder=${funderId}` : null,
    fetcher
  );
};

// Export API
export const exportDocument = async (docId: string, format: 'pdf' | 'markdown') => {
  const res = await fetch(`${API_URL}/assemble/${docId}?format=${format}`, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Export failed');
  }
  
  return res.blob();
};

// Submission API
export const submitDocument = async (docId: string, funderApiCreds: { apiKey: string; apiSecret: string }) => {
  const res = await fetch(`${API_URL}/submission/${docId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(funderApiCreds),
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Submission failed');
  }
  
  return res.json();
};

// Audit API
export const useAuditDiff = (docId: string, v1: number, v2: number) => {
  return useSWR<{ diff: string }>(
    docId && v1 && v2 ? `${API_URL}/audit/${docId}/diff?v1=${v1}&v2=${v2}` : null,
    fetcher
  );
}; 