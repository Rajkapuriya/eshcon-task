import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Page, Section } from '@/lib/schema/page';

interface DraftPageState {
  page: Page | null;
  hasUnsavedChanges: boolean;
}

const initialState: DraftPageState = {
  page: null,
  hasUnsavedChanges: false,
};

export const draftPageSlice = createSlice({
  name: 'draftPage',
  initialState,
  reducers: {
    setDraftPage: (state, action: PayloadAction<Page>) => {
      state.page = action.payload;
      state.hasUnsavedChanges = false;
    },
    updateSectionProps: (
      state,
      action: PayloadAction<{ sectionId: string; props: Record<string, unknown> }>
    ) => {
      if (!state.page) return;
      const section = state.page.sections.find((s) => s.id === action.payload.sectionId);
      if (section) {
        section.props = { ...section.props, ...action.payload.props };
        state.hasUnsavedChanges = true;
      }
    },
    reorderSections: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) => {
      if (!state.page) return;
      const { fromIndex, toIndex } = action.payload;
      const sections = [...state.page.sections];
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      state.page.sections = sections;
      state.hasUnsavedChanges = true;
    },
    addSection: (state, action: PayloadAction<{ index: number; section: Section }>) => {
      if (!state.page) return;
      state.page.sections.splice(action.payload.index, 0, action.payload.section);
      state.hasUnsavedChanges = true;
    },
    removeSection: (state, action: PayloadAction<string>) => {
      if (!state.page) return;
      state.page.sections = state.page.sections.filter((s) => s.id !== action.payload);
      state.hasUnsavedChanges = true;
    },
  },
});

export const { setDraftPage, updateSectionProps, reorderSections, addSection, removeSection } = draftPageSlice.actions;
export default draftPageSlice.reducer;
