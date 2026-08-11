import type { Request, Response } from "express";
import { app } from "../server/src/app.js";
import { connectDB } from "../server/src/config/db.js";

export default async function handler(req: Request, res: Response) {
  try {
    await connectDB();
  } catch (err) {
    console.error("Vercel DB connection error:", err);
  }
  return app(req, res);
}
