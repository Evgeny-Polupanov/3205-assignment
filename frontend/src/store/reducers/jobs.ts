import type { Job, JobSummary } from '../../api';
import { createSlice } from '@reduxjs/toolkit';

interface State {
  jobs: JobSummary[];
  currentJob: Pick<Job, 'urls' | 'status'> | null;
}

const initialState: State = {
  jobs: [],
  currentJob: null,
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobs(state, action) {
      state.jobs = action.payload;
    },
    setCurrentJob(state, action) {
      state.currentJob = action.payload;
    },
    resetJobs() {
      return initialState;
    },
  },
});

export const { setJobs, setCurrentJob, resetJobs } = jobsSlice.actions;

export default jobsSlice.reducer;
