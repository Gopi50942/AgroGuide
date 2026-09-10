import { describe, it, expect } from "vitest";
import { logger } from "@/lib/observability/logger";

describe("Phase 31 — Observability & Logger Redaction", () => {
  it("records structured log events without crashing", () => {
    logger.info("MARKET", "Fetched 12 mandi records successfully", {
      durationMs: 120,
      statusCode: 200,
    });

    const recent = logger.getRecentLogs(5);
    expect(recent.length).toBeGreaterThan(0);
    expect(recent[0].category).toBe("MARKET");
    expect(recent[0].level).toBe("INFO");
  });

  it("redacts email addresses and phone numbers from log output", () => {
    logger.warn("CLIENT", "User attempt with farmer.kumar@example.com and 9876543210");

    const recent = logger.getRecentLogs(1);
    expect(recent[0].message).toContain("[REDACTED_EMAIL]");
    expect(recent[0].message).toContain("[REDACTED_PHONE]");
    expect(recent[0].message).not.toContain("farmer.kumar@example.com");
    expect(recent[0].message).not.toContain("9876543210");
  });
});
