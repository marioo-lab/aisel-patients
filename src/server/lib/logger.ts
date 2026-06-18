type Level = "info" | "warn" | "error";
type Meta = Record<string, unknown>;

function emit(level: Level, msg: string, meta?: Meta) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg,
    ...meta,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/** Tiny structured logger — one JSON line per event, no framework. */
export const logger = {
  info: (msg: string, meta?: Meta) => emit("info", msg, meta),
  warn: (msg: string, meta?: Meta) => emit("warn", msg, meta),
  error: (msg: string, meta?: Meta) => emit("error", msg, meta),
  /** Log a completed request: method, path, status, duration. */
  request: (method: string, path: string, status: number, ms: number) =>
    emit(status >= 500 ? "error" : "info", "request", {
      method,
      path,
      status,
      ms,
    }),
};
