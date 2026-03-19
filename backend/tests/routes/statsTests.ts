// statsTests.ts
import * as express from 'express';
import * as request from 'supertest';
import statsRouter from '../../src/routes/stats';

// Mock repository modules so no DB connection is needed
jest.mock('../../src/repositories/events', () => ({
  getEventStats: jest.fn(),
}));
jest.mock('../../src/repositories/sources', () => ({
  getSources: jest.fn(),
}));

import { getEventStats } from '../../src/repositories/events';
import { getSources } from '../../src/repositories/sources';

const mockGetEventStats = getEventStats as jest.MockedFunction<typeof getEventStats>;
const mockGetSources = getSources as jest.MockedFunction<typeof getSources>;

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(statsRouter);
  return app;
}

function makeStatsBucket(overrides: Partial<{
  timestamp: Date; count: number; critical: number; warning: number; info: number;
}> = {}) {
  return {
    timestamp: new Date('2026-03-15T08:30:00.000Z'),
    count: 5,
    critical: 1,
    warning: 2,
    info: 2,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// GET /stats/timeline
// ---------------------------------------------------------------------------
describe('GET /stats/timeline', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with correctly formatted buckets for group_by=day', async () => {
    mockGetEventStats.mockResolvedValueOnce([
      makeStatsBucket({ timestamp: new Date('2026-03-15T00:00:00.000Z'), count: 10 }),
      makeStatsBucket({ timestamp: new Date('2026-03-14T00:00:00.000Z'), count: 7 }),
    ]);

    const res = await request(makeApp()).get('/stats/timeline?group_by=day');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { time: '2026-03-15', count: 10 },
      { time: '2026-03-14', count: 7 },
    ]);
  });

  it('formats time as YYYY-MM for group_by=month', async () => {
    mockGetEventStats.mockResolvedValueOnce([
      makeStatsBucket({ timestamp: new Date('2026-03-01T00:00:00.000Z'), count: 42 }),
    ]);

    const res = await request(makeApp()).get('/stats/timeline?group_by=month');

    expect(res.status).toBe(200);
    expect(res.body[0].time).toBe('2026-03');
  });

  it('formats time as YYYY-MM-DDTHH:mm for group_by=hour', async () => {
    mockGetEventStats.mockResolvedValueOnce([
      makeStatsBucket({ timestamp: new Date('2026-03-15T08:00:00.000Z'), count: 3 }),
    ]);

    const res = await request(makeApp()).get('/stats/timeline?group_by=hour');

    expect(res.status).toBe(200);
    expect(res.body[0].time).toBe('2026-03-15T08:00');
  });

  it('formats time as YYYY-MM-DDTHH:mm for group_by=minute', async () => {
    mockGetEventStats.mockResolvedValueOnce([
      makeStatsBucket({ timestamp: new Date('2026-03-15T08:30:00.000Z'), count: 1 }),
    ]);

    const res = await request(makeApp()).get('/stats/timeline?group_by=minute');

    expect(res.status).toBe(200);
    expect(res.body[0].time).toBe('2026-03-15T08:30');
  });

  it('returns 200 with an empty array when there are no buckets', async () => {
    mockGetEventStats.mockResolvedValueOnce([]);

    const res = await request(makeApp()).get('/stats/timeline?group_by=day');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 422 when group_by is missing', async () => {
    const res = await request(makeApp()).get('/stats/timeline');

    expect(res.status).toBe(422);
  });

  it('returns 422 when group_by has an invalid value', async () => {
    const res = await request(makeApp()).get('/stats/timeline?group_by=week');

    expect(res.status).toBe(422);
  });

  it('passes group_by to getEventStats', async () => {
    mockGetEventStats.mockResolvedValueOnce([]);

    await request(makeApp()).get('/stats/timeline?group_by=hour');

    expect(mockGetEventStats).toHaveBeenCalledWith(
      expect.objectContaining({ group_by: 'hour' }),
    );
  });
});

// ---------------------------------------------------------------------------
// GET /stats/source
// ---------------------------------------------------------------------------
describe('GET /stats/source', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with sources sorted by count descending', async () => {
    mockGetSources.mockResolvedValueOnce([
      {
        id: '1', name: 'auth-service', description: null,
        created_at: new Date(), last_used_at: null, is_active: true,
        stats: { total_events: 530, last_event_at: null, critical_count_24h: 0 },
      },
      {
        id: '2', name: 'web-app', description: null,
        created_at: new Date(), last_used_at: null, is_active: true,
        stats: { total_events: 1240, last_event_at: null, critical_count_24h: 0 },
      },
    ] as any);

    const res = await request(makeApp()).get('/stats/source');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { source: 'web-app', count: 1240 },
      { source: 'auth-service', count: 530 },
    ]);
  });

  it('returns 200 with an empty array when there are no sources', async () => {
    mockGetSources.mockResolvedValueOnce([]);

    const res = await request(makeApp()).get('/stats/source');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns sources with zero events', async () => {
    mockGetSources.mockResolvedValueOnce([
      {
        id: '1', name: 'idle-service', description: null,
        created_at: new Date(), last_used_at: null, is_active: true,
        stats: { total_events: 0, last_event_at: null, critical_count_24h: 0 },
      },
    ] as any);

    const res = await request(makeApp()).get('/stats/source');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ source: 'idle-service', count: 0 }]);
  });
});

// ---------------------------------------------------------------------------
// GET /stats/severity
// ---------------------------------------------------------------------------
describe('GET /stats/severity', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with aggregated severity counts', async () => {
    mockGetEventStats.mockResolvedValueOnce([
      makeStatsBucket({ critical: 5, warning: 10, info: 20, count: 35 }),
      makeStatsBucket({ critical: 3, warning: 2, info: 7, count: 12 }),
    ]);

    const res = await request(makeApp()).get('/stats/severity');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { severity: 'critical', count: 8 },
      { severity: 'warning', count: 12 },
      { severity: 'info', count: 27 },
    ]);
  });

  it('returns zeros when there are no events', async () => {
    mockGetEventStats.mockResolvedValueOnce([]);

    const res = await request(makeApp()).get('/stats/severity');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { severity: 'critical', count: 0 },
      { severity: 'warning', count: 0 },
      { severity: 'info', count: 0 },
    ]);
  });

  it('always returns all three severity levels in order: critical, warning, info', async () => {
    mockGetEventStats.mockResolvedValueOnce([
      makeStatsBucket({ critical: 1, warning: 0, info: 0 }),
    ]);

    const res = await request(makeApp()).get('/stats/severity');

    expect(res.status).toBe(200);
    expect(res.body.map((b: { severity: string }) => b.severity)).toEqual([
      'critical',
      'warning',
      'info',
    ]);
  });
});
