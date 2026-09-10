import type { EquipmentAsset, EquipmentBooking, EquipmentAssetType } from "@/types";

// ─────────────────────────────────────────────
// Phase 127: Government Drone & Custom Hiring Fleet Scheduler Service
// Fleet asset inventory and booking scheduling. Strict flight-safety limitation.
// ─────────────────────────────────────────────

export const DRONE_SAFETY_NOTICE =
  "AgroGuide manages service booking and operator dispatch only. Flight operations are strictly governed by DGCA regulations and authorized pilot execution.";

let inMemoryAssets: EquipmentAsset[] = [
  {
    id: "asset_drone_01",
    assetType: "drone",
    modelName: "IoTech AgriDrone 16L Hexacopter",
    district: "Coimbatore",
    block: "Thondamuthur",
    operatorName: "Venkatesh (Certified Remote Pilot)",
    operatorPhone: "9876543210",
    ratePerHourRs: 650,
    maintenanceStatus: "Operational",
  },
  {
    id: "asset_tractor_01",
    assetType: "tractor",
    modelName: "Mahindra 575 DI 45HP with Rotavator",
    district: "Coimbatore",
    block: "Pollachi",
    operatorName: "Kandasamy",
    operatorPhone: "9876543211",
    ratePerHourRs: 900,
    maintenanceStatus: "Operational",
  },
  {
    id: "asset_harvester_01",
    assetType: "harvester",
    modelName: "Class Crop Tiger 30 Track Harvester",
    district: "Thanjavur",
    block: "Kumbakonam",
    operatorName: "Selvaraj",
    operatorPhone: "9876543212",
    ratePerHourRs: 1800,
    maintenanceStatus: "Operational",
  },
];

let inMemoryBookings: EquipmentBooking[] = [
  {
    id: "bk_demo_1",
    bookingRef: "BK-DRN-2026-0081",
    assetId: "asset_drone_01",
    assetType: "drone",
    farmerId: "farmer_gopi_cbe",
    farmerName: "Gopi S",
    farmId: "farm_cbe_main",
    district: "Coimbatore",
    scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    durationHours: 2,
    status: "Confirmed",
  },
];

export async function listEquipmentAssets(districtFilter?: string): Promise<EquipmentAsset[]> {
  if (!districtFilter || districtFilter === "ALL") return inMemoryAssets;
  return inMemoryAssets.filter((a) => a.district.toLowerCase() === districtFilter.toLowerCase());
}

export async function createEquipmentBooking(
  assetId: string,
  assetType: EquipmentAssetType,
  farmerId: string,
  farmerName: string,
  farmId: string,
  district: string,
  scheduledDate: string,
  durationHours: number = 2
): Promise<EquipmentBooking> {
  const booking: EquipmentBooking = {
    id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    bookingRef: `BK-${assetType.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    assetId,
    assetType,
    farmerId,
    farmerName,
    farmId,
    district,
    scheduledDate,
    durationHours,
    status: "Requested",
  };

  inMemoryBookings.unshift(booking);
  return booking;
}

export async function listEquipmentBookings(farmerId?: string): Promise<EquipmentBooking[]> {
  if (farmerId) return inMemoryBookings.filter((b) => b.farmerId === farmerId);
  return inMemoryBookings;
}
