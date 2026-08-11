import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB(): Promise<void> {
  mongoose.connection.on("connected", () => {
    console.log(`✅ MongoDB connected: ${mongoose.connection.name}`);
  });
  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected");
  });

  if (mongoose.connection.readyState >= 1) {
    return;
  }
  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
}

export function dbState(): string {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] ?? "unknown";
}
