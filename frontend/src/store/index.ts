import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import aiDraftReducer from './slices/aiDraftSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    aiDraft: aiDraftReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 