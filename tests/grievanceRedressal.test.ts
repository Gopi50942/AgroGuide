import { describe, it, expect } from "vitest";
import {
  generateGrievanceRef,
  submitFarmerGrievance,
  updateGrievanceStatus,
  escalateGrievance,
} from "@/lib/services/grievanceService";

describe("Phase 105 — Farmer Grievance Redressal System", () => {
  it("generates structured grievance reference numbers", () => {
    const ref = generateGrievanceRef("Coimbatore");
    expect(ref).toMatch(/^AG-GRV-COI-\d{4}-\d{6}$/);
  });

  it("submits a grievance, updates status, and escalates to district with audit trail", async () => {
    const grv = await submitFarmerGrievance(
      "farmer_test_105",
      "Murugan",
      "Subsidy",
      "Drip subsidy delay",
      "Awaiting physical field verification",
      "Coimbatore",
      "Pollachi"
    );

    expect(grv.status).toBe("Submitted");
    expect(grv.auditLogs.length).toBe(1);

    const updated = await updateGrievanceStatus(
      grv.id,
      "Acknowledged",
      "officer_test",
      "extension_officer",
      "Inspection assigned"
    );
    expect(updated?.status).toBe("Acknowledged");
    expect(updated?.acknowledgedAt).toBeDefined();

    const escalated = await escalateGrievance(
      grv.id,
      "District",
      "officer_test",
      "block_officer",
      "Requires district collector clearance"
    );
    expect(escalated?.status).toBe("Escalated");
    expect(escalated?.escalationLevel).toBe("District");
  });
});
