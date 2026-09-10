import { describe, it, expect } from "vitest";
import { listEarlyWarningSignals } from "@/lib/services/earlyWarningService";

describe("Phase 173 — State Agricultural Early Warning Center", () => {
  it("synthesizes cross-domain multi-sensor signals with human review actions", async () => {
    const signals = await listEarlyWarningSignals("Coimbatore");
    expect(signals.length).toBeGreaterThanOrEqual(1);
    expect(["Weather", "Pest", "Water", "Market", "Input", "Storage", "Logistics"]).toContain(signals[0].category);
    expect(["Advisory", "Watch", "High", "Critical Review"]).toContain(signals[0].severity);
    expect(signals[0].recommendedHumanActionEn.length).toBeGreaterThan(10);
  });
});
