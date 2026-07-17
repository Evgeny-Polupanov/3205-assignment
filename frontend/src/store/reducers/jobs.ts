import type { JobSummary } from '../../api';
import { createSlice } from '@reduxjs/toolkit';

interface State {
  jobs: JobSummary[];
  currentJobId: string | null;
}

const initialState: State = {
  jobs: [],
  currentJobId: null,
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobs(state, action) {
      state.jobs = action.payload;
    },
    setCurrentJobId(state, action) {
      state.currentJobId = action.payload;
    },
    resetJobs() {
      return initialState;
    },
  },
});

export const { setJobs, setCurrentJobId, resetJobs } = jobsSlice.actions;

export default jobsSlice.reducer;
