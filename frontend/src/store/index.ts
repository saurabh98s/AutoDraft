import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import docReducer from './slices/docSlice';
import aiReducer from './slices/aiSlice';
import crmReducer from './slices/crmSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doc: docReducer,
    ai: aiReducer,
    crm: crmReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 