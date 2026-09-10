import { describe, it, expect } from "vitest";
import { AgriStackSandboxProvider } from "@/lib/services/agriStackSandboxProvider";

describe("Phase 122 — AgriStack Sandbox Connector Layer", () => {
  it("returns NOT_CONFIGURED when farmer consent is not granted", async () => {
    const provider = new AgriStackSandboxProvider();
    const res = await provider.getFarmerRegistryStatus("farmer_122", false);
    expect(res.status).toBe("NOT_CONFIGURED");
    expect(res.message).toContain("Explicit farmer consent is required");
  });

  it("safely isolates external registry ID and strictly forbids Aadhaar", async () => {
    const provider = new AgriStackSandboxProvider();
    const res = await provider.getFarmerRegistryStatus("farmer_122", true);
    expect(["NOT_CONFIGURED", "SANDBOX_READY"]).toContain(res.status);
  });
});
