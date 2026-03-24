import { Router, Request, Response } from "express";
import { pool } from "../repositories/db";

export function makeHealthRouter(): Router {
  const router = Router();

  router.get("/", async (_req: Request, res: Response): Promise<void> => {
    try {
      await pool.query("SELECT 1");
      res.status(200).json({ status: "ok", db: "connected" });
    } catch (err) {
      res.status(503).json({ status: "error", db: "disconnected" });
    }
  });

  return router;
}
