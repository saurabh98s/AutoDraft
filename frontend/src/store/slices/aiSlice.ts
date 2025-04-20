import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  toolCall?: {
    name: string;
    arguments: any;
  };
}

export interface AIDraft {
  sectionId: string;
  content: string;
  status: 'idle' | 'streaming' | 'done';
}

export interface AIState {
  messages: AIMessage[];
  drafts: Record<string, AIDraft>;
  isDrawerOpen: boolean;
  isStreaming: boolean;
  streamTarget: string | null;
  alignmentScore: number | null;
}

const initialState: AIState = {
  messages: [],
  drafts: {},
  isDrawerOpen: false,
  isStreaming: false,
  streamTarget: null,
  alignmentScore: null,
};

export const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<AIMessage>) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setDraft: (state, action: PayloadAction<AIDraft>) => {
      state.drafts[action.payload.sectionId] = action.payload;
    },
    updateDraftContent: (state, action: PayloadAction<{ sectionId: string; content: string }>) => {
      if (state.drafts[action.payload.sectionId]) {
        state.drafts[action.payload.sectionId].content = action.payload.content;
      }
    },
    updateDraftStatus: (state, action: PayloadAction<{ sectionId: string; status: 'idle' | 'streaming' | 'done' }>) => {
      if (state.drafts[action.payload.sectionId]) {
        state.drafts[action.payload.sectionId].status = action.payload.status;
      }
    },
    setIsDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isDrawerOpen = action.payload;
    },
    setIsStreaming: (state, action: PayloadAction<boolean>) => {
      state.isStreaming = action.payload;
    },
    setStreamTarget: (state, action: PayloadAction<string | null>) => {
      state.streamTarget = action.payload;
    },
    setAlignmentScore: (state, action: PayloadAction<number>) => {
      state.alignmentScore = action.payload;
    },
  },
});

export const {
  addMessage,
  clearMessages,
  setDraft,
  updateDraftContent,
  updateDraftStatus,
  setIsDrawerOpen,
  setIsStreaming,
  setStreamTarget,
  setAlignmentScore,
} = aiSlice.actions;

export default aiSlice.reducer; 