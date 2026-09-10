import { describe, it, expect } from "vitest";
import { generateSdrfDossier } from "@/lib/services/sdrfDossierService";

describe("Phase 131 — SDRF Disaster Loss Dossier Builder", () => {
  it("compiles aggregated district evidence package with clear authority disclaimer", async () => {
    const dossier = await generateSdrfDossier("Coimbatore", "Heavy Rain Inundation");
    expect(dossier.dossierId).toMatch(/^SDRF-COI-\d{4}-\d{4}$/);
    expect(dossier.affectedVillagesCount).toBeGreaterThan(0);
    expect(dossier.affectedFarmersCount).toBeGreaterThan(0);
    expect(dossier.totalAcreageDamaged).toBeGreaterThan(0);
    expect(dossier.officialDisclaimer.toLowerCase()).toContain("final relief eligibility");
  });
});
