// Simple console-based logger
const isDevelopment = process.env.NODE_ENV === "development";

type LogLevel = "info" | "warn" | "error" | "debug";

function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const logData = data ? ` ${JSON.stringify(data)}` : "";
  
  if (isDevelopment) {
    console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}${logData}`);
  } else {
    console[level](JSON.stringify({ timestamp, level, message, ...data }));
  }
}

export const logger = {
  info: (message: string | Record<string, unknown>, msg?: string) => {
    if (typeof message === "string") {
      log("info", message);
    } else {
      log("info", msg || "", message);
    }
  },
  warn: (message: string | Record<string, unknown>, msg?: string) => {
    if (typeof message === "string") {
      log("warn", message);
    } else {
      log("warn", msg || "", message);
    }
  },
  error: (message: string | Record<string, unknown>, msg?: string) => {
    if (typeof message === "string") {
      log("error", message);
    } else {
      log("error", msg || "", message);
    }
  },
  debug: (message: string | Record<string, unknown>, msg?: string) => {
    if (typeof message === "string") {
      log("debug", message);
    } else {
      log("debug", msg || "", message);
    }
  },
  child: (context: Record<string, unknown>) => ({
    info: (msg: string) => log("info", msg, context),
    warn: (msg: string) => log("warn", msg, context),
    error: (msg: string) => log("error", msg, context),
    debug: (msg: string) => log("debug", msg, context),
  }),
};

export function createRequestLogger(requestId: string, traceId?: string) {
  return logger.child({ requestId, traceId: traceId || requestId });
}

export function createUserLogger(userId: string, traceId?: string) {
  return logger.child({ userId, traceId });
}

export function createContextLogger(
  requestId: string,
  userId?: string,
  traceId?: string
) {
  return logger.child({ requestId, userId, traceId: traceId || requestId });
}

export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error({
    err: error,
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

export function logSecurityEvent(
  event: string,
  context: {
    userId?: string;
    ip?: string;
    userAgent?: string;
    action?: string;
    details?: Record<string, unknown>;
  }
) {
  logger.warn(
    {
      type: "SECURITY_EVENT",
      event,
      ...context,
    },
    `Security event: ${event}`
  );
}
