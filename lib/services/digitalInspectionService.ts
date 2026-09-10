import type { FieldInspection } from "@/types";

// ─────────────────────────────────────────────
// Phase 108: Digital Field Inspection Service
// Captures GPS field inspections, compares with saved farm polygon centroid, supports offline sync.
// ─────────────────────────────────────────────

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

let inMemoryInspections: FieldInspection[] = [
  {
    id: "insp_demo_1",
    inspectionRef: "AG-INSP-2026-0001",
    officerId: "officer_muthu_cbe",
    officerName: "Muthukumar",
    farmerId: "farmer_gopi_cbe",
    farmerName: "Gopi S",
    farmId: "farm_cbe_main",
    farmName: "Alandurai Organic Farm",
    purpose: "Pre-Harvest Yield & Sowing Verification",
    scheduledDate: "2026-05-18",
    inspectionDate: "2026-05-18T10:30:00.000Z",
    gpsLocation: {
      lat: 10.957,
      lng: 76.848,
      accuracyMeters: 4.5,
    },
    farmCentroidMismatch: false,
    cropName: "Hybrid Tomato (Shivam)",
    cropStage: "fruiting",
    observations: "Crop foliage healthy. Minor leaf miner incidence observed on border rows.",
    recommendations: "Apply neem oil bio-spray (3ml/L). Schedule harvest in 12-14 days.",
    status: "Completed",
    followUpDate: "2026-06-01",
    createdAt: "2026-05-18T11:00:00.000Z",
  },
];

export async function createFieldInspection(
  officerId: string,
  officerName: string,
  farmerId: string,
  farmerName: string,
  farmId: string,
  farmName: string,
  purpose: string,
  scheduledDate: string,
  gpsLocation?: { lat: number; lng: number; accuracyMeters: number },
  farmCentroid?: { lat: number; lng: number },
  cropName?: string,
  cropStage?: string,
  observations?: string,
  recommendations?: string
): Promise<FieldInspection> {
  let isMismatch = false;
  if (gpsLocation && farmCentroid) {
    const dist = calculateDistanceMeters(
      gpsLocation.lat,
      gpsLocation.lng,
      farmCentroid.lat,
      farmCentroid.lng
    );
    // Flag mismatch if officer GPS is further than 1500m from registered farm boundary
    if (dist > 1500) {
      isMismatch = true;
    }
  }

  const inspection: FieldInspection = {
    id: `insp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    inspectionRef: `AG-INSP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    officerId,
    officerName,
    farmerId,
    farmerName,
    farmId,
    farmName,
    purpose,
    scheduledDate,
    inspectionDate: new Date().toISOString(),
    gpsLocation,
    farmCentroidMismatch: isMismatch,
    cropName,
    cropStage,
    observations: observations || "Field verified in person by extension officer.",
    recommendations: recommendations || "Follow recommended package of practices.",
    status: "Completed",
    createdAt: new Date().toISOString(),
  };

  inMemoryInspections.unshift(inspection);
  return inspection;
}

export async function listOfficerInspections(officerId: string): Promise<FieldInspection[]> {
  return inMemoryInspections.filter((i) => i.officerId === officerId);
}

export async function listFarmInspections(farmId: string): Promise<FieldInspection[]> {
  return inMemoryInspections.filter((i) => i.farmId === farmId);
}
