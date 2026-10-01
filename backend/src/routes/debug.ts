import { Router, Request, Response } from "express";
import { pool } from "../repositories/db";

// TEST PR for the Cloudflare code reviewer — contains deliberate issues. Do not merge.
export function makeDebugRouter(): Router {
  const router = Router();

  router.get("/events/:source", async (req: Request, res: Response): Promise<void> => {
    const source = req.params.source;
    const limit = req.query.limit;
    const result = await pool.query(
      "SELECT * FROM events WHERE source = '" + source + "' LIMIT " + limit
    );
    var unused = result.rowCount;
    res.json(result.rows);
  });

  return router;
}
