import { makeEventWriteAuth, makeEventDeleteAuth } from "../../../src/routes/middleware/auth";
import { Request, Response, NextFunction } from "express";

function mockRes(): { status: jest.Mock; json: jest.Mock } & Partial<Response> {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const FAKE_SOURCE = { id: "src-1", name: "Test", description: null, created_at: new Date(), last_used_at: null, is_active: true };

function makeSourcesRepo(source: typeof FAKE_SOURCE | null = FAKE_SOURCE) {
  return { getSourceByApiKey: jest.fn().mockResolvedValue(source), createSource: jest.fn(), getSources: jest.fn(), getSourceById: jest.fn() };
}

function makeEventsRepo(event: { id: string; source_id: string } | null = { id: "evt-1", source_id: "src-1" }) {
  return { getEventById: jest.fn().mockResolvedValue(event), insertEvent: jest.fn(), insertEventsBatch: jest.fn(), queryEvents: jest.fn(), countEventsWithinMinutes: jest.fn(), getEventStats: jest.fn(), deleteEvent: jest.fn() };
}

// ─── makeEventWriteAuth ───────────────────────────────────────────────────────

describe("makeEventWriteAuth", () => {
  it("returns 401 when no Authorization header", async () => {
    const mw = makeEventWriteAuth(makeSourcesRepo() as any);
    const req = { headers: {}, body: { source_id: "src-1" } } as unknown as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    mw(req, res, next);
    await flushPromises();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when API key is invalid", async () => {
    const repo = makeSourcesRepo(null);
    const mw = makeEventWriteAuth(repo as any);
    const req = { headers: { authorization: "Bearer bad-key" }, body: { source_id: "src-1" } } as unknown as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    mw(req, res, next);
    await flushPromises();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when key belongs to a different source", async () => {
    const mw = makeEventWriteAuth(makeSourcesRepo() as any); // source.id = "src-1"
    const req = { headers: { authorization: "Bearer valid-key" }, body: { source_id: "src-DIFFERENT" } } as unknown as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    mw(req, res, next);
    await flushPromises();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() and attaches source when key matches source_id", async () => {
    const mw = makeEventWriteAuth(makeSourcesRepo() as any);
    const req = { headers: { authorization: "Bearer valid-key" }, body: { source_id: "src-1" } } as unknown as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    mw(req, res, next);
    await flushPromises();
    expect(next).toHaveBeenCalled();
    expect((req as any).source).toEqual(FAKE_SOURCE);
  });
});

// ─── makeEventDeleteAuth ──────────────────────────────────────────────────────

describe("makeEventDeleteAuth", () => {
  it("returns 401 when no Authorization header", async () => {
    const mw = makeEventDeleteAuth(makeSourcesRepo() as any, makeEventsRepo() as any);
    const req = { headers: {}, params: { id: "evt-1" } } as unknown as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    mw(req, res, next);
    await flushPromises();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 404 when event does not exist", async () => {
    const mw = makeEventDeleteAuth(makeSourcesRepo() as any, makeEventsRepo(null) as any);
    const req = { headers: { authorization: "Bearer valid-key" }, params: { id: "no-such-event" } } as unknown as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    mw(req, res, next);
    await flushPromises();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when API key is invalid", async () => {
    const mw = makeEventDeleteAuth(makeSourcesRepo(null) as any, makeEventsRepo() as any);
    const req = { headers: { authorization: "Bearer bad-key" }, params: { id: "evt-1" } } as unknown as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    mw(req, res, next);
    await flushPromises();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when key belongs to a different source than the event", async () => {
    const otherSource = { ...FAKE_SOURCE, id: "src-OTHER" };
    const mw = makeEventDeleteAuth(makeSourcesRepo(otherSource) as any, makeEventsRepo() as any); // event.source_id = "src-1"
    const req = { headers: { authorization: "Bearer valid-key" }, params: { id: "evt-1" } } as unknown as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    mw(req, res, next);
    await flushPromises();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() and attaches source when key matches event's source", async () => {
    const mw = makeEventDeleteAuth(makeSourcesRepo() as any, makeEventsRepo() as any);
    const req = { headers: { authorization: "Bearer valid-key" }, params: { id: "evt-1" } } as unknown as Request;
    const res = mockRes() as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    mw(req, res, next);
    await flushPromises();
    expect(next).toHaveBeenCalled();
    expect((req as any).source).toEqual(FAKE_SOURCE);
  });
});
