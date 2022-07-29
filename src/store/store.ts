import { configureStore } from '@reduxjs/toolkit';
import dashboardSlice from './slices/dashboardSlice';
import mainSlice from './slices/mainSlice';

const store = configureStore({
  reducer: {
    main: mainSlice.reducer,
    dashboard: dashboardSlice.reducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;