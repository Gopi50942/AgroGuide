import type { AgriSosReport } from "@/types";

// ─────────────────────────────────────────────
// Phase 155: Farmer Disaster SOS & Rapid Response Service
// Agricultural emergency reporting only (Not for police/medical emergency).
// ─────────────────────────────────────────────

export const AGRI_SOS_DISCLAIMER =
  "For agricultural crop collapse, flood inundation, and canal breach rapid response only. Non-emergency agricultural officer dispatch.";

let inMemorySosReports: AgriSosReport[] = [
  {
    id: "sos_cbe_001",
    ownerId: "farmer_gopi_cbe",
    farmerName: "Gopi S",
    farmerPhone: "9876543210",
    farmId: "farm_cbe_main",
    district: "Coimbatore",
    block: "Thondamuthur",
    village: "Alandurai",
    emergencyType: "flood_inundation",
    description: "Heavy flash rain caused waterlogging in 1.5 acres of fruiting tomato field.",
    severity: "severe",
    status: "Officer Assigned",
    assignedOfficerName: "Muthukumar (Extension Officer)",
    timestamp: new Date().toISOString(),
    disclaimer: AGRI_SOS_DISCLAIMER,
  },
];

export async function submitAgriSosReport(
  ownerId: string,
  farmerName: string,
  farmerPhone: string,
  farmId: string,
  district: string,
  block: string,
  village: string,
  emergencyType: AgriSosReport["emergencyType"],
  description: string,
  severity: AgriSosReport["severity"],
  photoUrls?: string[]
): Promise<AgriSosReport> {
  const report: AgriSosReport = {
    id: `sos_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ownerId,
    farmerName,
    farmerPhone,
    farmId,
    district,
    block,
    village,
    emergencyType,
    description,
    severity,
    status: "Submitted",
    photoUrls,
    timestamp: new Date().toISOString(),
    disclaimer: AGRI_SOS_DISCLAIMER,
  };

  inMemorySosReports.unshift(report);
  return report;
}

export async function listAgriSosReports(districtFilter?: string): Promise<AgriSosReport[]> {
  if (!districtFilter || districtFilter === "ALL") return inMemorySosReports;
  return inMemorySosReports.filter((s) => s.district.toLowerCase() === districtFilter.toLowerCase());
}

export async function updateAgriSosStatus(
  sosId: string,
  status: AgriSosReport["status"],
  assignedOfficerName?: string
): Promise<AgriSosReport | null> {
  const item = inMemorySosReports.find((s) => s.id === sosId);
  if (!item) return null;
  item.status = status;
  if (assignedOfficerName) item.assignedOfficerName = assignedOfficerName;
  return item;
}
