import type { OfficerTask } from "@/types";

// ─────────────────────────────────────────────
// Phase 114: Extension Officer Work Planner Service
// Day planning, field task assignment, status updates, and village grouping.
// ─────────────────────────────────────────────

let inMemoryOfficerTasks: OfficerTask[] = [
  {
    id: "tsk_demo_1",
    officerId: "officer_muthu_cbe",
    farmerId: "farmer_gopi_cbe",
    farmerName: "Gopi S",
    farmId: "farm_cbe_main",
    farmName: "Alandurai Organic Farm",
    village: "Alandurai",
    taskType: "inspection",
    title: "Pre-Harvest Yield & Drip Subsidy Physical Inspection",
    scheduledDate: new Date().toISOString().split("T")[0],
    status: "In Progress",
    notes: "Calibrate water flow meters and document foliage health.",
  },
  {
    id: "tsk_demo_2",
    officerId: "officer_muthu_cbe",
    village: "Perur",
    taskType: "disease_check",
    title: "Maize Fall Armyworm Village Cluster Survey",
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    status: "Scheduled",
    notes: "Check pheromone traps installed across 5 demo plots.",
  },
  {
    id: "tsk_demo_3",
    officerId: "officer_muthu_cbe",
    farmerId: "farmer_gopi_cbe",
    farmerName: "Gopi S",
    village: "Alandurai",
    taskType: "grievance_followup",
    title: "Follow-up on Grievance AG-GRV-CBE-2026-000123",
    scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    status: "Scheduled",
    notes: "Update farmer regarding subsidy inspection sign-off.",
  },
];

export async function createOfficerTask(
  officerId: string,
  title: string,
  taskType: OfficerTask["taskType"],
  scheduledDate: string,
  farmerId?: string,
  farmerName?: string,
  farmId?: string,
  farmName?: string,
  village?: string,
  notes?: string
): Promise<OfficerTask> {
  const task: OfficerTask = {
    id: `tsk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    officerId,
    title,
    taskType,
    scheduledDate,
    farmerId,
    farmerName,
    farmId,
    farmName,
    village,
    status: "Scheduled",
    notes,
  };

  inMemoryOfficerTasks.unshift(task);
  return task;
}

export async function listOfficerTasks(officerId: string): Promise<OfficerTask[]> {
  return inMemoryOfficerTasks.filter((t) => t.officerId === officerId);
}

export async function updateOfficerTaskStatus(
  taskId: string,
  status: OfficerTask["status"],
  notes?: string
): Promise<OfficerTask | null> {
  const t = inMemoryOfficerTasks.find((item) => item.id === taskId);
  if (!t) return null;

  t.status = status;
  if (notes) t.notes = notes;
  return t;
}
