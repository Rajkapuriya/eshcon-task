import { configureStore } from '@reduxjs/toolkit';
import draftPageReducer from './features/draftPageSlice';
import uiReducer from './features/uiSlice';
import publishReducer from './features/publishSlice';

export const store = configureStore({
  reducer: {
    draftPage: draftPageReducer,
    ui: uiReducer,
    publish: publishReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
