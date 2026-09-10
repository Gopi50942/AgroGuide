"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Sprout,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Download,
  MapPin,
  ClipboardList,
  Activity,
  Send,
  Radio,
  FileText,
  Filter,
  CheckCircle,
  Eye,
  RefreshCw,
  Search,
  Truck,
  Droplets,
  Award,
  Bot,
  Layers,
  Plane,
  FileSpreadsheet,
  Sun,
  Thermometer,
  ShieldAlert,
  Database,
  Network,
  Compass,
  Check,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { getDistricts, getBlocks, getVillages } from "@/lib/services/adminGeographyService";
import {
  getGovernmentConsoleSummary,
  type GovernmentConsoleMetrics,
} from "@/lib/services/governmentConsoleService";
import { listAllGrievances, updateGrievanceStatus, escalateGrievance } from "@/lib/services/grievanceService";
import { listSchemeCycles, createSchemeCycle } from "@/lib/services/schemeLifecycleService";
import { listAllSubsidyEvidence, reviewSubsidyEvidence } from "@/lib/services/subsidyEvidenceService";
import { listAllProgramEnrollments } from "@/lib/services/farmerRegistryService";
import { listAllAdvisories, createAdvisoryDraft, approveAndPublishAdvisory } from "@/lib/services/governmentAdvisoryService";
import { listSoilCampaigns } from "@/lib/services/soilCampaignService";
import { listFpoInstitutionalSummaries } from "@/lib/services/fpoGovernanceService";
import { generateMisReport, exportMisReportCsv } from "@/lib/services/governmentMisService";
import { listCropCuttingExperiments, recordCropCuttingExperiment } from "@/lib/services/cceService";
import { listFertilizerStockPoints, listFertilizerMovements } from "@/lib/services/fertilizerTrackerService";
import { listSeedLots, recordSeedLot } from "@/lib/services/seedQualityService";
import { generateSdrfDossier } from "@/lib/services/sdrfDossierService";
import { listEquipmentAssets, listEquipmentBookings, createEquipmentBooking } from "@/lib/services/fleetSchedulerService";
import { getSatelliteVegetationIndices } from "@/lib/services/remoteSensingService";
import { getCropHealthGisLayers } from "@/lib/services/cropHealthGisService";
import { getDistrictGroundwaterTelemetry } from "@/lib/services/groundwaterService";
import { getAwsStationObservations } from "@/lib/services/awsWeatherService";
import { synthesizeStateDecisionPriorities } from "@/lib/services/stateDecisionEngine";
import { listVillageDigitalTwins } from "@/lib/services/villageDigitalTwinService";
import { listAgriSosReports, updateAgriSosStatus } from "@/lib/services/agriSosService";
import { listColdChainAssets, getColdChainTelemetry } from "@/lib/services/coldChainService";
import { listSolarPumps, getSolarPumpTelemetry } from "@/lib/services/solarPumpService";
import { listDealers } from "@/lib/services/dealerComplianceService";
import { listAllKnowledgeNodes, queryKnowledgeGraph } from "@/lib/services/agricultureKnowledgeGraphService";
import type {
  GovernmentUserRole,
  FarmerGrievance,
  GovernmentSchemeCycle,
  SubsidyEvidence,
  GovernmentAdvisory,
  SoilHealthCampaign,
  FpoInstitutionalSummary,
  FarmerServiceEnrollment,
  CropCuttingExperiment,
  FertilizerStockPoint,
  FertilizerMovement,
  SeedLot,
  SdrfDisasterDossier,
  EquipmentAsset,
  EquipmentBooking,
  CropHealthGisLayer,
  RemoteSensingIndexData,
  GroundwaterStationTelemetry,
  AwsStationObservation,
  StateDecisionPriority,
  VillageDigitalTwin,
  AgriSosReport,
  ColdChainAsset,
  ColdChainTelemetry,
  SolarPumpAsset,
  SolarPumpTelemetry,
  AgriDealerComplianceEntry,
  KnowledgeGraphNode,
} from "@/types";

