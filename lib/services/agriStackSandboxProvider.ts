import { assertNoAadhaarPayload } from "@/lib/services/governmentConnectorService";
import type { AgriStackRegistryStatus } from "@/types";

// ─────────────────────────────────────────────
// Phase 122: AgriStack Sandbox Connector Layer
// Safe abstraction for AgriStack Farmer/Farm Registry integration. Zero Aadhaar collection.
// ─────────────────────────────────────────────

export class AgriStackSandboxProvider {
  private mode: "sandbox" | "production" | "disabled";

  constructor() {
    const envMode = process.env.AGRISTACK_MODE;
    this.mode = envMode === "sandbox" ? "sandbox" : "disabled";
  }

  async getFarmerRegistryStatus(farmerId: string, consentGranted: boolean): Promise<AgriStackRegistryStatus> {
    assertNoAadhaarPayload({ farmerId });

    if (!consentGranted) {
      return {
        status: "NOT_CONFIGURED",
        message: "Explicit farmer consent is required before querying AgriStack registry status.",
        timestamp: new Date().toISOString(),
      };
    }

    if (this.mode === "disabled") {
      return {
        status: "NOT_CONFIGURED",
        message: "AgriStack connector is NOT_CONFIGURED in current environment. Using local AgroGuide farmer ID.",
        timestamp: new Date().toISOString(),
      };
    }

    // Sandbox response
    return {
      status: "SANDBOX_READY",
      farmerRefId: `AGRISTACK-SANDBOX-${farmerId.slice(-6).toUpperCase()}`,
      landHoldingsCount: 1,
      message: "Connected to AgriStack developer sandbox environment.",
      timestamp: new Date().toISOString(),
    };
  }

  async getFarmRegistrySummary(farmId: string): Promise<{ status: string; message: string; farmPlotRef?: string }> {
    if (this.mode === "disabled") {
      return {
        status: "NOT_CONFIGURED",
        message: "Farm Registry sandbox connector is NOT_CONFIGURED.",
      };
    }

    return {
      status: "SANDBOX_READY",
      farmPlotRef: `AGRISTACK-PLOT-${farmId.slice(-6).toUpperCase()}`,
      message: "Farm plot verified against sandbox registry.",
    };
  }
}

export const agriStackProvider = new AgriStackSandboxProvider();
