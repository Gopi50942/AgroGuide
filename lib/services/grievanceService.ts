import { logAuditEvent } from "@/lib/services/auditLogService";
import type { FarmerGrievance, GrievanceCategory, GrievanceStatus, GovernmentUserRole } from "@/types";

// ─────────────────────────────────────────────
// Phase 105: Farmer Grievance Redressal Service
// Transparent grievance registration, SLA timeline tracking, escalation, and audit trail.
// ─────────────────────────────────────────────

let inMemoryGrievances: FarmerGrievance[] = [
  {
    id: "grv_demo_1",
    grievanceRefNumber: "AG-GRV-CBE-2026-000123",
    farmerId: "farmer_gopi_cbe",
    farmerName: "Gopi S",
    category: "Subsidy",
    title: "Delay in Micro-Irrigation Drip Subsidy Field Inspection",
    description: "Application for drip subsidy was submitted 30 days ago. Physical inspection date not yet scheduled.",
    status: "Under Review",
    district: "Coimbatore",
    block: "Thondamuthur",
    village: "Alandurai",
    assignedOfficerId: "officer_muthu_cbe",
    assignedOfficerName: "Muthukumar (Extension Officer)",
    submittedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 13 * 86400000).toISOString(),
    assignedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    firstResponseAt: new Date(Date.now() - 11 * 86400000).toISOString(),
    escalationLevel: "Officer",
    auditLogs: [
      {
        timestamp: new Date(Date.now() - 14 * 86400000).toISOString(),
        actorId: "farmer_gopi_cbe",
        actorRole: "farmer",
        action: "GRIEVANCE_SUBMITTED",
        note: "Submitted through digital portal",
      },
      {
        timestamp: new Date(Date.now() - 12 * 86400000).toISOString(),
        actorId: "admin_auto",
        actorRole: "system_admin",
        action: "GRIEVANCE_ASSIGNED",
        note: "Assigned to Thondamuthur Block Officer",
      },
    ],
  },
];

export function generateGrievanceRef(district: string = "CBE"): string {
  const distCode = district.slice(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const randNum = String(Math.floor(100000 + Math.random() * 900000)).slice(-6);
  return `AG-GRV-${distCode}-${year}-${randNum}`;
}

export async function submitFarmerGrievance(
  farmerId: string,
  farmerName: string,
  category: GrievanceCategory,
  title: string,
  description: string,
  district: string,
  block?: string,
  village?: string
): Promise<FarmerGrievance> {
  const refNum = generateGrievanceRef(district);
  const now = new Date().toISOString();

  const grievance: FarmerGrievance = {
    id: `grv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    grievanceRefNumber: refNum,
    farmerId,
    farmerName,
    category,
    title,
    description,
    status: "Submitted",
    district,
    block,
    village,
    submittedAt: now,
    auditLogs: [
      {
        timestamp: now,
        actorId: farmerId,
        actorRole: "farmer",
        action: "GRIEVANCE_SUBMITTED",
      },
    ],
  };

  inMemoryGrievances.unshift(grievance);

  await logAuditEvent(
    farmerId,
    "GRIEVANCE_FILED",
    "farmer_grievance",
    refNum,
    { category, district }
  );

  return grievance;
}

export async function listFarmerGrievances(farmerId: string): Promise<FarmerGrievance[]> {
  return inMemoryGrievances.filter((g) => g.farmerId === farmerId);
}

export async function listAllGrievances(filterDistrict?: string): Promise<FarmerGrievance[]> {
  if (!filterDistrict || filterDistrict === "ALL") return inMemoryGrievances;
  return inMemoryGrievances.filter((g) => g.district.toLowerCase() === filterDistrict.toLowerCase());
}

export async function updateGrievanceStatus(
  grievanceId: string,
  status: GrievanceStatus,
  actorId: string,
  actorRole: GovernmentUserRole,
  note?: string
): Promise<FarmerGrievance | null> {
  const g = inMemoryGrievances.find((item) => item.id === grievanceId);
  if (!g) return null;

  const now = new Date().toISOString();
  g.status = status;

  if (status === "Acknowledged" && !g.acknowledgedAt) g.acknowledgedAt = now;
  if (status === "Assigned" && !g.assignedAt) g.assignedAt = now;
  if (status === "Resolved") g.resolvedAt = now;

  g.auditLogs.push({
    timestamp: now,
    actorId,
    actorRole,
    action: `STATUS_CHANGED_TO_${status.toUpperCase().replace(/\s+/g, "_")}`,
    note,
  });

  return g;
}

export async function escalateGrievance(
  grievanceId: string,
  targetLevel: "Block" | "District",
  actorId: string,
  actorRole: GovernmentUserRole,
  reason: string
): Promise<FarmerGrievance | null> {
  const g = inMemoryGrievances.find((item) => item.id === grievanceId);
  if (!g) return null;

  g.status = "Escalated";
  g.escalationLevel = targetLevel;
  g.auditLogs.push({
    timestamp: new Date().toISOString(),
    actorId,
    actorRole,
    action: `ESCALATED_TO_${targetLevel.toUpperCase()}`,
    note: reason,
  });

  return g;
}
