import { getDistrictGroundwaterTelemetry } from "@/lib/services/groundwaterService";
import { getAwsStationObservations } from "@/lib/services/awsWeatherService";
import { listCropCuttingExperiments } from "@/lib/services/cceService";
import { listFertilizerStockPoints } from "@/lib/services/fertilizerTrackerService";
import { listSeedLots } from "@/lib/services/seedQualityService";
import { generateSdrfDossier } from "@/lib/services/sdrfDossierService";
import { getCropHealthGisLayers } from "@/lib/services/cropHealthGisService";
import { forecastMarketArrivals } from "@/lib/services/marketArrivalForecastService";
import { listTrainingPrograms } from "@/lib/services/farmerTrainingService";
import { listAgricultureAssets } from "@/lib/services/agricultureAssetService";
import { getAdvancedRemoteSensingIndices } from "@/lib/services/advancedRemoteSensingService";
import { listSolarPumps, getSolarPumpTelemetry } from "@/lib/services/solarPumpService";
import { listColdChainAssets, getColdChainTelemetry } from "@/lib/services/coldChainService";
import { verifyInputRetailer, verifyPesticideProduct } from "@/lib/services/pesticideVerificationService";
import { generateExportComplianceDossier } from "@/lib/services/exportDossierService";
import { listResearchPublications } from "@/lib/services/researchExtensionService";
import { getSoilMicronutrientDeficiency } from "@/lib/services/soilMicronutrientService";
import { getVillageDigitalTwin } from "@/lib/services/villageDigitalTwinService";
import { getMachineryUtilization } from "@/lib/services/machineryUtilizationService";
import { listCropResidueRecords } from "@/lib/services/residueManagementService";
import { listAgriSosReports } from "@/lib/services/agriSosService";
import { listWarehouseCapacities } from "@/lib/services/warehouseCapacityService";
import { listDairyRecords } from "@/lib/services/dairyCooperativeService";
import { listTransportRequests } from "@/lib/services/produceLogisticsService";
import { listDealers } from "@/lib/services/dealerComplianceService";
import { synthesizeStateDecisionPriorities } from "@/lib/services/stateDecisionEngine";

// ─────────────────────────────────────────────
// State Agriculture AI Command Copilot Read-Only Tools (Phases 122–161)
// 100% Read-Only. Absolute restriction against autonomous mutations or financial sanctioning.
// ─────────────────────────────────────────────

export async function get_state_crop_summary(args: { district?: string }) {
  const dist = args.district || "Coimbatore";
  return {
    district: dist,
    totalDigitizedAcreage: 4850.5,
    topCrops: ["Hybrid Tomato", "Samba Paddy", "Maize", "Banana", "Small Onion"],
    activeFarmsCount: 1680,
  };
}

export async function get_groundwater_summary(args: { district?: string }) {
  const telemetry = await getDistrictGroundwaterTelemetry(args.district || "Coimbatore");
  return {
    district: args.district || "Coimbatore",
    stationsCount: telemetry.length,
    readings: telemetry.map((t) => ({
      block: t.block,
      waterLevelMeters: t.waterLevelMeters,
      trend: t.trend,
      qualityFlag: t.qualityFlag,
    })),
  };
}

export async function get_aws_summary(args: { district?: string }) {
  const obs = await getAwsStationObservations(args.district || "Coimbatore");
  return {
    district: args.district || "Coimbatore",
    stations: obs.map((o) => ({
      stationName: o.stationName,
      temperatureC: o.temperatureC,
      rainfallMm24h: o.rainfallMm24h,
      humidityPercent: o.humidityPercent,
    })),
  };
}

export async function get_cce_summary(args: { district?: string }) {
  const cces = await listCropCuttingExperiments(args.district || "Coimbatore");
  return {
    district: args.district || "Coimbatore",
    totalExperiments: cces.length,
    experiments: cces.map((c) => ({
      experimentId: c.experimentId,
      crop: c.crop,
      normalizedYieldQuintalPerHa: c.normalizedYieldQuintalPerHa,
      status: c.status,
    })),
  };
}

export async function get_disease_risk_map(args: { district?: string }) {
  const gis = await getCropHealthGisLayers(args.district || "Coimbatore");
  return {
    district: args.district || "Coimbatore",
    riskLayers: gis.map((g) => ({
      block: g.block,
      healthLevel: g.healthLevel,
      signals: g.diseaseSignalCount,
      weatherRisk: g.weatherRiskLevel,
    })),
  };
}

export async function get_disaster_summary(args: { district?: string }) {
  const dossier = await generateSdrfDossier(args.district || "Coimbatore");
  return {
    district: dossier.district,
    dossierId: dossier.dossierId,
    hazardEvent: dossier.hazardEvent,
    affectedFarmersCount: dossier.affectedFarmersCount,
    totalAcreageDamaged: dossier.totalAcreageDamaged,
    estimatedLossRs: dossier.estimatedLossRs,
  };
}

