import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  MONGO_URI: z
    .string()
    .min(1, "MONGO_URI is required (see server/.env.example)"),
  CLERK_SECRET_KEY: z.string().optional().default(""),
  HELMET_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment configuration. Fix the following:\n",
    parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n")
  );
  process.exit(1);
}

export const env = parsed.data;
export const isDev = env.NODE_ENV !== "production";
export const authEnabled = env.CLERK_SECRET_KEY.trim().length > 0;
