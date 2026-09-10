import type { Farm, Crop, LivestockRecord, BeneficiarySegment } from "@/types";

// ─────────────────────────────────────────────
// Phase 113: Farmer Beneficiary Segmentation Engine
// Privacy-safe segmentation strictly for agricultural service delivery (Zero demographic inference).
// ─────────────────────────────────────────────

export function segmentFarmerBeneficiaries(
  farms: Farm[],
  crops: Crop[],
  livestocks: LivestockRecord[] = []
): BeneficiarySegment[] {
  let marginalCount = 0;
  let marginalAcres = 0;
  let smallCount = 0;
  let smallAcres = 0;
  let mediumLargeCount = 0;
  let mediumLargeAcres = 0;

  let rainfedAcres = 0;
  let irrigatedAcres = 0;
  let horticultureAcres = 0;

  farms.forEach((f) => {
    const size = f.areaAcres || 2.0;
    if (size < 2.5) {
      marginalCount++;
      marginalAcres += size;
    } else if (size <= 5.0) {
      smallCount++;
      smallAcres += size;
    } else {
      mediumLargeCount++;
      mediumLargeAcres += size;
    }

    if (f.irrigationType === "rainfed" || !f.irrigationType) {
      rainfedAcres += size;
    } else {
      irrigatedAcres += size;
    }
  });

  crops.forEach((c) => {
    const nameLower = c.name.toLowerCase();
    if (
      nameLower.includes("tomato") ||
      nameLower.includes("banana") ||
      nameLower.includes("mango") ||
      nameLower.includes("turmeric") ||
      nameLower.includes("onion")
    ) {
      horticultureAcres += c.areaAcres || 1.0;
    }
  });

  return [
    {
      segmentKey: "marginal_farmers",
      nameEn: "Marginal Farmers (< 2.5 Acres)",
      nameTa: "குறு விவசாயிகள் (< 2.5 ஏக்கர்)",
      count: marginalCount,
      totalAcreage: Math.round(marginalAcres * 10) / 10,
      criteria: "Total landholding strictly below 2.5 acres",
    },
    {
      segmentKey: "small_farmers",
      nameEn: "Small Farmers (2.5 – 5.0 Acres)",
      nameTa: "சிறு விவசாயிகள் (2.5 – 5.0 ஏக்கர்)",
      count: smallCount,
      totalAcreage: Math.round(smallAcres * 10) / 10,
      criteria: "Total landholding between 2.5 and 5.0 acres",
    },
    {
      segmentKey: "irrigated_farms",
      nameEn: "Micro-Irrigation & Irrigated Farms",
      nameTa: "பாசன வசதி பெற்ற பண்ணைகள்",
      count: farms.filter((f) => f.irrigationType && f.irrigationType !== "rainfed").length,
      totalAcreage: Math.round(irrigatedAcres * 10) / 10,
      criteria: "Borewell, open well, or canal network connection",
    },
    {
      segmentKey: "horticulture_growers",
      nameEn: "Horticulture & Cash Crop Growers",
      nameTa: "தோட்டக்கலை மற்றும் பணப்பயிர் விவசாயிகள்",
      count: crops.length,
      totalAcreage: Math.round(horticultureAcres * 10) / 10,
      criteria: "Active cultivation of fruits, vegetables, or spices",
    },
    {
      segmentKey: "livestock_integrated",
      nameEn: "Mixed Farming & Dairy Keepers",
      nameTa: "கால்நடை வளர்க்கும் ஒருங்கிணைந்த பண்ணையாளர்கள்",
      count: livestocks.length,
      totalAcreage: 0,
      criteria: "Active cattle, goat, or poultry assets recorded",
    },
  ];
}
