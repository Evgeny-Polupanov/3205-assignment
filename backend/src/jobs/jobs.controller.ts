import { Controller, Delete, Get } from '@nestjs/common';
import { JobsService } from './jobs.service';
import type { Job } from './jobs.types';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  findAll(): Omit<Job, 'urls'>[] {
    return this.jobsService.getJobs();
  }

  @Get(':id')
  findOne(id: string): Job['urls'] | undefined {
    return this.jobsService.getJobUrls(id);
  }

  @Delete(':id')
  remove(id: string) {
    return this.jobsService.delete(id);
  }
}
