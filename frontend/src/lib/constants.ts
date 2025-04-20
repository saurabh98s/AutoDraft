export const APP_NAME = 'AutoDraft';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const;

export const COMPLIANCE_SEVERITY = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
} as const;

export const COMPLIANCE_THRESHOLD = 2; // Show toast for severity >= 2

export const AUTOSAVE_INTERVAL = 30000; // 30 seconds

export const OFFLINE_SYNC_THRESHOLD = 5 * 60 * 1000; // 5 minutes

export const MAX_SECTION_COUNT = 20;

export const DEFAULT_LAYOUT = {
  x: 0,
  y: 0,
  w: 12,
  h: 4,
  minW: 3,
  minH: 2,
  maxW: 12,
  maxH: 8,
};

export const TOOL_CALL_EMOJIS = {
  vector_search: '🔍',
  crm_fetch: '📊',
  compliance_check: '🛡️',
  document_export: '📄',
  blockchain_submit: '⛓️',
} as const; 