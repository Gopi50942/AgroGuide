import { describe, it, expect } from "vitest";
import { getResidueRecordForBatch, getPublicResidueQrSummary } from "@/lib/services/pesticideResidueService";

describe("Phase 164 — Pesticide Residue QR Traceability", () => {
  it("fetches laboratory residue record and formats public-safe QR summary without PII", async () => {
    const record = await getResidueRecordForBatch("AG-TRACE-LOT-881902");
    expect(record).not.toBeNull();
    expect(record?.resultStatus).toBe("Pass / Below MRL");
    expect(record?.analyteSummary.length).toBeGreaterThanOrEqual(1);

    if (record) {
      const qrSummary = getPublicResidueQrSummary(record);
      expect(qrSummary.batchCode).toBe("AG-TRACE-LOT-881902");
      expect(qrSummary.status).toBe("Pass / Below MRL");
      expect((qrSummary as any).farmerPhone).toBeUndefined();
    }
  });
});
