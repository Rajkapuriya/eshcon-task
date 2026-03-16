import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type PublishStatus = 'idle' | 'analyzing' | 'publishing' | 'success' | 'error';

interface PublishState {
  status: PublishStatus;
  proposedVersion: string | null;
  changelog: string[];
  error: string | null;
}

const initialState: PublishState = {
  status: 'idle',
  proposedVersion: null,
  changelog: [],
  error: null,
};

export const publishSlice = createSlice({
  name: 'publish',
  initialState,
  reducers: {
    startPublishAnalysis: (state) => {
      state.status = 'analyzing';
      state.error = null;
    },
    setPublishAnalysisResult: (
      state,
      action: PayloadAction<{ version: string; changelog: string[] }>
    ) => {
      state.status = 'idle';
      state.proposedVersion = action.payload.version;
      state.changelog = action.payload.changelog;
    },
    startPublish: (state) => {
      state.status = 'publishing';
    },
    publishSuccess: (state) => {
      state.status = 'success';
    },
    publishError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
    },
    resetPublishState: () => initialState,
  },
});

export const {
  startPublishAnalysis,
  setPublishAnalysisResult,
  startPublish,
  publishSuccess,
  publishError,
  resetPublishState,
} = publishSlice.actions;
export default publishSlice.reducer;
