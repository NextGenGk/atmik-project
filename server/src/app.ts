import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestIdAndLog } from "./middleware/requestId.js";
import { dbState } from "./config/db.js";

export const app = express();

app.disable("x-powered-by");

if (env.HELMET_ENABLED) {
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
}

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "64kb" }));
app.use(requestIdAndLog);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "OK",
    data: { ok: true, uptime: process.uptime(), db: dbState() },
  });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);
