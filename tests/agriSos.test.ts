import { describe, it, expect } from "vitest";
import { submitAgriSosReport, listAgriSosReports, updateAgriSosStatus } from "@/lib/services/agriSosService";

describe("Phase 155 — Farmer Disaster SOS & Rapid Response", () => {
  it("submits distress reports with agricultural disclaimer and updates officer workflow", async () => {
    const sos = await submitAgriSosReport(
      "farmer_155",
      "Murugan",
      "9876543210",
      "farm_155",
      "Coimbatore",
      "Pollachi",
      "Aliyar Village",
      "flood_inundation",
      "Flash overflow damaged drip lateral setup",
      "severe"
    );

    expect(sos.id).toBeDefined();
    expect(sos.status).toBe("Submitted");
    expect(sos.disclaimer).toContain("For agricultural crop collapse");

    const assigned = await updateAgriSosStatus(sos.id, "Officer Assigned", "Muthukumar (Extension Officer)");
    expect(assigned?.status).toBe("Officer Assigned");
    expect(assigned?.assignedOfficerName).toBe("Muthukumar (Extension Officer)");

    const list = await listAgriSosReports("Coimbatore");
    expect(list.some((item) => item.id === sos.id)).toBe(true);
  });
});
