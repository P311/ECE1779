import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const postEventSchema = z.object({
  source_id: z.string().uuid(),
  event_type: z.string().min(1).max(100),
  severity: z.enum(['info', 'warning', 'critical']),
  payload: z.record(z.string(), z.unknown()).catch({}),
});

export const postSourceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string(),
});

export const getEventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  id: z.string().optional(),
  source_id: z.string().optional(),
  event_type: z.string().optional(),
  severity: z.string().optional(),
  payload: z.string().optional(),
  ingested_at: z.string().optional(),
});

export const getStatsQuerySchema = z.object({
  group_by: z.enum(['minute', 'hour', 'day', 'month']),
});

export const putAlertConfigSchema = z.object({
  active: z.boolean(),
  time_window_minutes: z.number().int().positive(),
  event_threshold: z.number().int().positive(),
  email: z.string().email(),
});

export function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(422).json({
        error: {
          message: 'Validation failed',
          details: result.error,
        },
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(422).json({
        error: {
          message: 'Validation failed',
          details: result.error,
        },
      });
      return;
    }
    (req as Request & { parsedQuery: T }).parsedQuery = result.data;
    next();
  };
}