export default function GovernmentConsolePage() {
  const { profile } = useAuth();
  const { t, language } = useLanguage();

  const [role, setRole] = useState<GovernmentUserRole>("district_officer");
  const [selectedDistrict, setSelectedDistrict] = useState("Coimbatore");
  const [selectedBlock, setSelectedBlock] = useState("ALL");
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "priorities"
    | "twin"
    | "sos"
    | "iot"
    | "gis"
    | "cce"
    | "fertilizer"
    | "seed"
    | "dealers"
    | "sdrf"
    | "fleet"
    | "opendata"
    | "graph"
    | "copilot"
    | "governance"
  >("overview");

  const [metrics, setMetrics] = useState<GovernmentConsoleMetrics | null>(null);
  const [priorities, setPriorities] = useState<StateDecisionPriority[]>([]);
  const [twins, setTwins] = useState<VillageDigitalTwin[]>([]);
  const [sosReports, setSosReports] = useState<AgriSosReport[]>([]);
  const [coldAssets, setColdAssets] = useState<ColdChainAsset[]>([]);
  const [solarPumps, setSolarPumps] = useState<SolarPumpAsset[]>([]);
  const [dealers, setDealers] = useState<AgriDealerComplianceEntry[]>([]);
  const [cces, setCces] = useState<CropCuttingExperiment[]>([]);
  const [fertilizers, setFertilizers] = useState<FertilizerStockPoint[]>([]);
  const [rakes, setRakes] = useState<FertilizerMovement[]>([]);
  const [seeds, setSeeds] = useState<SeedLot[]>([]);
  const [dossier, setDossier] = useState<SdrfDisasterDossier | null>(null);
  const [assets, setAssets] = useState<EquipmentAsset[]>([]);
  const [gisLayers, setGisLayers] = useState<CropHealthGisLayer[]>([]);
  const [satellite, setSatellite] = useState<RemoteSensingIndexData | null>(null);
  const [groundwater, setGroundwater] = useState<GroundwaterStationTelemetry[]>([]);
  const [copilotQuery, setCopilotQuery] = useState("");
  const [copilotAnswer, setCopilotAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  // Load console data
  const loadConsoleData = async () => {
    setLoading(true);
    try {
      const summary = await getGovernmentConsoleSummary(selectedDistrict, selectedBlock, role);
      setMetrics(summary);

      const prios = await synthesizeStateDecisionPriorities(selectedDistrict);
      setPriorities(prios);

      const vilTwins = await listVillageDigitalTwins(selectedDistrict);
      setTwins(vilTwins);

      const sosList = await listAgriSosReports(selectedDistrict);
      setSosReports(sosList);

      const coldList = await listColdChainAssets(selectedDistrict);
      setColdAssets(coldList);

      const pumpList = await listSolarPumps(selectedDistrict);
      setSolarPumps(pumpList);

      const dlrList = await listDealers(selectedDistrict);
      setDealers(dlrList);

      const cceList = await listCropCuttingExperiments(selectedDistrict);
      setCces(cceList);

      const fertList = await listFertilizerStockPoints(selectedDistrict);
      setFertilizers(fertList);

      const rakeList = await listFertilizerMovements(selectedDistrict);
      setRakes(rakeList);

      const seedList = await listSeedLots(selectedDistrict);
      setSeeds(seedList);

      const sdrfRep = await generateSdrfDossier(selectedDistrict);
      setDossier(sdrfRep);

      const assetList = await listEquipmentAssets(selectedDistrict);
      setAssets(assetList);

      const gis = await getCropHealthGisLayers(selectedDistrict);
      setGisLayers(gis);

      const sat = await getSatelliteVegetationIndices(selectedDistrict);
      setSatellite(sat);

      const gw = await getDistrictGroundwaterTelemetry(selectedDistrict);
      setGroundwater(gw);
    } catch (err) {
      console.error("Failed to load console data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsoleData();
  }, [selectedDistrict, selectedBlock, role]);

  const districts = getDistricts("TN");

  const handleExportMis = async () => {
    const rep = await generateMisReport("district_kpi", selectedDistrict, selectedBlock);
    const csvContent = exportMisReportCsv(rep);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${rep.reportId}_AgroGuide_MIS.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopilotAsk = () => {
    if (!copilotQuery) return;
    const qLower = copilotQuery.toLowerCase();
    if (qLower.includes("sos") || qLower.includes("emergency")) {
      setCopilotAnswer(
        `Agri SOS Rapid Response (${selectedDistrict}): 1 active distress report in Alandurai (Flood waterlogging in 1.5 acres tomato). Assigned to Extension Officer Muthukumar.`
      );
    } else if (qLower.includes("solar") || qLower.includes("pump")) {
      setCopilotAnswer(
        `IoT Solar Pump Telemetry: Pump KUSUM-PUMP-TN-0081 (5 HP) is Active. Operating at 2,850 RPM, discharging 180 LPM (3.8 kW). Total 61,200 Litres water delivered today.`
      );
    } else if (qLower.includes("cold") || qLower.includes("temperature")) {
      setCopilotAnswer(
        `Cold Chain Status: Udumalpet Cold Storage is operating normally at 4.2°C (Set: 4.0°C). Reefer Transit Truck 12T is in transit at 2.5°C with zero excursion alerts.`
      );
    } else if (qLower.includes("fertilizer") || qLower.includes("dap") || qLower.includes("urea")) {
      setCopilotAnswer(
        `Decision Priority: DAP buffer is 370 Tonnes against 14-day requirement of 620 Tonnes. Inbound RAKE-SR-2026-8812 allocation of 400 Tonnes recommended.`
      );
    } else {
      setCopilotAnswer(
        `State Agriculture Intelligence Summary: ${selectedDistrict} has 4,850.5 cultivated acres across 18 active crops. Crop health GIS is at Normal/Watch level. Village Digital Twin indicates 95 acres harvest expected in Alandurai in next 14 days.`
      );
    }
  };

  return (
    <main className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="card p-6 bg-gradient-to-r from-forest-800 to-forest-950 text-cream-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-forest-700 shadow-md">
        <div>
          <div className="flex items-center gap-2.5">
            <Building2 className="text-earth-300" size={26} />
            <h1 className="text-2xl font-bold tracking-tight">
              {language === "ta" ? "மாநில வேளாண்மை கட்டுப்பாட்டு மையம்" : "State Agriculture Command Center"}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-earth-500/30 text-earth-200 rounded-full border border-earth-400/40">
              V4.0 STATE DIGITAL INFRASTRUCTURE
            </span>
          </div>
          <p className="text-sm text-cream-200/80 mt-1">
            {language === "ta"
              ? "மாநில வேளாண் டிஜிட்டல் உள்கட்டமைப்பு, கிராம ட்வின், அவசர SOS, மற்றும் திறந்த தரவு தளம்"
              : "State Agriculture Digital Infrastructure, Village Digital Twin, Disaster SOS & Open Data Exchange"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role selector */}
          <div className="bg-forest-900/90 border border-forest-600 rounded-xl px-3 py-1.5 text-xs flex items-center gap-2">
            <span className="text-cream-300 font-medium">Role:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as GovernmentUserRole)}
              className="bg-transparent text-cream-50 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="extension_officer" className="bg-forest-900 text-cream-50">Extension Officer</option>
              <option value="block_officer" className="bg-forest-900 text-cream-50">Block Officer</option>
              <option value="district_officer" className="bg-forest-900 text-cream-50">District Officer</option>
              <option value="state_admin" className="bg-forest-900 text-cream-50">State Admin</option>
              <option value="system_admin" className="bg-forest-900 text-cream-50">System Admin</option>
            </select>
          </div>

          {/* District filter */}
          <div className="bg-forest-900/90 border border-forest-600 rounded-xl px-3 py-1.5 text-xs flex items-center gap-2">
            <MapPin size={14} className="text-earth-300" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-transparent text-cream-50 font-semibold focus:outline-none cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d.id} value={d.nameEn} className="bg-forest-900 text-cream-50">
                  {d.nameEn} ({d.nameTa})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportMis}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-earth-600 hover:bg-earth-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Download size={14} /> Export MIS
          </button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-forest-100 text-xs scrollbar-thin">
        {[
          { id: "overview", label: "Overview", icon: Activity },
          { id: "priorities", label: "Decision Priorities", icon: Compass },
          { id: "twin", label: "Village Digital Twin", icon: Layers },
          { id: "sos", label: "Disaster SOS Queue", icon: ShieldAlert },
          { id: "iot", label: "Solar IoT & Cold Chain", icon: Thermometer },
          { id: "gis", label: "State GIS & NDVI", icon: Layers },
          { id: "cce", label: "CCE Yield Ledger", icon: ClipboardList },
          { id: "fertilizer", label: "Fertilizer Rakes", icon: Truck },
          { id: "seed", label: "Seed Testing", icon: Award },
          { id: "dealers", label: "Dealer Compliance", icon: CheckCircle },
          { id: "sdrf", label: "SDRF Dossier", icon: FileSpreadsheet },
          { id: "fleet", label: "Drone / Fleet", icon: Plane },
          { id: "opendata", label: "Open Data API", icon: Database },
          { id: "graph", label: "Knowledge Graph", icon: Network },
          { id: "copilot", label: "State AI Copilot", icon: Bot },
          { id: "governance", label: "Governance & RBAC", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-forest-700 text-cream-50 shadow-sm"
                  : "bg-cream-50 text-ink-light hover:bg-forest-50 hover:text-ink border border-forest-100/60"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Views */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="card p-4 border border-forest-100 bg-white">
              <p className="text-xs font-semibold text-ink-light">Digitized Acreage</p>
              <p className="text-2xl font-bold text-forest-800 mt-1">{metrics?.totalAcreage ?? "4,850"} ac</p>
              <span className="text-[10px] text-forest-600 font-medium">NDVI Index: 0.68</span>
            </div>
            <div className="card p-4 border border-forest-100 bg-white">
              <p className="text-xs font-semibold text-ink-light">Decision Priorities</p>
              <p className="text-2xl font-bold text-forest-800 mt-1">{priorities.length}</p>
              <span className="text-[10px] text-amber-700 font-medium">1 High Priority review</span>
            </div>
            <div className="card p-4 border border-forest-100 bg-white">
              <p className="text-xs font-semibold text-ink-light">Active SOS Alerts</p>
              <p className="text-2xl font-bold text-forest-800 mt-1">{sosReports.length}</p>
              <span className="text-[10px] text-rust-700 font-medium">Officer Assigned</span>
            </div>
            <div className="card p-4 border border-forest-100 bg-white">
              <p className="text-xs font-semibold text-ink-light">Solar IoT Pumps</p>
              <p className="text-2xl font-bold text-forest-800 mt-1">{solarPumps.length}</p>
              <span className="text-[10px] text-emerald-700 font-medium">100% telemetry online</span>
            </div>
            <div className="card p-4 border border-forest-100 bg-white">
              <p className="text-xs font-semibold text-ink-light">Cold Chain Assets</p>
              <p className="text-2xl font-bold text-forest-800 mt-1">{coldAssets.length}</p>
              <span className="text-[10px] text-blue-700 font-medium">Zero temp excursions</span>
            </div>
            <div className="card p-4 border border-forest-100 bg-white">
              <p className="text-xs font-semibold text-ink-light">Verified Dealers</p>
              <p className="text-2xl font-bold text-forest-800 mt-1">{dealers.length}</p>
              <span className="text-[10px] text-forest-600 font-medium">State compliance active</span>
            </div>
          </div>

          {/* Quick Decision Priorities & Village Twin Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 border border-forest-100 space-y-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Compass size={16} className="text-forest-600" />
                State Agriculture Decision Priorities
              </h3>
              <div className="space-y-2.5 text-xs">
                {priorities.map((p) => (
                  <div key={p.id} className="p-3.5 rounded-xl bg-cream-50 border border-forest-100/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink">{p.titleEn}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          p.priorityLevel === "HIGH PRIORITY"
                            ? "bg-amber-100 text-amber-800"
                            : p.priorityLevel === "WATCH"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {p.priorityLevel}
                      </span>
                    </div>
                    <p className="text-ink-light text-[11px]">{p.descriptionEn}</p>
                    <p className="text-forest-700 text-[11px] font-semibold pt-1">
                      Action: {p.recommendedActionEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5 border border-forest-100 space-y-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Layers size={16} className="text-forest-600" />
                Village Agriculture Digital Twin Snapshot
              </h3>
              <div className="space-y-2.5 text-xs">
                {twins.map((twin) => (
                  <div key={twin.villageId} className="p-3.5 rounded-xl bg-cream-50 border border-forest-100/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink">
                        {twin.villageName} ({twin.block} Block)
                      </span>
                      <span className="text-forest-700 font-bold">{twin.totalCultivatedAcres} ac</span>
                    </div>
                    <p className="text-ink-light text-[11px]">
                      Stages: {twin.activeCropStages.join(", ")} • Rain Risk: {twin.rainfallRiskLevel}
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-1 text-forest-900 font-medium">
                      <span>Harvest next 14 days: <strong>{twin.harvestExpected14DaysAcres} acres</strong></span>
                      <span className="text-ink-light">Cohort: {twin.farmerCohortCount} farms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decision Priorities Tab */}
      {activeTab === "priorities" && (
        <div className="card p-6 border border-forest-100 space-y-4">
          <div className="border-b border-forest-100 pb-3">
            <h2 className="text-base font-bold text-ink">State Agriculture Decision Intelligence Priorities</h2>
            <p className="text-xs text-ink-light">
              Deterministic decision-support synthesis integrating weather, inputs, pest signals, and storage capacities.
            </p>
          </div>

          <div className="space-y-3">
            {priorities.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-forest-100 bg-white text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-ink">{p.titleEn}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      p.priorityLevel === "HIGH PRIORITY"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : p.priorityLevel === "WATCH"
                        ? "bg-blue-100 text-blue-900 border border-blue-300"
                        : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    }`}
                  >
                    {p.priorityLevel}
                  </span>
                </div>
                <p className="text-ink-light leading-relaxed">{p.descriptionEn}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-cream-50 p-2.5 rounded-lg border border-forest-100/60">
                  <div><strong>Data Source:</strong> {p.dataSource} ({p.freshness})</div>
                  <div><strong>Geographic Coverage:</strong> {p.coverage}</div>
                </div>
                <p className="text-forest-800 font-semibold text-xs pt-1">
                  💡 Recommended Institutional Action: {p.recommendedActionEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Village Digital Twin Tab */}
      {activeTab === "twin" && (
        <div className="card p-6 border border-forest-100 space-y-4">
          <div className="border-b border-forest-100 pb-3">
            <h2 className="text-base font-bold text-ink">Village Agriculture Digital Twin Operational Model</h2>
            <p className="text-xs text-ink-light">
              Aggregated village operational model mapping active growth stages, weather exposure, and harvest windows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {twins.map((twin) => (
              <div key={twin.villageId} className="p-5 rounded-xl border border-forest-100 bg-white text-xs space-y-3">
                <div className="flex items-center justify-between font-bold text-ink">
                  <span className="text-sm text-forest-800">{twin.villageName} ({twin.block})</span>
                  <span className="px-2.5 py-1 rounded-full bg-forest-100 text-forest-800 text-[11px]">
                    {twin.totalCultivatedAcres} Total Acres
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-ink-light text-[11px]">Crop Acreage Distribution:</p>
                  <div className="grid grid-cols-2 gap-2 text-ink font-medium">
                    {Object.entries(twin.cropAcreageBreakdown).map(([crop, acres]) => (
                      <div key={crop} className="bg-cream-50 p-2 rounded-lg border border-forest-100/60">
                        {crop}: <strong>{acres} ac</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>Rainfall Risk: <strong>{twin.rainfallRiskLevel}</strong></div>
                  <div>Pest Signal: <strong>{twin.pestSignalLevel}</strong></div>
                  <div>Harvest next 14 days: <strong className="text-forest-700">{twin.harvestExpected14DaysAcres} ac</strong></div>
                  <div>Participating Farms: <strong>{twin.farmerCohortCount}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disaster SOS Rapid Response Tab */}
      {activeTab === "sos" && (
        <div className="card p-6 border border-forest-100 space-y-4">
          <div className="border-b border-forest-100 pb-3">
            <h2 className="text-base font-bold text-ink">Farmer Disaster SOS & Rapid Response Queue</h2>
            <p className="text-xs text-ink-light">
              Agricultural emergency distress intake for flood waterlogging, hail damage, and canal breaches.
            </p>
          </div>

          <div className="space-y-3">
            {sosReports.map((sos) => (
              <div key={sos.id} className="p-4 rounded-xl border border-rust-200 bg-rust-50/30 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-ink">
                  <span className="font-mono text-rust-900">{sos.id} — {sos.emergencyType.replace("_", " ").toUpperCase()}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rust-100 text-rust-800 text-[10px] font-semibold">
                    {sos.status}
                  </span>
                </div>
                <p className="text-ink">{sos.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-ink-light text-[11px]">
                  <div>Farmer: <strong>{sos.farmerName}</strong></div>
                  <div>Location: <strong>{sos.village} ({sos.block})</strong></div>
                  <div>Severity: <strong className="text-rust-700 uppercase">{sos.severity}</strong></div>
                  <div>Officer: <strong>{sos.assignedOfficerName || "Unassigned"}</strong></div>
                </div>
                <p className="text-[10px] text-rust-900 italic border-t border-rust-200/60 pt-1.5">
                  * {sos.disclaimer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IoT Solar Pumps & Cold Chain Tab */}
      {activeTab === "iot" && (
        <div className="card p-6 border border-forest-100 space-y-4">
          <div className="border-b border-forest-100 pb-3">
            <h2 className="text-base font-bold text-ink">IoT Solar Pump & Cold Chain Telemetry Infrastructure</h2>
            <p className="text-xs text-ink-light">
              PM-KUSUM solar pump runtime telemetry and cold storage temperature monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Sun size={16} className="text-amber-600" />
                PM-KUSUM Smart Solar Pumps
              </h3>
              {solarPumps.map((p) => {
                const telem = getSolarPumpTelemetry(p.pumpId);
                return (
                  <div key={p.pumpId} className="p-3.5 rounded-xl border border-forest-100 bg-white text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-ink">
                      <span>{p.pumpId} ({p.hpRating} HP)</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">{p.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-ink">
                      <div>RPM: <strong>{telem.rpm}</strong></div>
                      <div>Flow Rate: <strong>{telem.flowRateLpm} LPM</strong></div>
                      <div>Power: <strong>{telem.powerKw} kW</strong></div>
                      <div>Water Delivered: <strong>{telem.estimatedWaterDeliveredLitres.toLocaleString()} L</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Thermometer size={16} className="text-blue-600" />
                State Cold Chain Units
              </h3>
              {coldAssets.map((c) => {
                const telem = getColdChainTelemetry(c.id);
                return (
                  <div key={c.id} className="p-3.5 rounded-xl border border-forest-100 bg-white text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-ink">
                      <span>{c.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px]">{c.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-ink">
                      <div>Current Temp: <strong className="text-blue-700">{telem.temperatureC}°C</strong></div>
                      <div>Target Set: <strong>{c.temperatureSetPointC}°C</strong></div>
                      <div>Humidity: <strong>{telem.humidityPercent}%</strong></div>
                      <div>Excursion: <strong>{telem.excursionAlert ? "ALERT" : "None"}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Agri Input Dealer Registry Tab */}
      {activeTab === "dealers" && (
        <div className="card p-6 border border-forest-100 space-y-4">
          <div className="border-b border-forest-100 pb-3">
            <h2 className="text-base font-bold text-ink">Agri Input Dealer Compliance Registry</h2>
            <p className="text-xs text-ink-light">
              Verified licensing records for fertilizer, certified seed, and authorized pesticide retailers.
            </p>
          </div>

          <div className="space-y-3">
            {dealers.map((d) => (
              <div key={d.dealerId} className="p-4 rounded-xl border border-forest-100 bg-white text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-ink">
                  <span>{d.businessName}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                    {d.complianceStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-ink-light text-[11px]">
                  <div>Category: <strong className="uppercase text-ink">{d.category}</strong></div>
                  <div>License: <strong className="text-ink">{d.licenseNumber}</strong></div>
                  <div>Block: <strong>{d.block} ({d.district})</strong></div>
                  <div>Valid Till: <strong>{d.licenseExpiry}</strong></div>
                </div>
                <p className="text-[10px] text-ink-light">Verified by: {d.verifiedSource}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open Data Exchange Tab */}
      {activeTab === "opendata" && (
        <div className="card p-6 border border-forest-100 space-y-4">
          <div className="border-b border-forest-100 pb-3">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Database size={18} className="text-forest-700" />
              State Agriculture Open Data Exchange (ODX)
            </h2>
            <p className="text-xs text-ink-light">
              Public privacy-sanitized open API feeds enforcing minimum 5-farm cohort masking and zero personal data exposure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {[
              {
                name: "Crop Acreage Open Feed",
                path: "/api/open-data/v1/crop-acreage",
                desc: "District and block level aggregated crop acreage and participating farm cohorts.",
              },
              {
                name: "Market Price Trends Feed",
                path: "/api/open-data/v1/market-trends",
                desc: "Mandi modal prices, 7-day price trends, and volatility classifications.",
              },
              {
                name: "Weather Risk Open Feed",
                path: "/api/open-data/v1/weather-risk",
                desc: "Regional agro-meteorological hazard indicators and operational alerts.",
              },
              {
                name: "Soil Aggregate Open Feed",
                path: "/api/open-data/v1/soil-aggregate",
                desc: "District soil pH and micronutrient deficiency statistics (Zinc, Boron, Carbon).",
              },
            ].map((feed) => (
              <div key={feed.path} className="p-4 rounded-xl border border-forest-100 bg-cream-50/60 space-y-2">
                <p className="font-bold text-ink">{feed.name}</p>
                <code className="text-[11px] font-mono bg-white px-2 py-1 rounded border border-forest-100 block text-forest-800">
                  {feed.path}
                </code>
                <p className="text-ink-light text-[11px]">{feed.desc}</p>
                <a
                  href={feed.path}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-forest-700 hover:text-forest-900 inline-block pt-1"
                >
                  View JSON Endpoint →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Knowledge Graph Tab */}
      {activeTab === "graph" && (
        <div className="card p-6 border border-forest-100 space-y-4">
          <div className="border-b border-forest-100 pb-3">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Network size={18} className="text-forest-700" />
              Rural Agriculture Knowledge Graph Explorer
            </h2>
            <p className="text-xs text-ink-light">
              Structured agronomic entity relationships backed by verified university research evidence.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-forest-50/50 border border-forest-100 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-forest-900">
              <span>Selected Entity: Tomato (Solanum lycopersicum)</span>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-white border border-forest-100 space-y-1">
                <span className="font-semibold text-ink">Tomato → susceptible_to → Early Blight</span>
                <p className="text-ink-light text-[11px]">Evidence: TNAU Crop Protection Guide 2026: Foliar fungal attack favored by warm humid canopy.</p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-forest-100 space-y-1">
                <span className="font-semibold text-ink">Tomato → requires → Drip Fertigation</span>
                <p className="text-ink-light text-[11px]">Evidence: Reduces foliar wetting and saves 40-50% irrigation water.</p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-forest-100 space-y-1">
                <span className="font-semibold text-ink">PMKSY Scheme → supports → Drip Fertigation</span>
                <p className="text-ink-light text-[11px]">Evidence: Provides up to 100% subsidy for small/marginal farmers.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State AI Command Copilot Tab */}
      {activeTab === "copilot" && (
        <div className="card p-6 border border-forest-100 space-y-4">
          <div className="border-b border-forest-100 pb-3">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Bot size={20} className="text-forest-700" />
              State Agriculture AI Command Copilot
            </h2>
            <p className="text-xs text-ink-light">
              Read-only institutional decision assistant. Forbidden from autonomous financial sanctions or status mutations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask state copilot (e.g., 'What is the fertilizer stock?', 'Check SOS alerts', 'Review solar pump telemetry')..."
              value={copilotQuery}
              onChange={(e) => setCopilotQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCopilotAsk()}
              className="flex-1 text-xs p-3 rounded-xl border border-forest-200 focus:outline-none focus:ring-1 focus:ring-forest-500"
            />
            <button
              onClick={handleCopilotAsk}
              className="px-4 py-3 bg-forest-700 hover:bg-forest-800 text-cream-50 rounded-xl text-xs font-semibold"
            >
              Ask Copilot
            </button>
          </div>

          {copilotAnswer && (
            <div className="p-4 rounded-xl bg-forest-50/70 border border-forest-200 text-xs text-ink space-y-1">
              <p className="font-bold text-forest-900 flex items-center gap-1.5">
                <Bot size={14} /> State Copilot Analysis:
              </p>
              <p className="leading-relaxed">{copilotAnswer}</p>
            </div>
          )}
        </div>
      )}

      {/* Governance & RBAC Tab */}
      {activeTab === "governance" && (
        <div className="card p-6 border border-forest-100 space-y-4">
          <div className="border-b border-forest-100 pb-3">
            <h2 className="text-base font-bold text-ink">State Platform Governance & Institutional RBAC</h2>
            <p className="text-xs text-ink-light">
              Multi-tiered permissions ensuring strict farmer privacy, zero Aadhaar storage, and consent gates.
            </p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cream-100/80 text-left text-ink font-semibold">
                  <th className="p-2.5 border border-forest-100">Role</th>
                  <th className="p-2.5 border border-forest-100">Scope of Access</th>
                  <th className="p-2.5 border border-forest-100">Private Records Allowed?</th>
                  <th className="p-2.5 border border-forest-100">Scheme / CCE Publishing</th>
                  <th className="p-2.5 border border-forest-100">Broadcast Authority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-50">
                <tr>
                  <td className="p-2.5 font-bold border border-forest-100">Farmer</td>
                  <td className="p-2.5 border border-forest-100">Own digitized farms & crops</td>
                  <td className="p-2.5 border border-forest-100 text-emerald-600 font-semibold">Own data only</td>
                  <td className="p-2.5 border border-forest-100 text-ink-light">Read-only</td>
                  <td className="p-2.5 border border-forest-100 text-ink-light">None</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold border border-forest-100">Extension Officer</td>
                  <td className="p-2.5 border border-forest-100">Assigned village / consented farmers</td>
                  <td className="p-2.5 border border-forest-100 text-amber-600 font-semibold">Consented only</td>
                  <td className="p-2.5 border border-forest-100 text-ink-light">CCE Draft only</td>
                  <td className="p-2.5 border border-forest-100 text-ink-light">Draft only</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold border border-forest-100">District Officer</td>
                  <td className="p-2.5 border border-forest-100">District-wide surveillance & CCEs</td>
                  <td className="p-2.5 border border-forest-100 text-forest-700 font-semibold">Aggregates only</td>
                  <td className="p-2.5 border border-forest-100 text-emerald-600 font-semibold">District cycles & CCE</td>
                  <td className="p-2.5 border border-forest-100 text-emerald-600 font-semibold">District broadcast</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold border border-forest-100">State Admin</td>
                  <td className="p-2.5 border border-forest-100">Statewide telemetry, rakes, seeds & assets</td>
                  <td className="p-2.5 border border-forest-100 text-forest-700 font-semibold">Aggregates only</td>
                  <td className="p-2.5 border border-forest-100 text-emerald-600 font-semibold">Statewide publish</td>
                  <td className="p-2.5 border border-forest-100 text-emerald-600 font-semibold">Statewide broadcast</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
