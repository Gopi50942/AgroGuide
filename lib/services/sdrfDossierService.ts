import type { SdrfDisasterDossier } from "@/types";

// ─────────────────────────────────────────────
// Phase 131: SDRF / Disaster Loss Dossier Builder Service
// Consolidated evidence package for State Disaster Response Fund (SDRF) claims.
// ─────────────────────────────────────────────

export const SDRF_OFFICIAL_DISCLAIMER =
  "AgroGuide consolidated evidence package — compiled from verified farmer field loss reports and GPS inspection records. Final relief eligibility and compensation sanction determined solely by competent revenue and agriculture authorities.";

export async function generateSdrfDossier(
  district: string = "Coimbatore",
  hazardEvent: string = "Heavy Inundation & Unseasonal Rain (Kharif 2026)"
): Promise<SdrfDisasterDossier> {
  const dossierId = `SDRF-${district.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

  return {
    dossierId,
    district,
    hazardEvent,
    eventDate: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0],
    affectedVillagesCount: 8,
    affectedFarmersCount: 142,
    totalAcreageDamaged: 385.5,
    dominantCropsAffected: ["Hybrid Tomato", "Maize", "Small Onion", "Banana"],
    verifiedInspectionsCount: 118,
    estimatedLossRs: 7850000,
    generatedDate: new Date().toISOString(),
    officialDisclaimer: SDRF_OFFICIAL_DISCLAIMER,
  };
}
