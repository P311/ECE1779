import { Router, Request, Response, NextFunction } from 'express';
import { getEventStats } from '../repositories/events';
import { getSources } from '../repositories/sources';
import type { TimelineBucket, SourceBucket, SeverityBucket } from '../repositories/types';
import { validateQuery, getStatsQuerySchema } from './middleware/validation';

const router = Router();

const EPOCH_START = '1970-01-01T00:00:00.000Z';

function formatTimestamp(ts: Date, groupBy: string): string {
  const iso = ts.toISOString();
  switch (groupBy) {
    case 'minute':
    case 'hour':
      return iso.slice(0, 16); // e.g. 2026-03-15T08:30
    case 'day':
      return iso.slice(0, 10); // e.g. 2026-03-15
    case 'month':
      return iso.slice(0, 7);  // e.g. 2026-03
    default:
      return iso.slice(0, 10);
  }
}

router.get(
  '/stats/timeline',
  validateQuery(getStatsQuerySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { group_by } = (
        req as Request & { parsedQuery: { group_by: 'minute' | 'hour' | 'day' | 'month' } }
      ).parsedQuery;

      const buckets = await getEventStats({
        group_by,
        start_time: EPOCH_START,
        end_time: new Date().toISOString(),
      });

      const result: TimelineBucket[] = buckets.map((b) => ({
        time: formatTimestamp(b.timestamp, group_by),
        count: b.count,
      }));

      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/stats/source',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sources = await getSources();

      const result: SourceBucket[] = sources
        .map((s) => ({ source: s.name, count: s.stats.total_events }))
        .sort((a, b) => b.count - a.count);

      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/stats/severity',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buckets = await getEventStats({
        group_by: 'day',
        start_time: EPOCH_START,
        end_time: new Date().toISOString(),
      });

      const totals = { critical: 0, warning: 0, info: 0 };
      for (const b of buckets) {
        totals.critical += b.critical;
        totals.warning += b.warning;
        totals.info += b.info;
      }

      const result: SeverityBucket[] = [
        { severity: 'critical', count: totals.critical },
        { severity: 'warning', count: totals.warning },
        { severity: 'info', count: totals.info },
      ];

      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
