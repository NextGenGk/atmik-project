type Level = "info" | "warn" | "error";

function write(level: Level, msg: string, meta?: Record<string, unknown>): void {
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${msg}${
    meta ? ` ${JSON.stringify(meta)}` : ""
  }`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => write("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => write("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => write("error", msg, meta),
};
