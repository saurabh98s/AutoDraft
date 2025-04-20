import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DonationData {
  date: string;
  amount: number;
}

export interface OutcomeData {
  date: string;
  value: number;
  target: number;
}

export interface OrgContext {
  id: string;
  name: string;
  mission: string;
  donations: DonationData[];
  outcomes: OutcomeData[];
}

export interface CRMState {
  orgContext: OrgContext | null;
  lastSync: number | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CRMState = {
  orgContext: null,
  lastSync: null,
  isLoading: false,
  error: null,
};

export const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSuccess: (state, action: PayloadAction<OrgContext>) => {
      state.isLoading = false;
      state.orgContext = action.payload;
      state.lastSync = Date.now();
      state.error = null;
    },
    fetchFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearContext: (state) => {
      state.orgContext = null;
      state.lastSync = null;
    },
  },
});

export const { fetchStart, fetchSuccess, fetchFailure, clearContext } = crmSlice.actions;

export default crmSlice.reducer; 