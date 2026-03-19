import { Router, Request, Response, NextFunction } from 'express';
import { validateBody, putAlertConfigSchema } from './middleware/validation';

const router = Router();

export interface AlertConfig {
  active: boolean;
  time_window_minutes: number;
  event_threshold: number;
  email: string;
}

export let alertConfig: AlertConfig = {
  active: false,
  time_window_minutes: 0,
  event_threshold: 0,
  email: '',
};

router.put(
  '/alert/config',
  validateBody(putAlertConfigSchema),
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      alertConfig = req.body as AlertConfig;
      res.json({
        active: alertConfig.active,
        time_window_minutes: alertConfig.time_window_minutes,
        event_threshold: alertConfig.event_threshold,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
