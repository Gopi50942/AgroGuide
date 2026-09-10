import { describe, it, expect } from "vitest";
import { sanitizeAuditMetadata } from "@/lib/services/auditLogService";

describe("Phase 25 — Audit Logging & Redaction", () => {
  it("strips passwords, auth tokens, and raw keys from metadata", () => {
    const rawMetadata = {
      farmName: "Cauvery Field 1",
      acres: 3.5,
      password: "secretPassword123",
      authToken: "Bearer eyJhbGciOi...",
      apiKey: "AIzaSyD-12345",
      isLive: true,
    };

    const clean = sanitizeAuditMetadata(rawMetadata);

    expect(clean.farmName).toBe("Cauvery Field 1");
    expect(clean.acres).toBe(3.5);
    expect(clean.isLive).toBe(true);
    expect((clean as any).password).toBeUndefined();
    expect((clean as any).authToken).toBeUndefined();
    expect((clean as any).apiKey).toBeUndefined();
  });

  it("handles null or empty metadata safely", () => {
    expect(sanitizeAuditMetadata(undefined)).toEqual({});
    expect(sanitizeAuditMetadata({})).toEqual({});
  });
});
