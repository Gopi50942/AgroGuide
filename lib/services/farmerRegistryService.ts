import { assertNoAadhaarPayload } from "@/lib/services/governmentConnectorService";
import type { FarmerServiceEnrollment } from "@/types";

// ─────────────────────────────────────────────
// Phase 104: Farmer Registry & Service Enrollment Layer
// Internal reference generator (AG-FARMER-XXXXXX) with strict Zero-Aadhaar enforcement.
// ─────────────────────────────────────────────

let inMemoryEnrollments: FarmerServiceEnrollment[] = [
  {
    id: "enr_demo_1",
    farmerId: "farmer_gopi_cbe",
    internalFarmerCode: "AG-FARMER-CBE-100234",
    farmerName: "Gopi S",
    programId: "prog_soil_2026",
    programNameEn: "Village Soil Health Testing Drive 2026",
    programNameTa: "கிராம மண் பரிசோதனை இயக்கம் 2026",
    enrolledAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    status: "in_progress",
    district: "Coimbatore",
    block: "Thondamuthur",
    village: "Alandurai",
  },
  {
    id: "enr_demo_2",
    farmerId: "farmer_gopi_cbe",
    internalFarmerCode: "AG-FARMER-CBE-100234",
    farmerName: "Gopi S",
    programId: "prog_micro_irrig",
    programNameEn: "Tamil Nadu Micro Irrigation Drip Scheme",
    programNameTa: "தமிழ்நாடு சொட்டு நீர் பாசனத் திட்டம்",
    enrolledAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    status: "enrolled",
    district: "Coimbatore",
    block: "Thondamuthur",
    village: "Alandurai",
  },
];

export function generateInternalFarmerCode(district: string = "TN"): string {
  const distCode = district.slice(0, 3).toUpperCase();
  const randNum = Math.floor(100000 + Math.random() * 900000);
  return `AG-FARMER-${distCode}-${randNum}`;
}

export async function enrollFarmerInProgram(
  farmerId: string,
  farmerName: string,
  programId: string,
  programNameEn: string,
  programNameTa: string,
  district: string,
  block?: string,
  village?: string,
  consentId?: string
): Promise<FarmerServiceEnrollment> {
  // Strict assert no Aadhaar details are present
  assertNoAadhaarPayload({ farmerId, programId, consentId });

  const enrollment: FarmerServiceEnrollment = {
    id: `enr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    farmerId,
    internalFarmerCode: generateInternalFarmerCode(district),
    farmerName,
    programId,
    programNameEn,
    programNameTa,
    enrolledAt: new Date().toISOString(),
    status: "enrolled",
    consentId,
    district,
    block,
    village,
  };

  inMemoryEnrollments.unshift(enrollment);
  return enrollment;
}

export async function listFarmerEnrollments(farmerId: string): Promise<FarmerServiceEnrollment[]> {
  return inMemoryEnrollments.filter((e) => e.farmerId === farmerId);
}

export async function listAllProgramEnrollments(districtFilter?: string): Promise<FarmerServiceEnrollment[]> {
  if (!districtFilter || districtFilter === "ALL") return inMemoryEnrollments;
  return inMemoryEnrollments.filter((e) => e.district.toLowerCase() === districtFilter.toLowerCase());
}
