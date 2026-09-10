import type {
  Farm,
  Crop,
  HarvestRecord,
  ProduceSale,
  Expense,
  SoilReport,
  DataQualityIssue,
} from "@/types";

// ─────────────────────────────────────────────
// Phase 63: Farm Data Quality Validation Engine
// Proactively audits farmer data integrity and suggests fixes without destructive actions.
// ─────────────────────────────────────────────

export function auditFarmDataQuality(params: {
  farms: Farm[];
  crops: Crop[];
  harvests: HarvestRecord[];
  sales: ProduceSale[];
  expenses: Expense[];
  soilReports: SoilReport[];
}): DataQualityIssue[] {
  const issues: DataQualityIssue[] = [];
  const farmIds = new Set(params.farms.map((f) => f.id));
  const todayStr = new Date().toISOString().slice(0, 10);

  // 1. Check crops with orphaned or unassigned farmId
  params.crops.forEach((c) => {
    if (c.farmId && !farmIds.has(c.farmId)) {
      issues.push({
        id: `dq_crop_farm_${c.id}`,
        severity: "WARNING",
        category: "crop",
        issueEn: `Crop '${c.name}' is linked to a farm that is not in your active records.`,
        issueTa: `'${c.name}' பயிர் உங்கள் பட்டியலில் இல்லாத பண்ணையுடன் இணைக்கப்பட்டுள்ளது.`,
        suggestionEn: "Reassign this crop to one of your active farms in the Farm Portfolio.",
        suggestionTa: "பண்ணை பக்கத்தில் இந்த பயிரை சரியான பண்ணையுடன் இணைக்கவும்.",
        entityId: c.id,
      });
    }
  });

  // 2. Check harvest dates vs sowing dates
  const cropMap = new Map(params.crops.map((c) => [c.id, c]));
  params.harvests.forEach((h) => {
    const crop = h.cropId ? cropMap.get(h.cropId) : undefined;
    if (crop?.sowingDate && h.harvestDate < crop.sowingDate) {
      issues.push({
        id: `dq_harvest_date_${h.id}`,
        severity: "CRITICAL",
        category: "harvest",
        issueEn: `Harvest date (${h.harvestDate}) occurs before the recorded sowing date (${crop.sowingDate}) for ${crop.name}.`,
        issueTa: `அறுவடை தேதி (${h.harvestDate}) விதைப்பு தேதிக்கு (${crop.sowingDate}) முன்னதாக உள்ளது.`,
        suggestionEn: "Correct either the sowing date or harvest date in the Harvest Tracker.",
        suggestionTa: "அறுவடை பதிவேட்டில் சரியான தேதியை திருத்தவும்.",
        entityId: h.id,
      });
    }
  });

  // 3. Check for negative financial amounts
  params.expenses.forEach((e) => {
    if (e.amount < 0) {
      issues.push({
        id: `dq_neg_expense_${e.id}`,
        severity: "CRITICAL",
        category: "finance",
        issueEn: `Expense '${e.note || "Unspecified"}' has a negative amount (₹${e.amount}).`,
        issueTa: `செலவு தொகையில் எதிர்மறை எண் (₹${e.amount}) பதிவாகியுள்ளது.`,
        suggestionEn: "Edit the expense entry to a positive value in the Finance Ledger.",
        suggestionTa: "நிதிப் பக்கத்தில் செலவு தொகையை நேர்மறை எண்ணாக மாற்றவும்.",
        entityId: e.id,
      });
    }
  });

  // 4. Check orphan soil reports
  params.soilReports.forEach((s) => {
    if (s.farmId && !farmIds.has(s.farmId)) {
      issues.push({
        id: `dq_soil_farm_${s.id}`,
        severity: "INFO",
        category: "soil",
        issueEn: `Soil test report dated ${s.sampleDate} is unlinked from an active farm.`,
        issueTa: `${s.sampleDate} தேதியிட்ட மண் பரிசோதனை அறிக்கை பண்ணையுடன் இணைக்கப்படவில்லை.`,
        suggestionEn: "Assign this soil health card to your primary farm.",
        suggestionTa: "இந்த மண் பரிசோதனை அறிக்கையை முதன்மை பண்ணையுடன் இணைக்கவும்.",
        entityId: s.id,
      });
    }
  });

  return issues;
}
