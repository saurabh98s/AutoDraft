import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AiDraft {
  id: string;
  projectId: string;
  sectionId: string;
  content: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

interface AiDraftState {
  drafts: AiDraft[];
  currentDraft: AiDraft | null;
  loading: boolean;
  error: string | null;
}

const initialState: AiDraftState = {
  drafts: [],
  currentDraft: null,
  loading: false,
  error: null,
};

const aiDraftSlice = createSlice({
  name: 'aiDraft',
  initialState,
  reducers: {
    generateDraftStart: (state, action: PayloadAction<{ projectId: string; sectionId: string }>) => {
      state.loading = true;
      state.error = null;
      
      // Create a pending draft
      const newDraft: AiDraft = {
        id: `temp-${Date.now()}`,
        projectId: action.payload.projectId,
        sectionId: action.payload.sectionId,
        content: '',
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
      
      state.drafts.push(newDraft);
      state.currentDraft = newDraft;
    },
    generateDraftSuccess: (state, action: PayloadAction<AiDraft>) => {
      state.loading = false;
      
      // Update the draft in the drafts array
      const index = state.drafts.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.drafts[index] = action.payload;
      }
      
      // Update currentDraft if it's the same draft
      if (state.currentDraft && state.currentDraft.id === action.payload.id) {
        state.currentDraft = action.payload;
      }
    },
    generateDraftFailure: (state, action: PayloadAction<{ draftId: string; error: string }>) => {
      state.loading = false;
      state.error = action.payload.error;
      
      // Update the draft status to failed
      const index = state.drafts.findIndex(d => d.id === action.payload.draftId);
      if (index !== -1) {
        state.drafts[index].status = 'failed';
        state.drafts[index].error = action.payload.error;
      }
      
      // Update currentDraft if it's the same draft
      if (state.currentDraft && state.currentDraft.id === action.payload.draftId) {
        state.currentDraft.status = 'failed';
        state.currentDraft.error = action.payload.error;
      }
    },
    setCurrentDraft: (state, action: PayloadAction<AiDraft>) => {
      state.currentDraft = action.payload;
    },
    clearCurrentDraft: (state) => {
      state.currentDraft = null;
    },
    applyDraftToSection: (state, action: PayloadAction<{ draftId: string; projectId: string; sectionId: string }>) => {
      // This action is handled by the projectSlice's updateProjectSection
      // We just clear the current draft after it's applied
      state.currentDraft = null;
    },
  },
});

export const {
  generateDraftStart,
  generateDraftSuccess,
  generateDraftFailure,
  setCurrentDraft,
  clearCurrentDraft,
  applyDraftToSection,
} = aiDraftSlice.actions;

export default aiDraftSlice.reducer; 