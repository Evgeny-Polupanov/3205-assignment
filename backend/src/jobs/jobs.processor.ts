import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TASKS_QUEUE } from './jobs.constants';
import type { TaskData } from './jobs.service';

@Processor(TASKS_QUEUE)
export class JobsProcessor extends WorkerHost {
  private readonly logger = new Logger(JobsProcessor.name);

  process(job: Job<TaskData>): Promise<void> {
    this.logger.log(`Processing job ${job.id}: ${job.data.message}`);
    return Promise.resolve();
  }
}
