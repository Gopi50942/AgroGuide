import type { SoilHealthCampaign, SoilReport } from "@/types";

// ─────────────────────────────────────────────
// Phase 115: Soil Health Campaign Management Service
// Government soil testing drives, sample quotas, and aggregate nutrient telemetry.
// ─────────────────────────────────────────────

let inMemoryCampaigns: SoilHealthCampaign[] = [
  {
    id: "camp_soil_2026",
    name: "Coimbatore West Village Soil Testing Drive 2026",
    district: "Coimbatore",
    block: "Thondamuthur",
    startDate: "2026-04-01",
    endDate: "2026-08-31",
    targetSamples: 500,
    samplesCollected: 380,
    reportsCompleted: 340,
    abnormalPhCount: 42,
    lowOrganicCarbonCount: 110,
    status: "Active",
  },
  {
    id: "camp_soil_tnj_2026",
    name: "Delta Region Paddy Soil Nutrient Health Campaign",
    district: "Thanjavur",
    block: "Kumbakonam",
    startDate: "2026-05-01",
    endDate: "2026-09-30",
    targetSamples: 750,
    samplesCollected: 520,
    reportsCompleted: 490,
    abnormalPhCount: 30,
    lowOrganicCarbonCount: 95,
    status: "Active",
  },
];

export async function createSoilCampaign(
  name: string,
  district: string,
  block: string,
  startDate: string,
  endDate: string,
  targetSamples: number
): Promise<SoilHealthCampaign> {
  const campaign: SoilHealthCampaign = {
    id: `camp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    district,
    block,
    startDate,
    endDate,
    targetSamples,
    samplesCollected: 0,
    reportsCompleted: 0,
    abnormalPhCount: 0,
    lowOrganicCarbonCount: 0,
    status: "Planning",
  };

  inMemoryCampaigns.unshift(campaign);
  return campaign;
}

export async function listSoilCampaigns(districtFilter?: string): Promise<SoilHealthCampaign[]> {
  if (!districtFilter || districtFilter === "ALL") return inMemoryCampaigns;
  return inMemoryCampaigns.filter((c) => c.district.toLowerCase() === districtFilter.toLowerCase());
}

export function aggregateCampaignMetrics(
  campaign: SoilHealthCampaign,
  completedReports: SoilReport[] = []
): SoilHealthCampaign {
  let abnormalPh = 0;
  let lowCarbon = 0;

  completedReports.forEach((r) => {
    if (r.ph && (r.ph < 6.0 || r.ph > 8.0)) abnormalPh++;
    if (r.organicCarbon && r.organicCarbon < 0.5) lowCarbon++;
  });

  return {
    ...campaign,
    reportsCompleted: campaign.reportsCompleted + completedReports.length,
    abnormalPhCount: campaign.abnormalPhCount + abnormalPh,
    lowOrganicCarbonCount: campaign.lowOrganicCarbonCount + lowCarbon,
  };
}
