import { Router, Request, Response, NextFunction } from 'express';
import { validateBody, putAlertConfigSchema } from './middleware/validation';
import { AlertRepository } from '../repositories/types';

export function makeAlertRouter(repo: AlertRepository) {
  const router = Router();

  router.get(
    '/config',
    async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const config = await repo.getAlertConfig();
        res.json(config);
      } catch (err) {
        next(err);
      }
    },
  );

  router.put(
    '/config',
    validateBody(putAlertConfigSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const updated = await repo.upsertAlertConfig(req.body);
        res.json({
          active: updated.active,
          time_window_minutes: updated.time_window_minutes,
          event_threshold: updated.event_threshold,
        });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
