import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Job } from './jobs.types';

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
