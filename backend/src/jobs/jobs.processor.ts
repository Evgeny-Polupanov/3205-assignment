import { Injectable } from '@nestjs/common';
import { JobsService } from './jobs.service';
import type { JobURL } from './jobs.types';

@Injectable()
export class JobsProcessor {
  private readonly controllers = new Map<string, AbortController>();

  constructor(private readonly jobsService: JobsService) {}

  async process(id: string): Promise<void> {
    const urls = this.jobsService.getJobUrls(id);

    if (!urls) {
      return;
    }

    const controller = new AbortController();
    this.controllers.set(id, controller);

    this.jobsService.edit(id, { status: 'in_progress' });

    try {
      const results = await Promise.all(
        urls.map(({ url }) => this.checkUrl(url, controller.signal)),
      );

      const successful = results.filter(
        ({ status }) => status === 'success',
      ).length;

      this.jobsService.edit(id, {
        urls: results,
        urlsStats: [successful, results.length - successful],
        status: successful === results.length ? 'completed' : 'failed',
      });
    } finally {
      if (this.controllers.get(id) === controller) {
        this.controllers.delete(id);
      }
    }
  }

  cancel(id: string): boolean {
    const controller = this.controllers.get(id);

    if (!controller) {
      return false;
    }

    controller.abort();
    this.controllers.delete(id);
    return true;
  }

  private async checkUrl(
    url: string,
    cancellationSignal: AbortSignal,
  ): Promise<JobURL> {
    const startTime = new Date();

    try {
      let response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: cancellationSignal,
      });

      if (response.status === 405) {
        response = await fetch(url, {
          method: 'GET',
          headers: { Range: 'bytes=0-0' },
          signal: cancellationSignal,
        });
      }

      const endTime = new Date();

      return {
        url,
        status: response.ok ? 'success' : 'error',
        httpStatus: response.status,
        errorMessage: response.ok ? null : response.statusText,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
      };
    } catch (error: unknown) {
      const endTime = new Date();
      const cancelled = cancellationSignal.aborted;

      return {
        url,
        status: cancelled ? 'cancelled' : 'error',
        httpStatus: null,
        errorMessage: cancelled
          ? null
          : error instanceof Error
            ? error.message
            : 'Unknown request error',
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
      };
    }
  }
}
