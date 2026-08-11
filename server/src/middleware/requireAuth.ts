import { verifyToken } from "@clerk/backend";
import { type NextFunction, type Request, type Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { authEnabled, env } from "../config/env.js";

/**
 * Requires a valid Clerk session JWT. When Clerk is not configured
 * (demo mode), the middleware passes through so the app is evaluable
 * without an account. See docs/security.md §3 and docs/constraints.md.
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!authEnabled) {
    req.userId = "demo-user";
    return next();
  }

  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) {
    return next(new ApiError(401, "Unauthorized"));
  }

  try {
    const claims = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
      jwtKey: process.env.CLERK_JWT_PUBLIC_KEY,
    });
    req.userId = claims.sub;
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}
