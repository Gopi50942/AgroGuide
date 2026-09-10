import { logAuditEvent } from "@/lib/services/auditLogService";
import { assertNoAadhaarPayload } from "@/lib/services/governmentConnectorService";
import type { GovernmentConnectorResponse } from "@/types";

// ─────────────────────────────────────────────
// Phase 44: AgriStack & National Farmer Registry Connector Bridge
// Provides clean architectural interfaces for future authorized state/national registry sync.
// Returns NOT_CONFIGURED by default without credentials.
// ─────────────────────────────────────────────

export interface AgriStackConnector {
  getFarmerRegistryStatus(farmerId: string): Promise<GovernmentConnectorResponse>;
  getFarmRegistrySummary(farmerId: string, state: string): Promise<GovernmentConnectorResponse>;
  verifyRegistryReference(registryRef: string): Promise<GovernmentConnectorResponse>;
}

class UnavailableAgriStackConnector implements AgriStackConnector {
  async getFarmerRegistryStatus(farmerId: string): Promise<GovernmentConnectorResponse> {
    await logAuditEvent(
      farmerId,
      "GOV_CONNECTOR_ATTEMPT",
      "government_service",
      "agristack_status",
      { provider: "AgriStackSandbox", status: "NOT_CONFIGURED" }
    );

    return {
      status: "NOT_CONFIGURED",
      providerName: "AgriStack / Unified Farmer Registry",
      message: "AgriStack live API credentials are not configured in this environment.",
      timestamp: new Date().toISOString(),
    };
  }

  async getFarmRegistrySummary(farmerId: string, state: string): Promise<GovernmentConnectorResponse> {
    return {
      status: "NOT_CONFIGURED",
      providerName: "State Geo-referenced Cadastral Land Registry",
      message: `Cadastral registry integration for ${state} is not configured.`,
      timestamp: new Date().toISOString(),
    };
  }

  async verifyRegistryReference(registryRef: string): Promise<GovernmentConnectorResponse> {
    // Assert no Aadhaar number is passed as reference
    assertNoAadhaarPayload({ ref: registryRef });

    return {
      status: "NOT_CONFIGURED",
      providerName: "Farmer ID Verification Gateway",
      message: "Direct farmer registry token verification requires official ministry sandbox credentials.",
      timestamp: new Date().toISOString(),
    };
  }
}

export const agriStackGateway: AgriStackConnector = new UnavailableAgriStackConnector();
