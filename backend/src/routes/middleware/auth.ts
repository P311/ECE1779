import { Request, Response, NextFunction } from 'express';
import { Source, SourcesRepository } from '../../repositories/types';
import { config } from '../config';

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

export function makeSourceAuth(repo: SourcesRepository) {
  return function (req: Request, res: Response, next: NextFunction): void {
    const token = extractBearer(req);
    if (!token) {
      res.status(401).json({ error: { message: 'Missing Authorization header' } });
      return;
    }
    repo.getSourceByApiKey(token)
    .then((source: Source | null) => {
        if (!source) {
            res.status(401).json({ error: { message: 'Invalid API key' } });
            return;
        }
        req.source = source;
        next();
        })
        .catch(next);
  };
}

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearer(req);
  if (!token) {
    res.status(401).json({ error: { message: 'Missing Authorization header' } });
    return;
  }
  if (token !== config.adminApiKey) {
    res.status(401).json({ error: { message: 'Invalid admin API key' } });
    return;
  }
  req.isAdmin = true;
  next();
}
