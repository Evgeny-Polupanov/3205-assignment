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
  urlsCount: number;
  urlsStats: [number, number];
  urls: JobURL[];
}

@Injectable()
export class JobsService {
  private store: Job[] = [];

  push(payload: Omit<Job, 'id'>) {
    const job = {
      ...payload,
      id: randomUUID(),
    };
    this.store.push(job);
  }

  getJobs(): Omit<Job, 'urls'>[] {
    return this.store.map((j) => ({
      id: j.id,
      createdAt: j.createdAt,
      status: j.status,
      urlsCount: j.urls.length,
      urlsStats: j.urlsStats,
    }));
  }

  getJobUrls(id: string): Job['urls'] | undefined {
    return this.store.find((job) => job.id === id)?.urls;
  }

  edit(id: string, payload: Partial<Job>) {
    this.store = this.store.map((job) =>
      job.id === id ? { ...job, ...payload } : job,
    );
  }

  delete(id: string) {
    this.store = this.store.map((job) => {
      const urls = job.urls.map((url) => ({
        ...url,
        status: url.status === 'pending' ? 'cancelled' : url.status,
      }));
      return job.id === id ? { ...job, urls, status: 'cancelled' } : job;
    });
  }
}
