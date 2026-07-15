import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import type { Job } from './../src/jobs/jobs.types';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/jobs (GET)', () => {
    return request(app.getHttpServer()).get('/api/jobs').expect(200).expect([]);
  });

  it('gets and cancels a job by path parameter', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/jobs')
      .send({ urls: ['https://example.com'] })
      .expect(201);

    const createdJob = created.body as Job;
    const id = createdJob.id;

    const found = await request(app.getHttpServer())
      .get(`/api/jobs/${id}`)
      .expect(200);
    const urls = found.body as Job['urls'];

    expect(urls).toEqual([
      expect.objectContaining({
        url: 'https://example.com',
        status: 'pending',
      }),
    ]);

    const deleted = await request(app.getHttpServer())
      .delete(`/api/jobs/${id}`)
      .expect(200);
    const deletedJob = deleted.body as Job;

    expect(deletedJob).toEqual(
      expect.objectContaining({
        id,
        status: 'cancelled',
        urls: [expect.objectContaining({ status: 'cancelled' })],
      }),
    );
  });

  it('returns 404 for an unknown job', async () => {
    await request(app.getHttpServer()).get('/api/jobs/missing').expect(404);
    await request(app.getHttpServer()).delete('/api/jobs/missing').expect(404);
  });
});
