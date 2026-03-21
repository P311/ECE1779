import { Router, Request, Response, NextFunction } from "express";
import {
  validateBody,
  validateQuery,
  postEventSchema,
  getEventsQuerySchema,
} from "./middleware/validation";
import { z } from "zod";
import type {
  EventsRepository,
  AlertRepository,
  BatchEventInput,
  EventFilters,
  PaginationParams,
} from "../repositories/types";

export function makeEventsRouter(
  eventsRepo: EventsRepository,
  alertRepo?: AlertRepository,
  notifier?: {
    send: (to: string, subject: string, text: string) => Promise<void>;
  },
): Router {
  const router = Router();

  const postBatchSchema = z.object({
    source_id: z.uuid(),
    events: z.array(postEventSchema.omit({ source_id: true })).max(100),
  });

  // POST /events - ingest single event
  router.post(
    "/",
    validateBody(postEventSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { source_id, event_type, severity, payload } = req.body as {
          source_id: string;
          event_type: string;
          severity: "info" | "warning" | "critical";
          payload?: Record<string, unknown>;
        };

        const event = await eventsRepo.insertEvent(
          source_id,
          event_type,
          severity,
          payload ?? {},
        );

        if (alertRepo && notifier) {
          const config = await alertRepo.getAlertConfig();
          if (config.active && config.email.trim() !== "") {
            const count = await eventsRepo.countEventsWithinMinutes(
              config.time_window_minutes,
            );

            if (count > config.event_threshold) {
              try {
                await notifier.send(
                  config.email,
                  "Alert: Event threshold exceeded",
                  `Event threshold exceeded: ${count} events in the last ${config.time_window_minutes} minutes.`,
                );
              } catch {
                // swallow notifier errors; don't fail the request
              }
            }
          }
        }

        res.status(201).json(event);
      } catch (err) {
        next(err);
      }
    },
  );

  // POST /events/batch - ingest up to 100 events
  router.post(
    "/batch",
    validateBody(postBatchSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { source_id, events } = req.body as { source_id: string; events: BatchEventInput[] };
        const inserted = await eventsRepo.insertEventsBatch(source_id, events);

        if (alertRepo && notifier) {
          const config = await alertRepo.getAlertConfig();
          if (config.active && config.email.trim() !== "") {
            const count = await eventsRepo.countEventsWithinMinutes(
              config.time_window_minutes,
            );

            if (count > config.event_threshold) {
              try {
                await notifier.send(
                  config.email,
                  "Alert: Event threshold exceeded",
                  `Event threshold exceeded: ${count} events in the last ${config.time_window_minutes} minutes.`,
                );
              } catch {
                // swallow notifier errors; don't fail the request
              }
            }
          }
        }

        res.status(201).json({ inserted: inserted.length });
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /events - query events with filters
  router.get(
    "/",
    validateQuery(getEventsQuerySchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const parsed = (
          req as Request & {
            parsedQuery: {
              page: number;
              id?: string;
              source_id?: string;
              event_type?: string;
              severity?: string;
              payload?: string;
              ingested_at?: string;
            };
          }
        ).parsedQuery;

        const filters: EventFilters = {};

        if (parsed.id !== undefined) {
          filters.id = parsed.id;
        }
        if (parsed.source_id !== undefined) {
          filters.source_id = parsed.source_id;
        }
        if (parsed.event_type !== undefined) {
          filters.event_type = parsed.event_type;
        }
        if (parsed.severity !== undefined) {
          filters.severity = parsed.severity;
        }
        if (parsed.payload !== undefined) {
          filters.payload = parsed.payload;
        }
        if (parsed.ingested_at !== undefined) {
          filters.ingested_at = parsed.ingested_at;
        }

        const pagination: PaginationParams = {
          page: parsed.page,
          limit: 15,
        };

        const { data, total } = await eventsRepo.queryEvents(
          filters,
          pagination,
        );

        res.status(200).json({
          events: data,
          page: pagination.page,
          total,
        });
      } catch (err) {
        next(err);
      }
    },
  );

  // DELETE /events/:id - permanently remove an event by id
  router.delete(
    "/:id",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
          res.status(400).json({
            detail: "Invalid event id.",
          });
          return;
        }

        const deleted = await eventsRepo.deleteEvent(id);

        if (!deleted) {
          res.status(404).json({
            detail: `Event with id '${id}' not found.`,
          });
          return;
        }

        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
