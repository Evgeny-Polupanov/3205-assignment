import { Body, Controller, Post } from '@nestjs/common';
import { JobsService } from './jobs.service';
import type { TaskData } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  enqueue(@Body() data: TaskData) {
    return this.jobsService.enqueue(data);
  }
}
