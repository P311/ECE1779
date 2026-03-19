// alertTests.ts
import * as express from 'express';
import * as request from 'supertest';
import alertRouter, { alertConfig } from '../../src/routes/alert';

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(alertRouter);
  return app;
}

const validBody = {
  active: true,
  time_window_minutes: 30,
  event_threshold: 10,
  email: 'test@mail.utoronto.ca',
};

describe('PUT /alert/config', () => {
  it('returns 200 with config (excluding email) for a valid body', async () => {
    const res = await request(makeApp()).put('/alert/config').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      active: true,
      time_window_minutes: 30,
      event_threshold: 10,
    });
    expect(res.body.email).toBeUndefined();
  });

  it('updates the exported alertConfig after a successful PUT', async () => {
    const payload = { ...validBody, event_threshold: 99, time_window_minutes: 60 };
    await request(makeApp()).put('/alert/config').send(payload);

    expect(alertConfig.active).toBe(true);
    expect(alertConfig.event_threshold).toBe(99);
    expect(alertConfig.time_window_minutes).toBe(60);
    expect(alertConfig.email).toBe(validBody.email);
  });

  it('returns 200 when active is false', async () => {
    const res = await request(makeApp())
      .put('/alert/config')
      .send({ ...validBody, active: false });

    expect(res.status).toBe(200);
    expect(res.body.active).toBe(false);
  });

  it('returns 422 when active is missing', async () => {
    const { active: _, ...body } = validBody;
    const res = await request(makeApp()).put('/alert/config').send(body);

    expect(res.status).toBe(422);
  });

  it('returns 422 when time_window_minutes is missing', async () => {
    const { time_window_minutes: _, ...body } = validBody;
    const res = await request(makeApp()).put('/alert/config').send(body);

    expect(res.status).toBe(422);
  });

  it('returns 422 when event_threshold is missing', async () => {
    const { event_threshold: _, ...body } = validBody;
    const res = await request(makeApp()).put('/alert/config').send(body);

    expect(res.status).toBe(422);
  });

  it('returns 422 when email is missing', async () => {
    const { email: _, ...body } = validBody;
    const res = await request(makeApp()).put('/alert/config').send(body);

    expect(res.status).toBe(422);
  });

  it('returns 422 when email is not a valid email address', async () => {
    const res = await request(makeApp())
      .put('/alert/config')
      .send({ ...validBody, email: 'not-an-email' });

    expect(res.status).toBe(422);
  });

  it('returns 422 when time_window_minutes is zero', async () => {
    const res = await request(makeApp())
      .put('/alert/config')
      .send({ ...validBody, time_window_minutes: 0 });

    expect(res.status).toBe(422);
  });

  it('returns 422 when event_threshold is negative', async () => {
    const res = await request(makeApp())
      .put('/alert/config')
      .send({ ...validBody, event_threshold: -5 });

    expect(res.status).toBe(422);
  });

  it('returns 422 when active is not a boolean', async () => {
    const res = await request(makeApp())
      .put('/alert/config')
      .send({ ...validBody, active: 'yes' });

    expect(res.status).toBe(422);
  });

  it('returns 422 when time_window_minutes is a float', async () => {
    const res = await request(makeApp())
      .put('/alert/config')
      .send({ ...validBody, time_window_minutes: 1.5 });

    expect(res.status).toBe(422);
  });
});
