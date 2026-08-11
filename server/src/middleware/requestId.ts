import { randomUUID } from "node:crypto";
import { type NextFunction, type Request, type Response } from "express";
import { logger } from "../utils/logger.js";

export function requestIdAndLog(req: Request, res: Response, next: NextFunction): void {
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  const start = Date.now();

  res.on("finish", () => {
    logger.info("request", {
      reqId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: Date.now() - start,
      userId: req.userId,
    });
  });

  next();
}
