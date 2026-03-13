import { Source } from "@/backend/src/repositories/types";

declare global {
  namespace Express {
    interface Request {
      source?: Source;
      isAdmin?: boolean;
    }
  }
}
