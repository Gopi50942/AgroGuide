import type { FarmerProfile, Farm, FarmerMasterProfile } from "@/types";

// ─────────────────────────────────────────────
// Phase 62: Central Farmer Master Profile Normalizer
// Single source of truth for farmer context used across AI, Government, and Advisory modules.
// ─────────────────────────────────────────────

export function getFarmerMasterProfile(
  profile: Partial<FarmerProfile> | null,
  farms: Farm[] = [],
  uid: string = "farmer_user"
): FarmerMasterProfile {
  const totalAcres = farms.reduce(
    (sum, f) => sum + (f.areaAcres || f.totalAreaAcres || f.acres || 0),
    0
  ) || profile?.landAreaAcres || 0;

  // Determine standard operational category
  let farmerCategory: FarmerMasterProfile["farmerCategory"] = "small";
  if (totalAcres <= 2.5) farmerCategory = "marginal";
  else if (totalAcres <= 5.0) farmerCategory = "small";
  else if (totalAcres <= 10.0) farmerCategory = "medium";
  else farmerCategory = "large";

  // Compute profile completion percentage
  let completed = 0;
  const totalChecks = 6;
  if (profile?.name) completed++;
  if (profile?.district) completed++;
  if (profile?.phone) completed++;
  if (farms.length > 0) completed++;
  if (profile?.soilType || farms[0]?.soilType) completed++;
  if (profile?.irrigationType || farms[0]?.irrigationType) completed++;

  const profileCompletionPercent = Math.round((completed / totalChecks) * 100);

  const primaryFarm = farms[0];
  const primaryIrrigation = primaryFarm?.irrigationType || profile?.irrigationType || "Borewell / Drip";
  const dripCovered = farms
    .filter((f) => f.irrigationType?.toLowerCase().includes("drip"))
    .reduce((sum, f) => sum + (f.areaAcres || f.totalAreaAcres || f.acres || 0), 0);

  return {
    uid: profile?.uid || uid,
    name: profile?.name || "AgroGuide Farmer",
    preferredLanguage: profile?.preferredLanguage || "ta",
    phone: profile?.phone,
    email: profile?.email,
    village: profile?.location?.village || primaryFarm?.location || "Coimbatore Rural",
    district: profile?.district || primaryFarm?.district || "Coimbatore",
    state: profile?.state || "Tamil Nadu",
    pinCode: profile?.location?.pinCode,
    primaryFarmId: primaryFarm?.id,
    farmerCategory,
    landAreaSummary: {
      totalAcres,
      activeFarmsCount: farms.length,
    },
    irrigationSummary: {
      primaryType: primaryIrrigation,
      dripCoveredAcres: dripCovered,
    },
    profileCompletionPercent,
    updatedAt: new Date().toISOString(),
  };
}
