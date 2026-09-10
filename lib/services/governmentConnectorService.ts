import { logAuditEvent } from "@/lib/services/auditLogService";
import type {
  GovernmentConnectorStatus,
  GovernmentConnectorResponse,
  GovernmentService,
} from "@/types";

// ─────────────────────────────────────────────
// Phase 41: Government Integration Readiness Layer & Secure Sandbox Connector
// Prepares architecture for future authorized AgriStack / Agrisnet integrations.
// STRICT RULE: Rejects Aadhaar number collection or simulation without live official UIDAI credentials.
// ─────────────────────────────────────────────

export interface GovernmentIdentityProvider {
  verifyIdentity(farmerId: string): Promise<GovernmentConnectorResponse>;
}

export interface FarmerRegistryProvider {
  fetchLandRecords(farmerId: string, state: string): Promise<GovernmentConnectorResponse>;
}

export interface SchemeStatusProvider {
  syncSchemeApplicationStatus(applicationId: string): Promise<GovernmentConnectorResponse>;
}

class UnavailableGovernmentProvider
  implements GovernmentIdentityProvider, FarmerRegistryProvider, SchemeStatusProvider
{
  async verifyIdentity(farmerId: string): Promise<GovernmentConnectorResponse> {
    await logAuditEvent(
      farmerId,
      "GOV_CONNECTOR_ATTEMPT" as any,
      "government_service",
      "identity",
      { provider: "UnavailableGovernmentProvider", status: "NOT_CONFIGURED" }
    );

    return {
      status: "NOT_CONFIGURED",
      providerName: "AgriStack / Agrisnet Sandbox Layer",
      message: "Government identity verification integration is not configured.",
      timestamp: new Date().toISOString(),
    };
  }

  async fetchLandRecords(farmerId: string, state: string): Promise<GovernmentConnectorResponse> {
    await logAuditEvent(
      farmerId,
      "GOV_CONNECTOR_ATTEMPT" as any,
      "government_service",
      "land_registry",
      { provider: "UnavailableGovernmentProvider", state, status: "NOT_CONFIGURED" }
    );

    return {
      status: "NOT_CONFIGURED",
      providerName: "State Land Records / Tamil Nilam Connector",
      message: "Direct government land registry synchronization is not configured.",
      timestamp: new Date().toISOString(),
    };
  }

  async syncSchemeApplicationStatus(applicationId: string): Promise<GovernmentConnectorResponse> {
    return {
      status: "NOT_CONFIGURED",
      providerName: "Direct Benefit Transfer (DBT) Portal Connector",
      message: "Direct DBT scheme status polling is not configured.",
      timestamp: new Date().toISOString(),
    };
  }
}

export const defaultGovernmentConnector = new UnavailableGovernmentProvider();

/**
 * Validates that no sensitive Aadhaar / UIDAI data is passed in request payloads.
 * Throws explicit error if Aadhaar numbers or raw OTPs are detected.
 */
export function assertNoAadhaarPayload(payload: Record<string, any>): void {
  const forbiddenKeys = ["aadhaar", "aadhaarno", "aadhaar_number", "uidai", "otp", "aadhaarotp"];
  const keys = Object.keys(payload).map((k) => k.toLowerCase());

  for (const forbidden of forbiddenKeys) {
    if (keys.includes(forbidden)) {
      throw new Error(
        `[SECURITY POLICY VIOLATION] Field '${forbidden}' is prohibited. AgroGuide does not collect or store Aadhaar numbers.`
      );
    }
  }

  // Check 12-digit numeric Aadhaar pattern in values
  Object.values(payload).forEach((val) => {
    if (typeof val === "string" && /^\d{12}$/.test(val.replace(/\s+/g, ""))) {
      throw new Error(
        `[SECURITY POLICY VIOLATION] 12-digit national identity numbers are strictly rejected.`
      );
    }
  });
}
