import { describe, it, expect } from "vitest";
import { getNocSystemHealth } from "@/lib/services/nocHealthService";

describe("Phase 180 — State Control Room / NOC", () => {
  it("tracks operational latencies and service health across all providers without exposing secrets", async () => {
    const health = await getNocSystemHealth();
    expect(health.length).toBeGreaterThanOrEqual(5);

    const core = health.find((h) => h.serviceName.includes("Next.js"));
    expect(core?.status).toBe("Operational");
    expect(core?.latencyMs).toBeGreaterThan(0);

    // Verify zero secrets/API keys present in payload
    health.forEach((item) => {
      expect((item as any).apiKey).toBeUndefined();
      expect((item as any).secret).toBeUndefined();
    });
  });
});
