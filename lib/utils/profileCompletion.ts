import type { FarmerProfile } from "@/types";
import type { TranslationKey } from "@/lib/i18n/translations";

// ─────────────────────────────────────────────
// Profile completion is based only on fields the farmer can actually
// fill in Settings. Each field is weighted equally for simplicity —
// this is a UI nudge, not a scored assessment of the farmer.
// ─────────────────────────────────────────────

interface CompletionField {
  key: TranslationKey;
  filled: boolean;
}

export function calculateProfileCompletion(profile: FarmerProfile): {
  percent: number;
  missingKeys: TranslationKey[];
} {
  const fields: CompletionField[] = [
    { key: "settings.fullName", filled: Boolean(profile.name?.trim()) },
    { key: "settings.phone", filled: Boolean(profile.phone?.trim()) },
    { key: "settings.districtState", filled: Boolean(profile.district && profile.state) },
    { key: "settings.landArea", filled: Boolean(profile.landAreaAcres && profile.landAreaAcres > 0) },
    { key: "settings.soilType", filled: Boolean(profile.soilType?.trim()) },
    { key: "settings.irrigationType", filled: Boolean(profile.irrigationType?.trim()) },
    { key: "settings.farmingType", filled: Boolean(profile.farmingType?.trim()) },
    { key: "settings.waterSource", filled: Boolean(profile.waterSource?.trim()) },
    { key: "settings.landOwnership", filled: Boolean(profile.landOwnershipType) },
  ];

  const filledCount = fields.filter((f) => f.filled).length;
  const percent = Math.round((filledCount / fields.length) * 100);
  const missingKeys = fields.filter((f) => !f.filled).map((f) => f.key);

  return { percent, missingKeys };
}
