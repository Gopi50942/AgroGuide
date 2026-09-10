import type { ColdChainAsset, ColdChainTelemetry } from "@/types";

// ─────────────────────────────────────────────
// Phase 145: State Cold Chain Telemetry Service
// Temperature and humidity monitoring across packhouses, reefer trucks, and cold storages.
// ─────────────────────────────────────────────

let inMemoryColdAssets: ColdChainAsset[] = [
  {
    id: "cold_cbe_01",
    assetType: "cold_storage",
    name: "Udumalpet Tomato Pre-Cooling & Cold Hub",
    district: "Coimbatore",
    capacityTonnes: 500,
    temperatureSetPointC: 4.0,
    status: "Operational",
  },
  {
    id: "reefer_truck_01",
    assetType: "refrigerated_truck",
    name: "TANFED Reefer Transit Truck 12T (TN-38-BZ-4412)",
    district: "Coimbatore",
    capacityTonnes: 12,
    temperatureSetPointC: 2.0,
    status: "Operational",
  },
];

export function getColdChainTelemetry(assetId: string): ColdChainTelemetry {
  const asset = inMemoryColdAssets.find((a) => a.id === assetId);
  const temp = asset?.assetType === "cold_storage" ? 4.2 : 2.5;
  const setPoint = asset?.temperatureSetPointC ?? 4.0;
  const excursion = Math.abs(temp - setPoint) > 3.0;

  return {
    assetId,
    timestamp: new Date().toISOString(),
    temperatureC: temp,
    humidityPercent: 88,
    doorOpen: false,
    gpsLocation: { lat: 10.957, lng: 76.848 },
    excursionAlert: excursion,
  };
}

export async function listColdChainAssets(district?: string): Promise<ColdChainAsset[]> {
  if (!district || district === "ALL") return inMemoryColdAssets;
  return inMemoryColdAssets.filter((a) => a.district.toLowerCase() === district.toLowerCase());
}
