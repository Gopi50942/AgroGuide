import { describe, it, expect } from "vitest";
import {
  listVerifiedOfficers,
  grantOfficerAccess,
  revokeOfficerAccess,
  DEMO_OFFICERS,
} from "@/lib/services/officerService";

describe("Phase 32 — Authorized Extension Officer Portal", () => {
  it("provides verified extension officer directory", async () => {
    const officers = await listVerifiedOfficers();
    expect(officers.length).toBeGreaterThan(0);
    officers.forEach((o) => {
      expect(o.verified).toBe(true);
      expect(o.officialEmail).toBeDefined();
    });
  });

  it("creates scoped farmer consent access grant and permits revocation", async () => {
    const officer = DEMO_OFFICERS[0];
    const grant = await grantOfficerAccess(
      "farmer_test_01",
      "K. Ramanathan",
      "Coimbatore",
      officer,
      ["farm_summary", "crop_status", "soil_reports"],
      30,
      true
    );

    expect(grant.granted).toBe(true);
    expect(grant.scopes).toContain("soil_reports");
    expect(grant.scopes).not.toContain("scheme_support");

    // Revoke access
    const revoked = await revokeOfficerAccess("farmer_test_01", grant.id, true);
    expect(revoked).toBe(true);
  });
});
