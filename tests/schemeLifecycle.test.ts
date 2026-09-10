import { describe, it, expect } from "vitest";
import {
  listSchemeCycles,
  createSchemeCycle,
  updateSchemeCycleStatus,
  canPublishSchemeCycle,
} from "@/lib/services/schemeLifecycleService";

describe("Phase 106 — Government Scheme Lifecycle Management", () => {
  it("enforces role permissions for publishing scheme cycles", () => {
    expect(canPublishSchemeCycle("farmer")).toBe(false);
    expect(canPublishSchemeCycle("extension_officer")).toBe(false);
    expect(canPublishSchemeCycle("district_officer")).toBe(true);
    expect(canPublishSchemeCycle("state_admin")).toBe(true);
  });

  it("filters scheme visibility such that farmers see only published/open schemes", async () => {
    const farmerView = await listSchemeCycles("farmer");
    expect(farmerView.every((s) => ["Published", "Applications Open", "Applications Closed"].includes(s.status))).toBe(true);

    const officerView = await listSchemeCycles("district_officer");
    expect(officerView.length).toBeGreaterThanOrEqual(farmerView.length);
  });

  it("creates and updates scheme cycle status when authorized", async () => {
    const newCycle = await createSchemeCycle(
      {
        schemeId: "scheme_test_cycle",
        schemeNameEn: "State Horticulture Mission 2026",
        schemeNameTa: "மாநில தோட்டக்கலை இயக்கம் 2026",
        financialYear: "2026-2027",
        applicationStart: "2026-06-01",
        applicationEnd: "2026-11-30",
        districtAvailability: ["Coimbatore", "Salem"],
        eligibilityRules: ["Vegetable growers with micro-irrigation"],
        officialUrl: "https://tnhorticulture.tn.gov.in",
        status: "Draft",
      },
      "district_officer"
    );

    expect(newCycle.id).toBeDefined();

    const updated = await updateSchemeCycleStatus(newCycle.id, "Published", "district_officer");
    expect(updated?.status).toBe("Published");
  });
});
