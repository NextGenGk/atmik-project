import { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
import { zodToFieldMap } from "./validate.js";
import { isDev } from "../config/env.js";

interface MongoDupError {
  code?: number;
}
interface MongooseCastError {
  name?: string;
}
interface MongooseValidationError {
  name?: string;
  errors?: Record<string, { message?: string }>;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: zodToFieldMap(err),
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.fieldErrors ? { errors: err.fieldErrors } : {}),
    });
    return;
  }

  if ((err as MongoDupError).code === 11000) {
    res.status(409).json({
      success: false,
      message: "SKU already exists",
      errors: { sku: "SKU already exists — try another" },
    });
    return;
  }

  if ((err as MongooseCastError).name === "CastError") {
    res.status(400).json({ success: false, message: "Invalid id format" });
    return;
  }

  if ((err as MongooseValidationError).name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: flattenMongoose(err as MongooseValidationError),
    });
    return;
  }

  const anyErr = err as { name?: string; message?: string; stack?: string };
  if (anyErr?.name === "PayloadTooLargeError") {
    res.status(413).json({ success: false, message: "Request body too large" });
    return;
  }

  if (anyErr?.name === "SyntaxError" && anyErr?.message?.includes("JSON")) {
    res.status(400).json({ success: false, message: "Invalid JSON in request body" });
    return;
  }

  logger.error("unhandled error", {
    name: anyErr?.name,
    message: anyErr?.message,
    stack: isDev ? anyErr?.stack : undefined,
  });

  res.status(500).json({ success: false, message: "Something went wrong" });
}

function flattenMongoose(
  err: MongooseValidationError
): Record<string, string> {
  const map: Record<string, string> = {};
  if (err.errors) {
    for (const [key, e] of Object.entries(err.errors)) {
      map[key] = e.message ?? "Invalid value";
    }
  }
  return map;
}
