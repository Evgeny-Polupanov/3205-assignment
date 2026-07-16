import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsProcessor } from './jobs.processor';

@Module({
  controllers: [JobsController],
  providers: [JobsService, JobsProcessor],
})
export class JobsModule {}
