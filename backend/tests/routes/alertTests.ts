// alertTests.ts
import * as express from 'express';
import * as request from 'supertest';
import { makeAlertRouter } from '../../src/routes/alert';
import { AlertRepository } from '../../src/repositories/types';

function makeRepo(overrides: Partial<AlertRepository> = {}): AlertRepository {
  return {
    getAlertConfig: jest.fn(),
    upsertAlertConfig: jest.fn(),
    ...overrides,
  };
}

function makeApp(repo: AlertRepository = makeRepo()) {
  const app = express();
  app.use(express.json());
  app.use(makeAlertRouter(repo));
  return app;
}

const defaultConfig = {
  active: false,
  time_window_minutes: 60,
  event_threshold: 100,
  email: '',
};

const validBody = {
  active: true,
  time_window_minutes: 30,
  event_threshold: 10,
  email: 'test@mail.utoronto.ca',
};

beforeEach(() => jest.clearAllMocks());

// ---------------------------------------------------------------------------
// GET /alert/config
// ---------------------------------------------------------------------------
describe('GET /alert/config', () => {
  it('returns 200 with the full config including email', async () => {
    const repo = makeRepo({ getAlertConfig: jest.fn().mockResolvedValueOnce(defaultConfig) });

    const res = await request(makeApp(repo)).get('/config');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(defaultConfig);
  });

  it('returns the updated config after it has been changed', async () => {
    const updated = { active: true, time_window_minutes: 30, event_threshold: 10, email: 'a@b.com' };
    const repo = makeRepo({ getAlertConfig: jest.fn().mockResolvedValueOnce(updated) });

    const res = await request(makeApp(repo)).get('/config');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updated);
  });

  it('propagates errors from the repository to the error handler', async () => {
    const repo = makeRepo({ getAlertConfig: jest.fn().mockRejectedValueOnce(new Error('DB error')) });

    const app = express();
    app.use(express.json());
    app.use(makeAlertRouter(repo));
    app.use((_err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      res.status(500).json({ detail: 'Internal server error' });
    });

    const res = await request(app).get('/config');

    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// PUT /alert/config
// ---------------------------------------------------------------------------
describe('PUT /alert/config', () => {
  it('returns 200 with config excluding email on success', async () => {
    const repo = makeRepo({ upsertAlertConfig: jest.fn().mockResolvedValueOnce({ ...validBody }) });

    const res = await request(makeApp(repo)).put('/config').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      active: true,
      time_window_minutes: 30,
      event_threshold: 10,
    });
    expect(res.body.email).toBeUndefined();
  });

  it('calls upsertAlertConfig with the full parsed body including email', async () => {
    const upsertAlertConfig = jest.fn().mockResolvedValueOnce({ ...validBody });
    const repo = makeRepo({ upsertAlertConfig });

    await request(makeApp(repo)).put('/config').send(validBody);

    expect(upsertAlertConfig).toHaveBeenCalledWith(validBody);
  });

  it('returns 200 when active is false', async () => {
    const payload = { ...validBody, active: false };
    const repo = makeRepo({ upsertAlertConfig: jest.fn().mockResolvedValueOnce(payload) });

    const res = await request(makeApp(repo)).put('/config').send(payload);

    expect(res.status).toBe(200);
    expect(res.body.active).toBe(false);
  });

  it('returns 422 when active is missing', async () => {
    const repo = makeRepo();
    const { active: _, ...body } = validBody;
    const res = await request(makeApp(repo)).put('/config').send(body);

    expect(res.status).toBe(422);
    expect(repo.upsertAlertConfig).not.toHaveBeenCalled();
  });

  it('returns 422 when time_window_minutes is missing', async () => {
    const repo = makeRepo();
    const { time_window_minutes: _, ...body } = validBody;
    const res = await request(makeApp(repo)).put('/config').send(body);

    expect(res.status).toBe(422);
    expect(repo.upsertAlertConfig).not.toHaveBeenCalled();
  });

  it('returns 422 when event_threshold is missing', async () => {
    const repo = makeRepo();
    const { event_threshold: _, ...body } = validBody;
    const res = await request(makeApp(repo)).put('/config').send(body);

    expect(res.status).toBe(422);
    expect(repo.upsertAlertConfig).not.toHaveBeenCalled();
  });

  it('returns 422 when email is missing', async () => {
    const repo = makeRepo();
    const { email: _, ...body } = validBody;
    const res = await request(makeApp(repo)).put('/config').send(body);

    expect(res.status).toBe(422);
    expect(repo.upsertAlertConfig).not.toHaveBeenCalled();
  });

  it('returns 422 when email is not a valid email address', async () => {
    const repo = makeRepo();
    const res = await request(makeApp(repo))
      .put('/config')
      .send({ ...validBody, email: 'not-an-email' });

    expect(res.status).toBe(422);
    expect(repo.upsertAlertConfig).not.toHaveBeenCalled();
  });

  it('returns 422 when time_window_minutes is zero', async () => {
    const repo = makeRepo();
    const res = await request(makeApp(repo))
      .put('/config')
      .send({ ...validBody, time_window_minutes: 0 });

    expect(res.status).toBe(422);
    expect(repo.upsertAlertConfig).not.toHaveBeenCalled();
  });

  it('returns 422 when event_threshold is negative', async () => {
    const repo = makeRepo();
    const res = await request(makeApp(repo))
      .put('/config')
      .send({ ...validBody, event_threshold: -5 });

    expect(res.status).toBe(422);
    expect(repo.upsertAlertConfig).not.toHaveBeenCalled();
  });

  it('returns 422 when active is not a boolean', async () => {
    const repo = makeRepo();
    const res = await request(makeApp(repo))
      .put('/config')
      .send({ ...validBody, active: 'yes' });

    expect(res.status).toBe(422);
    expect(repo.upsertAlertConfig).not.toHaveBeenCalled();
  });

  it('returns 422 when time_window_minutes is a float', async () => {
    const repo = makeRepo();
    const res = await request(makeApp(repo))
      .put('/config')
      .send({ ...validBody, time_window_minutes: 1.5 });

    expect(res.status).toBe(422);
    expect(repo.upsertAlertConfig).not.toHaveBeenCalled();
  });
});
