// auth.test.ts
import { makeSourceAuth, adminAuth } from '../../../src/routes/middleware/auth';
import { Request, Response, NextFunction } from 'express';

// Helper to create mock req/res/next
function mockReq(overrides = {}): Partial<Request> {
  return { headers: {}, ...overrides };
}

function mockRes(): { status: jest.Mock; json: jest.Mock } & Partial<Response> {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res); // chainable: res.status(401).json(...)
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// Flush all pending microtasks/promises
const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

// --- adminAuth ---
describe('adminAuth', () => {
  it('returns 401 when no Authorization header', () => {
    const req = mockReq() as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    adminAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() with valid admin key', () => {
    const req = mockReq({ headers: { authorization: 'Bearer admin-dev-key' } }) as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    adminAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.isAdmin).toBe(true);
  });

  it('returns 401 with wrong admin key', () => {
    const req = mockReq({ headers: { authorization: 'Bearer wrong-key' } }) as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    adminAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

// --- makeSourceAuth ---
describe('makeSourceAuth', () => {
  it('returns 401 when no Authorization header', async () => {
    const repo = { getSourceByApiKey: jest.fn() };
    const middleware = makeSourceAuth(repo as any);
    const req = mockReq() as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(repo.getSourceByApiKey).not.toHaveBeenCalled();
  });

  it('returns 401 when API key not found', async () => {
    const repo = { getSourceByApiKey: jest.fn().mockResolvedValue(null) };
    const middleware = makeSourceAuth(repo as any);
    const req = mockReq({ headers: { authorization: 'Bearer bad-key' } }) as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches source and calls next() on valid key', async () => {
    const fakeSource = { id: '1', api_key: 'valid-key', name: 'Test' };
    const repo = { getSourceByApiKey: jest.fn().mockResolvedValue(fakeSource) };
    const middleware = makeSourceAuth(repo as any);
    const req = mockReq({ headers: { authorization: 'Bearer valid-key' } }) as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;

    middleware(req, res, next);
    await flushPromises();

    expect(req.source).toEqual(fakeSource);
    expect(next).toHaveBeenCalled();
  });
});