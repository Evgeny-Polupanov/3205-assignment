import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Job } from './jobs.types';

@Injectable()
export class JobsService {
  private store: Job[] = [];

  push(payload: string[]): { jobId: string } {
    const job: Job = {
      id: randomUUID(),
      urls: payload.map((url) => ({
        url,
        status: 'pending',
        httpStatus: null,
        errorMessage: null,
        startTime: null,
        endTime: null,
        duration: null,
      })),
      createdAt: new Date(),
      status: 'pending',
      urlsCount: payload.length,
      urlsStats: [0, 0],
    };
    this.store.push(job);
    return { jobId: job.id };
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

  cancel(id: string): Job | undefined {
    const job = this.store.find((storedJob) => storedJob.id === id);
    if (!job) {
      return undefined;
    }

    job.urls = job.urls.map((url) => ({
      ...url,
      status: url.status === 'pending' ? 'cancelled' : url.status,
    }));
    job.status = 'cancelled';
    return job;
  }
}
