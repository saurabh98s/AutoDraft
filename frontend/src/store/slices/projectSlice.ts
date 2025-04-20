import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  sections: ProjectSection[];
}

export interface ProjectSection {
  id: string;
  title: string;
  content: string;
  order: number;
  aiGenerated: boolean;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    fetchProjectsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProjectsSuccess: (state, action: PayloadAction<Project[]>) => {
      state.loading = false;
      state.projects = action.payload;
    },
    fetchProjectsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentProject: (state, action: PayloadAction<Project>) => {
      state.currentProject = action.payload;
    },
    updateProjectSection: (state, action: PayloadAction<{ projectId: string; section: ProjectSection }>) => {
      const { projectId, section } = action.payload;
      
      // Update in projects array
      const projectIndex = state.projects.findIndex(p => p.id === projectId);
      if (projectIndex !== -1) {
        const sectionIndex = state.projects[projectIndex].sections.findIndex(s => s.id === section.id);
        if (sectionIndex !== -1) {
          state.projects[projectIndex].sections[sectionIndex] = section;
        }
      }
      
      // Update in currentProject if it's the same project
      if (state.currentProject && state.currentProject.id === projectId) {
        const sectionIndex = state.currentProject.sections.findIndex(s => s.id === section.id);
        if (sectionIndex !== -1) {
          state.currentProject.sections[sectionIndex] = section;
        }
      }
    },
    addProjectSection: (state, action: PayloadAction<{ projectId: string; section: ProjectSection }>) => {
      const { projectId, section } = action.payload;
      
      // Add to projects array
      const projectIndex = state.projects.findIndex(p => p.id === projectId);
      if (projectIndex !== -1) {
        state.projects[projectIndex].sections.push(section);
      }
      
      // Add to currentProject if it's the same project
      if (state.currentProject && state.currentProject.id === projectId) {
        state.currentProject.sections.push(section);
      }
    },
    createProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
    },
  },
});

export const {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  setCurrentProject,
  updateProjectSection,
  addProjectSection,
  createProject,
} = projectSlice.actions;

export default projectSlice.reducer; 