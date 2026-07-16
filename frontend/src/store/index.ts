import { configureStore } from '@reduxjs/toolkit';
import { jobsApi } from '../api';
import jobsReducer from './reducers/jobs.ts';

export const store = configureStore({
  reducer: {
    [jobsApi.reducerPath]: jobsApi.reducer,
    jobs: jobsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(jobsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