export async function get_fertilizer_stock(args: { district?: string }) {
  const stocks = await listFertilizerStockPoints(args.district || "Coimbatore");
  return {
    district: args.district || "Coimbatore",
    stockPoints: stocks.map((s) => ({
      warehouse: s.warehouseName,
      fertilizer: s.fertilizerType,
      closingStockTonnes: s.closingStockTonnes,
    })),
  };
}

export async function get_seed_quality_summary(args: { district?: string }) {
  const seeds = await listSeedLots(args.district || "Coimbatore");
  return {
    totalLotsTested: seeds.length,
    certifiedLots: seeds.filter((s) => s.status === "Passed").length,
    lots: seeds.map((s) => ({
      lotNumber: s.lotNumber,
      crop: s.crop,
      category: s.category,
      germinationPercent: s.germinationPercent,
      status: s.status,
    })),
  };
}

export async function get_market_arrival_forecast(args: { district?: string; commodity?: string }) {
  const forecast = forecastMarketArrivals(args.district || "Coimbatore", args.commodity || "Tomato");
  return forecast;
}

export async function get_training_summary(args: { district?: string }) {
  const programs = await listTrainingPrograms(args.district || "Coimbatore");
  return {
    district: args.district || "Coimbatore",
    activeProgramsCount: programs.length,
    programs: programs.map((p) => ({
      title: p.titleEn,
      topic: p.topic,
      scheduledDate: p.scheduledDate,
      enrolledCount: p.enrolledCount,
      capacity: p.capacity,
    })),
  };
}

export async function get_asset_registry_summary(args: { district?: string }) {
  const assets = await listAgricultureAssets(args.district || "Coimbatore");
  return {
    district: args.district || "Coimbatore",
    totalAssetsCount: assets.length,
    assets: assets.map((a) => ({
      name: a.nameEn,
      type: a.assetType,
      status: a.status,
    })),
  };
}

// ── Batch 9 Expanded AI Tools (Phases 142–161) ──

export async function get_remote_sensing_summary(args: { district?: string }) {
  const indices = await getAdvancedRemoteSensingIndices(args.district || "Coimbatore");
  return indices;
}

export async function get_solar_pump_status(args: { pumpId?: string }) {
  const telemetry = getSolarPumpTelemetry(args.pumpId || "KUSUM-PUMP-TN-0081");
  return telemetry;
}

export async function get_cold_chain_alerts(args: { district?: string }) {
  const assets = await listColdChainAssets(args.district || "Coimbatore");
  const alerts = assets.map((a) => ({
    asset: a.name,
    telemetry: getColdChainTelemetry(a.id),
  }));
  return alerts;
}

export async function get_input_retailer_status(args: { dealerCode?: string }) {
  const dealer = await verifyInputRetailer(args.dealerCode || "DEALER-CBE-9941");
  return dealer;
}

export async function get_export_dossier_summary(args: { fpoId?: string }) {
  const dossier = await generateExportComplianceDossier();
  return dossier;
}

export async function get_research_advisories(args: { crop?: string }) {
  const pubs = await listResearchPublications(args.crop);
  return pubs;
}

export async function get_micronutrient_summary(args: { district?: string }) {
  const defs = await getSoilMicronutrientDeficiency(args.district || "Coimbatore");
  return defs;
}

export async function get_village_digital_twin(args: { village?: string }) {
  const twin = await getVillageDigitalTwin(args.village || "Alandurai");
  return twin;
}

export async function get_machine_utilization(args: { district?: string }) {
  const util = await getMachineryUtilization(args.district || "Coimbatore");
  return util;
}

export async function get_residue_management_summary(args: { ownerId?: string }) {
  const records = await listCropResidueRecords(args.ownerId);
  return records;
}

export async function get_agri_sos_summary(args: { district?: string }) {
  const sos = await listAgriSosReports(args.district || "Coimbatore");
  return sos;
}

export async function get_warehouse_capacity(args: { district?: string }) {
  const wh = await listWarehouseCapacities(args.district || "Coimbatore");
  return wh;
}

export async function get_dairy_summary(args: { farmerId?: string }) {
  const dairy = await listDairyRecords(args.farmerId);
  return dairy;
}

export async function get_transport_summary(args: { farmerId?: string }) {
  const reqs = await listTransportRequests(args.farmerId);
  return reqs;
}

export async function get_dealer_compliance(args: { district?: string }) {
  const dlrs = await listDealers(args.district || "Coimbatore");
  return dlrs;
}

export async function get_decision_priorities(args: { district?: string }) {
  const priorities = await synthesizeStateDecisionPriorities(args.district || "Coimbatore");
  return priorities;
}
