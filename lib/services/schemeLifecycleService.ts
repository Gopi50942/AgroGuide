import type { GovernmentSchemeCycle, SchemeCycleStatus, GovernmentUserRole } from "@/types";

// ─────────────────────────────────────────────
// Phase 106: Government Scheme Lifecycle Management Service
// Government-side scheme cycle management, publishing permissions, and window control.
// ─────────────────────────────────────────────

let inMemorySchemeCycles: GovernmentSchemeCycle[] = [
  {
    id: "sc_pmksy_2026",
    schemeId: "scheme_pmksy_drip",
    schemeNameEn: "PMKSY — Micro Irrigation Drip Scheme (2026-27)",
    schemeNameTa: "பிரதம மந்திரி நுண்ணீர் பாசனத் திட்டம் (2026-27)",
    financialYear: "2026-2027",
    applicationStart: "2026-04-01",
    applicationEnd: "2026-10-31",
    districtAvailability: ["Coimbatore", "Thanjavur", "Madurai", "Salem", "Erode"],
    eligibilityRules: [
      "Small and marginal farmers with land possession certificate",
      "Functioning borewell/open-well or irrigation source",
      "Preference for water-stressed blocks",
    ],
    officialUrl: "https://agricoop.gov.in",
    status: "Applications Open",
    budgetAllocatedRs: 45000000,
    publishedByOfficerId: "admin_state_agri",
    createdAt: "2026-03-15T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "sc_pmfby_kharif_2026",
    schemeId: "scheme_pmfby_kharif",
    schemeNameEn: "PMFBY — Kharif Crop Insurance Cycle 2026",
    schemeNameTa: "பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டம் — காரீப் 2026",
    financialYear: "2026-2027",
    applicationStart: "2026-05-01",
    applicationEnd: "2026-07-31",
    districtAvailability: ["ALL"],
    eligibilityRules: [
      "Notified crops in notified revenue villages",
      "Sowing certificate / Adangal extract",
    ],
    officialUrl: "https://pmfby.gov.in",
    status: "Applications Open",
    budgetAllocatedRs: 120000000,
    publishedByOfficerId: "admin_state_agri",
    createdAt: "2026-04-10T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
  },
  {
    id: "sc_solar_kusum_2026",
    schemeId: "scheme_pm_kusum_b",
    schemeNameEn: "PM-KUSUM Component B — Off-grid Solar Pumps",
    schemeNameTa: "பிஎம்-குசும் திட்டம் — சூரிய ஒளி மின்சார பம்புகள்",
    financialYear: "2026-2027",
    applicationStart: "2026-06-01",
    applicationEnd: "2026-12-31",
    districtAvailability: ["Coimbatore", "Dharmapuri", "Tirunelveli"],
    eligibilityRules: [
      "Individual farmers without grid electric connection for agriculture",
      "Up to 7.5 HP solar pump capacity",
    ],
    officialUrl: "https://mnre.gov.in",
    status: "Under Review",
    budgetAllocatedRs: 30000000,
    publishedByOfficerId: "admin_state_agri",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
];

export function canPublishSchemeCycle(role: GovernmentUserRole): boolean {
  return ["district_officer", "state_admin", "system_admin"].includes(role);
}

export async function listSchemeCycles(role: GovernmentUserRole = "farmer"): Promise<GovernmentSchemeCycle[]> {
  if (role === "farmer") {
    // Farmers only see published / active schemes
    return inMemorySchemeCycles.filter((s) =>
      ["Published", "Applications Open", "Applications Closed"].includes(s.status)
    );
  }
  return inMemorySchemeCycles;
}

export async function createSchemeCycle(
  cycle: Omit<GovernmentSchemeCycle, "id" | "createdAt" | "updatedAt">,
  role: GovernmentUserRole
): Promise<GovernmentSchemeCycle> {
  if (!canPublishSchemeCycle(role)) {
    throw new Error("Unauthorized: Only District Officers or State Admins can create scheme cycles.");
  }

  const newCycle: GovernmentSchemeCycle = {
    ...cycle,
    id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemorySchemeCycles.unshift(newCycle);
  return newCycle;
}

export async function updateSchemeCycleStatus(
  cycleId: string,
  status: SchemeCycleStatus,
  role: GovernmentUserRole
): Promise<GovernmentSchemeCycle | null> {
  if (!canPublishSchemeCycle(role)) {
    throw new Error("Unauthorized: Insufficient role permissions to alter scheme lifecycle status.");
  }

  const cycle = inMemorySchemeCycles.find((c) => c.id === cycleId);
  if (!cycle) return null;

  cycle.status = status;
  cycle.updatedAt = new Date().toISOString();
  return cycle;
}
