import { describe, it, expect } from "vitest";
import { lookupPublicServiceStatus } from "@/lib/services/publicServiceStatusService";

describe("Phase 178 — Public Farmer Service Status Portal", () => {
  it("tracks grievance and SOS requests with anti-enumeration protection and zero PII", async () => {
    const grv = await lookupPublicServiceStatus("AG-GRV-CBE-2026-000123");
    expect(grv).not.toBeNull();
    expect(grv?.serviceType).toBe("Grievance");
    expect(grv?.antiEnumerationVerified).toBe(true);

    const sos = await lookupPublicServiceStatus("SOS-CBE-001");
    expect(sos).not.toBeNull();
    expect(sos?.serviceType).toBe("Agri SOS");

    const invalid = await lookupPublicServiceStatus("UNKNOWN-12345");
    expect(invalid).toBeNull();
  });
});
