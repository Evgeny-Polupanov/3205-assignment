import { Injectable } from '@nestjs/common';
import { JobsService } from './jobs.service';
import type { JobURL } from './jobs.types';

@Injectable()
export class JobsProcessor {
  private readonly controllers = new Map<string, AbortController>();

  constructor(private readonly jobsService: JobsService) {}

  private randomDelay(maxMs = 10_000): number {
    return Math.floor(Math.random() * (maxMs + 1));
  }

  private delay(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(signal.reason);
        return;
      }

      const timeout = setTimeout(() => {
        signal.removeEventListener('abort', onAbort);
        resolve();
      }, ms);

      const onAbort = () => {
        clearTimeout(timeout);
        reject(signal.reason);
      };

      signal.addEventListener('abort', onAbort, {
        once: true,
      });
    });
  }

  private async processUrls(
    urls: JobURL[],
    signal: AbortSignal,
    concurrency = 5,
  ): Promise<JobURL[]> {
    const results = new Array<JobURL>(urls.length);
    const pending = urls.entries();

    const worker = async (): Promise<void> => {
      while (!signal.aborted) {
        const next = pending.next();

        if (next.done) {
          return;
        }

        const [index, item] = next.value;
        results[index] = await this.checkUrl(item.url, signal);
      }
    }

    const workerCount = Math.min(concurrency, urls.length);

    await Promise.all(
      Array.from({ length: workerCount }, () => worker()),
    )

    return results.filter(Boolean);
  }

  async process(id: string): Promise<void> {
    const urls = this.jobsService.getJobUrls(id);

    if (!urls) {
      return;
    }

    const controller = new AbortController();
    this.controllers.set(id, controller);

    this.jobsService.edit(id, { status: 'in_progress' });

    try {
      const results = await this.processUrls(urls, controller.signal);

      if (controller.signal.aborted) {
        return;
      }

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
      await this.delay(this.randomDelay(), cancellationSignal);

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
