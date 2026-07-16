import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import type { Job } from './jobs.types';
import { JobsProcessor } from './jobs.processor';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly jobsProcessor: JobsProcessor,
  ) {}

  @Get()
  findAll(): Omit<Job, 'urls'>[] {
    return this.jobsService.getJobs();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Pick<Job, 'urls' | 'status'> {
    const jobData = this.jobsService.getJob(id);
    if (!jobData) {
      throw new NotFoundException(`Job ${id} not found`);
    }
    return jobData;
  }

  @Delete(':id')
  remove(@Param('id') id: string): Job {
    this.jobsProcessor.cancel(id);

    const job = this.jobsService.cancel(id);
    if (!job) {
      throw new NotFoundException(`Job ${id} not found`);
    }
    return job;
  }

  @Post()
  create(@Body() body: { urls: string[] }) {
    const job = this.jobsService.push(Array.from(new Set(body.urls)));

    void this.jobsProcessor.process(job.jobId).catch(() => {
      this.jobsService.edit(job.jobId, { status: 'failed' });
    });

    return job;
  }
}
