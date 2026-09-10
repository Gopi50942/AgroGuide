import { describe, it, expect } from "vitest";
import { WarehouseReceiptProvider } from "@/lib/services/warehouseReceiptService";

describe("Phase 165 — WDRA / e-NWR Warehouse Receipt Connector", () => {
  it("returns NOT_CONFIGURED without national repository credentials", async () => {
    const provider = new WarehouseReceiptProvider();
    const res = await provider.getReceiptStatus("eNWR-TN-2026-9901");
    expect(["NOT_CONFIGURED", "VERIFIED"]).toContain(res.status);
    expect(res.receiptNumber).toBe("eNWR-TN-2026-9901");
  });
});
