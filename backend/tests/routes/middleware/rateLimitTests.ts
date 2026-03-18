// rateLimitTests.ts
import { sourceRateLimit } from '../../../src/routes/middleware/rateLimit';
import { Request, Response, NextFunction } from 'express';
import { Source } from '../../../src/repositories/types';

function makeSource(api_key: string): Source {
  return {
    id: '1',
    name: 'Test Source',
    description: null,
    api_key,
    created_at: new Date(),
  };
}

function mockReq(source?: Source): Partial<Request> {
  return { source } as Partial<Request>;
}

function mockRes(): { status: jest.Mock; json: jest.Mock } & Partial<Response> {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('sourceRateLimit', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('calls next() immediately when no source is attached', () => {
    const req = mockReq() as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    sourceRateLimit(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next() for a request under the rate limit', () => {
    const req = mockReq(makeSource('key-under-limit')) as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    sourceRateLimit(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 429 with the correct error body when rate limit is exceeded', () => {
    const source = makeSource('key-over-limit');

    // Consume all 1000 allowed requests
    for (let i = 0; i < 1000; i++) {
      sourceRateLimit(
        mockReq(source) as Request,
        mockRes() as unknown as Response,
        jest.fn() as unknown as NextFunction,
      );
    }

    // The 1001st request should be blocked
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    sourceRateLimit(mockReq(source) as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Rate limit exceeded. Maximum 1000 requests per minute.',
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('allows requests again after the sliding window has passed', () => {
    const source = makeSource('key-window-reset');
    const baseTime = 1_000_000;
    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(baseTime);

    // Fill all 1000 slots at baseTime
    for (let i = 0; i < 1000; i++) {
      sourceRateLimit(
        mockReq(source) as Request,
        mockRes() as unknown as Response,
        jest.fn() as unknown as NextFunction,
      );
    }

    // Advance time beyond the 60-second window
    dateSpy.mockReturnValue(baseTime + 60 * 1000 + 1);

    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    sourceRateLimit(mockReq(source) as Request, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalledWith(429);
  });

  it('tracks rate limits independently per API key', () => {
    const sourceA = makeSource('key-independent-a');
    const sourceB = makeSource('key-independent-b');

    // Exhaust the limit for sourceA
    for (let i = 0; i < 1000; i++) {
      sourceRateLimit(
        mockReq(sourceA) as Request,
        mockRes() as unknown as Response,
        jest.fn() as unknown as NextFunction,
      );
    }

    // sourceB should still be allowed
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    sourceRateLimit(mockReq(sourceB) as Request, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('does not count requests outside the window toward the limit', () => {
    const source = makeSource('key-partial-window');
    const baseTime = 2_000_000;
    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(baseTime);

    // Make 500 requests at the start of the window
    for (let i = 0; i < 500; i++) {
      sourceRateLimit(
        mockReq(source) as Request,
        mockRes() as unknown as Response,
        jest.fn() as unknown as NextFunction,
      );
    }

    // Advance time so those 500 requests expire
    dateSpy.mockReturnValue(baseTime + 60 * 1000 + 1);

    // Make 999 more requests — should all be within limit
    for (let i = 0; i < 999; i++) {
      sourceRateLimit(
        mockReq(source) as Request,
        mockRes() as unknown as Response,
        jest.fn() as unknown as NextFunction,
      );
    }

    // The 1000th request in the new window should still pass
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    sourceRateLimit(mockReq(source) as Request, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalledWith(429);
  });
});
