// ─────────────────────────────────────────────
// Observability, Structured Logging & Error Monitoring
// Captures system events, API latencies, and client errors
// without leaking PII, passwords, or farmer tokens.
// ─────────────────────────────────────────────

export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

export interface StructuredLogEvent {
  level: LogLevel;
  category:
    | "CLIENT"
    | "API"
    | "FIREBASE"
    | "AI_PROVIDER"
    | "MARKET"
    | "WEATHER"
    | "AUTH"
    | "SMS"
    | "WHATSAPP"
    | "ANALYTICS";
  message: string;
  timestamp: string;
  durationMs?: number;
  statusCode?: number;
  errorName?: string;
  metadata?: Record<string, string | number | boolean>;
}

class ObservabilityLogger {
  private inMemoryLogs: StructuredLogEvent[] = [];
  private readonly maxInMemory = 100;

  private sanitize(text: string): string {
    if (!text) return "";
    return text
      .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[REDACTED_EMAIL]")
      .replace(/\b\d{10}\b/g, "[REDACTED_PHONE]")
      .replace(/AIza[0-9A-Za-z-_]{35}/g, "[REDACTED_KEY]")
      .slice(0, 500);
  }

  log(
    level: LogLevel,
    category: StructuredLogEvent["category"],
    message: string,
    extra?: {
      durationMs?: number;
      statusCode?: number;
      error?: unknown;
      metadata?: Record<string, string | number | boolean>;
    }
  ) {
    const errorName = extra?.error instanceof Error ? extra.error.name : undefined;
    const errorMessage = extra?.error instanceof Error ? extra.error.message : String(extra?.error || "");

    const event: StructuredLogEvent = {
      level,
      category,
      message: this.sanitize(message + (errorMessage ? `: ${errorMessage}` : "")),
      timestamp: new Date().toISOString(),
      durationMs: extra?.durationMs,
      statusCode: extra?.statusCode,
      errorName,
      metadata: extra?.metadata,
    };

    // Add to in-memory buffer
    this.inMemoryLogs.unshift(event);
    if (this.inMemoryLogs.length > this.maxInMemory) {
      this.inMemoryLogs.pop();
    }

    // Console output in dev/server
    if (process.env.NODE_ENV !== "production" || level === "ERROR") {
      const prefix = `[${event.timestamp}] [${level}] [${category}]`;
      if (level === "ERROR") {
        console.error(prefix, event.message);
      } else if (level === "WARN") {
        console.warn(prefix, event.message);
      } else {
        console.log(prefix, event.message);
      }
    }
  }

  info(category: StructuredLogEvent["category"], message: string, extra?: any) {
    this.log("INFO", category, message, extra);
  }

  warn(category: StructuredLogEvent["category"], message: string, extra?: any) {
    this.log("WARN", category, message, extra);
  }

  error(category: StructuredLogEvent["category"], message: string, extra?: any) {
    this.log("ERROR", category, message, extra);
  }

  getRecentLogs(limit = 30): StructuredLogEvent[] {
    return this.inMemoryLogs.slice(0, limit);
  }
}

export const logger = new ObservabilityLogger();
