import { describe, it, expect } from "vitest";
import { sarDamageProvider, SAR_DISCLAIMER } from "@/lib/services/sarDamageService";

describe("Phase 168 — SAR Crop Lodging & Storm Damage Analysis", () => {
  it("provides radar change indicators with review levels and verification disclaimer", async () => {
    const analysis = await sarDamageProvider.getSarDamageAnalysis("Coimbatore");
    expect(analysis.sarSensor).toBe("Sentinel-1 SAR");
    expect(["No signal", "Review", "Elevated review"]).toContain(analysis.lodgingRiskLevel);
    expect(analysis.disclaimer).toBe(SAR_DISCLAIMER);
  });
});
