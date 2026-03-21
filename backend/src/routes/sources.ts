import { Router, Request, Response, NextFunction } from "express";
import { validateBody, postSourceSchema } from "./middleware/validation";
import type { SourcesRepository } from "../repositories/types";

export function makeSourcesRouter(sourcesRepo: SourcesRepository): Router {
  const router = Router();

  // GET /sources - list all sources with stats
  router.get(
    "/",
    async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const sources = await sourcesRepo.getSources();
        res.status(200).json(sources);
      } catch (err) {
        next(err);
      }
    },
  );

  // POST /sources - register a new source
  router.post(
    "/",
    validateBody(postSourceSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { name, description } = req.body as {
          name: string;
          description?: string;
        };
        const source = await sourcesRepo.createSource(name, description);
        res.status(201).json(source);
      } catch (err: any) {
        if (err?.code === "23505") {
          res.status(409).json({
            detail: `Source '${req.body.name}' already exists.`,
          });
          return;
        }
        next(err);
      }
    },
  );

  return router;
}
