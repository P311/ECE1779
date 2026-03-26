import { Request, Response, NextFunction } from "express";
import type { SourcesRepository, EventsRepository } from "../../repositories/types";

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
}

/**
 * Auth for POST /events and POST /events/batch.
 * Validates that the Bearer token is a valid API key for the source_id in the request body.
 */
export function makeEventWriteAuth(sourcesRepo: SourcesRepository) {
  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = extractBearer(req);
    if (!token) {
      res.status(401).json({ error: { message: "Missing Authorization header" } });
      return;
    }

    try {
      const source = await sourcesRepo.getSourceByApiKey(token);
      if (!source) {
        res.status(401).json({ error: { message: "Invalid API key" } });
        return;
      }

      const bodySourceId: unknown = (req.body as Record<string, unknown>).source_id;
      if (source.id !== bodySourceId) {
        res.status(403).json({ error: { message: "API key does not match the source" } });
        return;
      }

      req.source = source;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Auth for DELETE /events/:id.
 * Fetches the event to determine its source, then validates the Bearer token
 * belongs to that source.
 */
export function makeEventDeleteAuth(
  sourcesRepo: SourcesRepository,
  eventsRepo: EventsRepository,
) {
  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = extractBearer(req);
    if (!token) {
      res.status(401).json({ error: { message: "Missing Authorization header" } });
      return;
    }

    try {
      const id = req.params["id"];
      if (!id || typeof id !== "string") {
        res.status(400).json({ error: { message: "Invalid event id" } });
        return;
      }
      const event = await eventsRepo.getEventById(id);
      if (!event) {
        res.status(404).json({ detail: `Event with id '${id}' not found.` });
        return;
      }

      const source = await sourcesRepo.getSourceByApiKey(token);
      if (!source) {
        res.status(401).json({ error: { message: "Invalid API key" } });
        return;
      }

      if (source.id !== event.source_id) {
        res.status(403).json({ error: { message: "API key does not match the source" } });
        return;
      }

      req.source = source;
      next();
    } catch (err) {
      next(err);
    }
  };
}
