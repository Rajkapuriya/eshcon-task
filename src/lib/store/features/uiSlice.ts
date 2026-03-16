import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  selectedSectionId: string | null;
  isEditorSidebarOpen: boolean;
}

const initialState: UiState = {
  selectedSectionId: null,
  isEditorSidebarOpen: true,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    selectSection: (state, action: PayloadAction<string | null>) => {
      state.selectedSectionId = action.payload;
    },
    toggleSidebar: (state) => {
      state.isEditorSidebarOpen = !state.isEditorSidebarOpen;
    },
  },
});

export const { selectSection, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
