import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { TASKS_QUEUE } from './jobs.constants';

export interface TaskData {
  message: string;
}

@Injectable()
export class JobsService {
  constructor(@InjectQueue(TASKS_QUEUE) private readonly queue: Queue) {}

  async enqueue(data: TaskData) {
    const job = await this.queue.add('example', data);
    return { id: job.id, name: job.name };
  }
}
