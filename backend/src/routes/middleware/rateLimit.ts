import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

const windowMap = new Map<string, number[]>();

export function sourceRateLimit(req: Request, res: Response, next: NextFunction): void {
  const source = req.source;
  if (!source) {
    next();
    return;
  }

  const key = source.api_key;
  const now = Date.now();
  const windowStart = now - config.rateLimit.windowMs;

  let timestamps = windowMap.get(key) ?? [];

  timestamps = timestamps.filter((t) => t > windowStart);

  if (timestamps.length >= config.rateLimit.maxRequests) {
    res.status(429).json({
      error: {
        message: 'Rate limit exceeded. Maximum 1000 requests per minute.',
      },
    });
    return;
  }

  timestamps.push(now);
  windowMap.set(key, timestamps);

  next();
}
