export interface JobURL {
  url: string;
  status: 'pending' | 'in_progress' | 'success' | 'error' | 'cancelled';
  httpStatus: number | null;
  errorMessage: string | null;
  startTime: Date | null;
  endTime: Date | null;
  duration: number | null;
}

export interface Job {
  id: string;
  createdAt: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  urlsCount: number;
  urlsStats: [number, number];
  urls: JobURL[];
}
