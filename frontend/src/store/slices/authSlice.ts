import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  orgId: string;
}

export interface AuthState {
  user: User | null;
  accessExp: number | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessExp: null,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; exp: number }>) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.accessExp = action.payload.exp;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessExp = null;
    },
    refreshToken: (state, action: PayloadAction<number>) => {
      state.accessExp = action.payload;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, refreshToken } = authSlice.actions;

export default authSlice.reducer; 