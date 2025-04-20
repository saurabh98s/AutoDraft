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
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessExp: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; accessExp: number }>) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.accessExp = action.payload.accessExp;
      state.error = null;
      state.isAuthenticated = true;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.accessExp = null;
      state.isAuthenticated = false;
    },
    refreshToken: (state, action: PayloadAction<number>) => {
      state.accessExp = action.payload;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, refreshToken } = authSlice.actions;

export default authSlice.reducer;