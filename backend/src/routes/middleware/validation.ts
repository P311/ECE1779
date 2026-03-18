import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const postEventSchema = z.object({
  event_type: z.string().min(1).max(100),
  severity: z.enum(['info', 'warning', 'critical']),
  payload: z.record(z.string(), z.unknown()).catch({}),
});

export const postBatchSchema = z.object({
  events: z.array(postEventSchema).min(1).max(100),
});

export const postSourceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});

export const getEventsQuerySchema = z.object({
  source_id: z.string().uuid().optional(),
  event_type: z.string().optional(),
  severity: z.enum(['info', 'warning', 'critical']).optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const getStatsQuerySchema = z.object({
  group_by: z.enum(['hour', 'day']),
  start_time: z.string(),
  end_time: z.string(),
  source_id: z.string().uuid().optional(),
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
