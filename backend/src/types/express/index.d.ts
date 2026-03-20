import type { Source } from "../../repositories/types";

declare global {
  namespace Express {
    interface Request {
      source?: Source;
      isAdmin?: boolean;
    }
  }
}

export {};
