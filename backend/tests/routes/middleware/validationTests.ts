// validationTests.ts
import {
  validateBody,
  validateQuery,
  postEventSchema,
  postSourceSchema,
  getEventsQuerySchema,
  getStatsQuerySchema,
  putAlertConfigSchema,
} from '../../../src/routes/middleware/validation';
import { Request, Response, NextFunction } from 'express';

function mockReq(overrides: Partial<Request> = {}): Request {
  return { body: {}, query: {}, ...overrides } as Request;
}

function mockRes(): { status: jest.Mock; json: jest.Mock } & Partial<Response> {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ---------------------------------------------------------------------------
// validateBody
// ---------------------------------------------------------------------------

describe('validateBody(postEventSchema)', () => {
  const middleware = validateBody(postEventSchema);
  const validSourceId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  it('calls next() and assigns parsed body for a valid event', () => {
    const req = mockReq({ body: { source_id: validSourceId, event_type: 'login', severity: 'info', payload: { ip: '1.2.3.4' } } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body).toMatchObject({ source_id: validSourceId, event_type: 'login', severity: 'info', payload: { ip: '1.2.3.4' } });
  });

  it('defaults payload to {} when payload is invalid', () => {
    const req = mockReq({ body: { source_id: validSourceId, event_type: 'login', severity: 'info', payload: 'bad' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.payload).toEqual({});
  });

  it('returns 422 when source_id is missing', () => {
    const req = mockReq({ body: { event_type: 'login', severity: 'info' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 when source_id is not a valid UUID', () => {
    const req = mockReq({ body: { source_id: 'not-a-uuid', event_type: 'login', severity: 'info' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 when event_type is missing', () => {
    const req = mockReq({ body: { source_id: validSourceId, severity: 'info' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ message: 'Validation failed' }) }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 when severity is an invalid enum value', () => {
    const req = mockReq({ body: { source_id: validSourceId, event_type: 'login', severity: 'verbose' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 when event_type exceeds 100 characters', () => {
    const req = mockReq({ body: { source_id: validSourceId, event_type: 'a'.repeat(101), severity: 'info' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 when event_type is an empty string', () => {
    const req = mockReq({ body: { source_id: validSourceId, event_type: '', severity: 'info' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('validateBody(postSourceSchema)', () => {
  const middleware = validateBody(postSourceSchema);

  it('calls next() for a valid source with description', () => {
    const req = mockReq({ body: { name: 'My Source', description: 'A description' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toMatchObject({ name: 'My Source', description: 'A description' });
  });

  it('returns 422 when description is missing', () => {
    const req = mockReq({ body: { name: 'My Source' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 when name is missing', () => {
    const req = mockReq({ body: {} });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 when name is an empty string', () => {
    const req = mockReq({ body: { name: '' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 when name exceeds 255 characters', () => {
    const req = mockReq({ body: { name: 'a'.repeat(256) } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// validateQuery
// ---------------------------------------------------------------------------

describe('validateQuery(getEventsQuerySchema)', () => {
  const middleware = validateQuery(getEventsQuerySchema);

  it('calls next() and attaches parsedQuery for valid query params', () => {
    const req = mockReq({ query: { page: '2' } as any });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((req as any).parsedQuery).toMatchObject({ page: 2 });
  });

  it('applies default page when omitted', () => {
    const req = mockReq({ query: {} as any });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((req as any).parsedQuery).toMatchObject({ page: 1 });
  });

  it('returns 422 when page is less than 1', () => {
    const req = mockReq({ query: { page: '0' } as any });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() when source_id is a plain string (substring filter)', () => {
    const req = mockReq({ query: { source_id: 'not-a-uuid' } as any });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next() when severity is any string (substring filter)', () => {
    const req = mockReq({ query: { severity: 'crit' } as any });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next() with id filter', () => {
    const req = mockReq({ query: { id: 'evt-0001' } as any });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next() with payload filter', () => {
    const req = mockReq({ query: { payload: 'Chrome' } as any });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next() with ingested_at filter', () => {
    const req = mockReq({ query: { ingested_at: '2026-03' } as any });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('validateQuery(getStatsQuerySchema)', () => {
  const middleware = validateQuery(getStatsQuerySchema);

  it.each(['minute', 'hour', 'day', 'month'])('calls next() for group_by "%s"', (group_by) => {
    const req = mockReq({ query: { group_by } as any });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((req as any).parsedQuery).toMatchObject({ group_by });
  });

  it('returns 422 when group_by is an invalid enum value', () => {
    const req = mockReq({ query: { group_by: 'week' } as any });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 when group_by is missing', () => {
    const req = mockReq({ query: {} as any });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// putAlertConfigSchema
// ---------------------------------------------------------------------------

describe('validateBody(putAlertConfigSchema)', () => {
  const middleware = validateBody(putAlertConfigSchema);

  it('calls next() for a valid alert config', () => {
    const req = mockReq({ body: { active: true, time_window_minutes: 60, event_threshold: 10, email: 'test@example.com' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 422 when active is missing', () => {
    const req = mockReq({ body: { time_window_minutes: 60, event_threshold: 10, email: 'test@example.com' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 when active is not a boolean', () => {
    const req = mockReq({ body: { active: 'yes', time_window_minutes: 60, event_threshold: 10, email: 'test@example.com' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 when time_window_minutes is missing', () => {
    const req = mockReq({ body: { active: true, event_threshold: 10, email: 'test@example.com' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 when time_window_minutes is not a positive integer', () => {
    const req = mockReq({ body: { active: true, time_window_minutes: 0, event_threshold: 10, email: 'test@example.com' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 when event_threshold is missing', () => {
    const req = mockReq({ body: { active: true, time_window_minutes: 60, email: 'test@example.com' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 when email is missing', () => {
    const req = mockReq({ body: { active: true, time_window_minutes: 60, event_threshold: 10 } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 when email is not a valid email address', () => {
    const req = mockReq({ body: { active: true, time_window_minutes: 60, event_threshold: 10, email: 'not-an-email' } });
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });
});
