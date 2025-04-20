import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Section {
  id: string;
  title: string;
  content: string;
}

export interface Layout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
}

export interface ComplianceMark {
  sectionId: string;
  start: number;
  end: number;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface Deadline {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

export interface DocState {
  docId: string | null;
  sections: Record<string, Section>;
  layout: Layout[];
  activeSectionId: string | null;
  complianceMarks: ComplianceMark[];
  deadlines: Deadline[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DocState = {
  docId: null,
  sections: {},
  layout: [],
  activeSectionId: null,
  complianceMarks: [],
  deadlines: [],
  isLoading: false,
  error: null,
};

export const docSlice = createSlice({
  name: 'doc',
  initialState,
  reducers: {
    setDocId: (state, action: PayloadAction<string>) => {
      state.docId = action.payload;
    },
    setSections: (state, action: PayloadAction<Record<string, Section>>) => {
      state.sections = action.payload;
    },
    updateSection: (state, action: PayloadAction<Section>) => {
      const { id } = action.payload;
      state.sections[id] = action.payload;
    },
    setLayout: (state, action: PayloadAction<Layout[]>) => {
      state.layout = action.payload;
    },
    setActiveSection: (state, action: PayloadAction<string>) => {
      state.activeSectionId = action.payload;
    },
    setComplianceMarks: (state, action: PayloadAction<ComplianceMark[]>) => {
      state.complianceMarks = action.payload;
    },
    setDeadlines: (state, action: PayloadAction<Deadline[]>) => {
      state.deadlines = action.payload;
    },
    updateDeadline: (state, action: PayloadAction<{ id: string; completed: boolean }>) => {
      const index = state.deadlines.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.deadlines[index].completed = action.payload.completed;
      }
    },
  },
});

export const {
  setDocId,
  setSections,
  updateSection,
  setLayout,
  setActiveSection,
  setComplianceMarks,
  setDeadlines,
  updateDeadline,
} = docSlice.actions;

export default docSlice.reducer; 