import type { CropStage } from "@/types";

// ─────────────────────────────────────────────
// Crop-specific growing guidance, keyed by a lowercase crop-name match.
//
// This is intentionally GENERAL, extension-pamphlet-level guidance
// (the kind of thing found in any basic agricultural handbook) — not
// precise agronomic prescriptions (no exact fertilizer quantities,
// no exact days, no chemical dosages). Where a farmer needs exact
// figures, the UI must point them to a local agricultural officer
// rather than have AgroGuide assert a number.
//
// Structured as a lookup so more crops/verified sources can be added
// later without touching any UI component.
// ─────────────────────────────────────────────

export interface CropStageGuidance {
  stage: CropStage;
  tips: string[];
}

export interface CropGuidance {
  cropKey: string; // lowercase match key
  displayName: string;
  stages: CropStageGuidance[];
}

export const CROP_GUIDANCE: CropGuidance[] = [
  {
    cropKey: "rice",
    displayName: "Rice / Paddy",
    stages: [
      { stage: "seed_selection", tips: ["Use certified or well-cleaned seed, and soak/treat before sowing as locally recommended."] },
      { stage: "land_preparation", tips: ["Puddle the field evenly so water stands uniformly.", "Level the field to reduce water and fertilizer waste."] },
      { stage: "sowing", tips: ["Raise a nursery before transplanting, or direct-seed depending on your local practice.", "Maintain shallow standing water after transplanting to help establishment."] },
      { stage: "germination", tips: ["Keep water shallow during early establishment — very deep water can weaken young seedlings."] },
      { stage: "vegetative", tips: ["Monitor for stem borer and leaf folder regularly.", "Maintain consistent water depth through active tillering."] },
      { stage: "flowering", tips: ["This stage is the most water-sensitive — avoid letting the field dry out.", "Watch for panicle-stage pest activity."] },
      { stage: "fruiting", tips: ["Continue steady water supply through grain filling.", "Reduce nitrogen top-dressing as grains mature."] },
      { stage: "maturity", tips: ["Maintain shallow moisture until grain starts turning golden; avoid complete dry-out too early."] },
      { stage: "harvest", tips: ["Drain the field a couple of weeks before harvest to firm the ground and ease harvesting."] },
      { stage: "post_harvest", tips: ["Dry grain properly before storage to avoid fungal spoilage."] },
    ],
  },
  {
    cropKey: "tomato",
    displayName: "Tomato",
    stages: [
      { stage: "seed_selection", tips: ["Raise seedlings in a nursery bed or trays before transplanting."] },
      { stage: "land_preparation", tips: ["Ensure good drainage — tomato is sensitive to waterlogging."] },
      { stage: "sowing", tips: ["Transplant healthy seedlings, typically in the evening to reduce transplant shock."] },
      { stage: "germination", tips: ["Keep the nursery bed consistently moist but not waterlogged."] },
      { stage: "vegetative", tips: ["Stake or trellis plants early to support later fruit weight and improve airflow.", "Watch for early signs of leaf curl or wilting."] },
      { stage: "flowering", tips: ["Consistent watering during flowering helps reduce flower drop.", "Watch for whitefly, which spreads viral disease."] },
      { stage: "fruiting", tips: ["Avoid irregular watering — it's a common cause of fruit cracking and blossom-end rot.", "Monitor for fruit borer damage."] },
      { stage: "maturity", tips: ["Monitor skin color change from green to breaker stage for optimal firmness."] },
      { stage: "harvest", tips: ["Harvest at the color stage matching your market's preference (breaker vs. fully ripe)."] },
      { stage: "post_harvest", tips: ["Handle fruit gently and grade before selling to get better prices."] },
    ],
  },
  {
    cropKey: "banana",
    displayName: "Banana",
    stages: [
      { stage: "seed_selection", tips: ["Use disease-free tissue-culture plantlets or healthy suckers."] },
      { stage: "land_preparation", tips: ["Banana needs good drainage and wind shelter where possible."] },
      { stage: "sowing", tips: ["Plant at recommended spacing for your variety to allow airflow and sunlight."] },
      { stage: "germination", tips: ["Keep young plants consistently watered while roots establish."] },
      { stage: "vegetative", tips: ["Remove excess suckers, keeping only the follower sucker per plant for the next cycle.", "Watch for Panama wilt and Sigatoka leaf spot."] },
      { stage: "flowering", tips: ["Support the plant against wind once the bunch emerges — top-heavy plants can topple."] },
      { stage: "fruiting", tips: ["Bag the bunch if practiced locally, to protect from pests and improve fruit finish.", "Maintain steady irrigation — banana is water-demanding."] },
      { stage: "maturity", tips: ["Inspect ridge angles on fingers; ridges become rounded as fruit fills."] },
      { stage: "harvest", tips: ["Harvest at the maturity stage matching your transport distance and market."] },
      { stage: "post_harvest", tips: ["Handle bunches carefully — bruised fruit sells for less."] },
    ],
  },
  {
    cropKey: "coconut",
    displayName: "Coconut",
    stages: [
      { stage: "seed_selection", tips: ["Select seedlings from a reliable nursery with a healthy collar and root system."] },
      { stage: "land_preparation", tips: ["Dig pits sized for your soil type, with good drainage."] },
      { stage: "sowing", tips: ["Plant at the start of the rainy season where possible to reduce initial irrigation needs."] },
      { stage: "germination", tips: ["Provide shade and regular water for young palms in their first year."] },
      { stage: "vegetative", tips: ["Water regularly during establishment, especially in the first 2–3 years."] },
      { stage: "flowering", tips: ["Monitor for rhinoceros beetle and red palm weevil, which target the crown."] },
      { stage: "fruiting", tips: ["Maintain consistent irrigation through dry spells to support nut development."] },
      { stage: "maturity", tips: ["Check husk firmness and color depending on whether harvesting tender nuts or mature copra."] },
      { stage: "harvest", tips: ["Harvest interval depends on your variety and intended use (tender nut vs. copra)."] },
      { stage: "post_harvest", tips: ["Store nuts in a dry, ventilated area if not selling immediately."] },
    ],
  },
];

/** Case-insensitive partial match against the crop's stored name (e.g. "Tomato - Hybrid" matches "tomato"). */
export function findCropGuidance(cropName: string | undefined): CropGuidance | null {
  if (!cropName) return null;
  const normalized = cropName.trim().toLowerCase();
  return CROP_GUIDANCE.find((g) => normalized.includes(g.cropKey)) ?? null;
}
