import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

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
  count: number;
  stats: [number, number];
  urls: JobURL[];
}

@Injectable()
export class DataStoreService {
  private store: Job[] = [];

  push(payload: Omit<Job, 'id'>) {
    const job = {
      ...payload,
      id: randomUUID(),
    };
    this.store.push(job);
  }

  edit(id: string, payload: Partial<Job>) {
    this.store = this.store.map((job) =>
      job.id === id ? { ...job, ...payload } : job,
    );
  }

  delete(id: string) {
    this.store = this.store.map((job) =>
      job.id === id ? { ...job, status: 'cancelled' } : job,
    );
  }
}
