import { describe, it, expect } from "vitest";
import {
  generateInternalFarmerCode,
  enrollFarmerInProgram,
  listFarmerEnrollments,
} from "@/lib/services/farmerRegistryService";

describe("Phase 104 — Farmer Registry & Service Enrollment", () => {
  it("generates AG-FARMER internal reference codes without Aadhaar numbers", () => {
    const code = generateInternalFarmerCode("Coimbatore");
    expect(code).toMatch(/^AG-FARMER-COI-\d{6}$/);
    expect(code).not.toContain("AADHAAR");
  });

  it("enrolls farmer in government programs and retrieves enrollment history", async () => {
    const enrollment = await enrollFarmerInProgram(
      "farmer_test_104",
      "Kavitha",
      "prog_soil_test",
      "Soil Testing Drive",
      "மண் பரிசோதனை இயக்கம்",
      "Coimbatore",
      "Thondamuthur",
      "Alandurai"
    );

    expect(enrollment.id).toBeDefined();
    expect(enrollment.status).toBe("enrolled");
    expect(enrollment.internalFarmerCode).toBeDefined();

    const list = await listFarmerEnrollments("farmer_test_104");
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].farmerName).toBe("Kavitha");
  });
});
