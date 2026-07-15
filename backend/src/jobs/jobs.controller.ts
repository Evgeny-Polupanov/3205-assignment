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

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  findAll(): Omit<Job, 'urls'>[] {
    return this.jobsService.getJobs();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Job['urls'] {
    const urls = this.jobsService.getJobUrls(id);
    if (!urls) {
      throw new NotFoundException(`Job ${id} not found`);
    }
    return urls;
  }

  @Delete(':id')
  remove(@Param('id') id: string): Job {
    const job = this.jobsService.delete(id);
    if (!job) {
      throw new NotFoundException(`Job ${id} not found`);
    }
    return job;
  }

  @Post()
  create(@Body() body: { urls: string[] }) {
    return this.jobsService.push(Array.from(new Set(body.urls)));
  }
}
