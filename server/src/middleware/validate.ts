import { type NextFunction, type Request, type Response } from "express";
import { ZodError, type ZodType } from "zod";

export function validate<T>(schema: ZodType<T>, part: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);
    if (result.success) {
      // Type-safe: coerce parsed values back onto the request part
      (req as unknown as Record<string, unknown>)[part] = result.data;
      return next();
    }
    throw result.error;
  };
}

export function zodToFieldMap(error: ZodError): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "body";
    if (!map[key]) map[key] = issue.message;
  }
  return map;
}
