import { getGovernmentConsoleSummary } from "@/lib/services/governmentConsoleService";
import { listAllGrievances } from "@/lib/services/grievanceService";
import { listSchemeCycles } from "@/lib/services/schemeLifecycleService";
import { listSoilCampaigns } from "@/lib/services/soilCampaignService";
import { listFpoInstitutionalSummaries } from "@/lib/services/fpoGovernanceService";
import { listAllAdvisories } from "@/lib/services/governmentAdvisoryService";

// ─────────────────────────────────────────────
// Government AI Assistant Read-Only Tools (Phases 102–121)
// Read-only server tools. Strictly forbidden from autonomous financial or administrative approvals.
// ─────────────────────────────────────────────

export async function get_district_crop_summary(args: { district: string }) {
  const summary = await getGovernmentConsoleSummary(args.district || "Coimbatore");
  return {
    district: args.district,
    cultivatedAcreage: summary.totalAcreage,
    activeCropsCount: summary.activeCropsCount,
    topCrops: ["Hybrid Tomato", "Samba Paddy", "Maize", "Banana", "Turmeric"],
    season: summary.season,
  };
}

export async function get_district_weather_alerts(args: { district: string }) {
  return {
    district: args.district || "Coimbatore",
    activeAlerts: [
      {
        severity: "warning",
        title: "Heavy Rainfall & Isolated Thunderstorms",
        advisory: "Ensure open drainage channels in low-lying vegetable plots.",
      },
    ],
  };
}

export async function get_disease_signal_summary(args: { district: string }) {
  return {
    district: args.district || "Coimbatore",
    signals: [
      {
        crop: "Maize",
        issue: "Fall Armyworm",
        level: "Watch",
        disclaimer: "AI-derived field signal — requires agricultural officer verification.",
      },
      {
        crop: "Tomato",
        issue: "Early Blight",
        level: "Normal",
        disclaimer: "AI-derived field signal — requires agricultural officer verification.",
      },
    ],
  };
}

export async function get_scheme_application_counts(args: { district: string }) {
  const schemes = await listSchemeCycles("district_officer");
  return {
    district: args.district || "Coimbatore",
    activeSchemesCount: schemes.length,
    schemes: schemes.map((s) => ({
      name: s.schemeNameEn,
      status: s.status,
      financialYear: s.financialYear,
    })),
  };
}

export async function get_open_grievance_counts(args: { district: string }) {
  const all = await listAllGrievances(args.district || "Coimbatore");
  const open = all.filter((g) => g.status !== "Resolved" && g.status !== "Closed");
  return {
    district: args.district || "Coimbatore",
    totalOpenGrievances: open.length,
    breakdownByCategory: {
      Subsidy: open.filter((g) => g.category === "Subsidy").length,
      CropInsurance: open.filter((g) => g.category === "Crop Insurance").length,
      SoilTesting: open.filter((g) => g.category === "Soil Testing").length,
    },
  };
}

export async function get_soil_campaign_summary(args: { district: string }) {
  const campaigns = await listSoilCampaigns(args.district || "Coimbatore");
  return {
    district: args.district || "Coimbatore",
    campaigns: campaigns.map((c) => ({
      name: c.name,
      targetSamples: c.targetSamples,
      reportsCompleted: c.reportsCompleted,
      status: c.status,
    })),
  };
}

export async function get_extension_visit_summary(args: { district: string }) {
  return {
    district: args.district || "Coimbatore",
    scheduledVisitsToday: 8,
    completedVisitsThisMonth: 142,
    priorityFollowUps: 4,
  };
}

export async function get_market_price_summary(args: { district: string }) {
  return {
    district: args.district || "Coimbatore",
    commodities: [
      { name: "Tomato", modalPriceRsPerQtl: 2400, trend7d: "-8.5%" },
      { name: "Samba Paddy", modalPriceRsPerQtl: 2350, trend7d: "+1.2%" },
      { name: "Small Onion", modalPriceRsPerQtl: 4200, trend7d: "+15.0%" },
    ],
  };
}

export async function get_fpo_aggregation_summary(args: { district: string }) {
  const fpos = await listFpoInstitutionalSummaries(args.district || "Coimbatore");
  return {
    district: args.district || "Coimbatore",
    activeFposCount: fpos.length,
    fpos: fpos.map((f) => ({
      name: f.name,
      members: f.activeMembersCount,
      activeProcurementRounds: f.activeProcurementRounds,
    })),
  };
}
