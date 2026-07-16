import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface JobUrl {
  url: string;
  status: 'pending' | 'in_progress' | 'success' | 'error' | 'cancelled';
  httpStatus: number | null;
  errorMessage: string | null;
  startTime: string | null;
  endTime: string | null;
  duration: number | null;
}

export interface JobSummary {
  id: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  urlsCount: number;
  urlsStats: [number, number];
}

export interface Job extends JobSummary {
  urls: JobUrl[];
}

export const jobsApi = createApi({
  reducerPath: 'jobsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/jobs' }),
  tagTypes: ['Jobs'],
  endpoints: (builder) => ({
    getJobs: builder.query<JobSummary[], void>({
      query: () => '',
      providesTags: (result) => result
        ? [
          ...result.map(({ id }) => ({
            type: 'Jobs' as const,
            id,
          })),
          { type: 'Jobs', id: 'LIST' },
        ]
        : [{ type: 'Jobs', id: 'LIST' }],
    }),
    getJob: builder.query<Pick<Job, 'urls' | 'status'>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Jobs', id }],
    }),
    createJob: builder.mutation<{ jobId: string }, { urls: string[] }>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Jobs', id: 'LIST' }],
    }),
    cancelJob: builder.mutation<Job, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Jobs', id },
        { type: 'Jobs', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetJobsQuery, useGetJobQuery, useCreateJobMutation, useCancelJobMutation } = jobsApi;
