import { describe, it, expect } from "vitest";
import { generateExportComplianceDossier } from "@/lib/services/exportDossierService";

describe("Phase 147 — FPO Export Compliance Dossier Builder", () => {
  it("compiles lot traceability, packhouse, and APEDA checklist with clear non-clearance disclaimer", async () => {
    const dossier = await generateExportComplianceDossier();
    expect(dossier.dossierId).toMatch(/^EXP-G-9-\d{4}-\d{4}$/);
    expect(dossier.apedaRegistrationRef).toContain("APEDA");
    expect(dossier.phytosanitaryChecklistCompleted).toBe(true);
    expect(dossier.officialDisclaimer.toLowerCase()).toContain("official phytosanitary certificates");
  });
});
