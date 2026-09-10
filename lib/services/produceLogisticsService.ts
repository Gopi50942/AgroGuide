import type { ProduceTransportRequest } from "@/types";

// ─────────────────────────────────────────────
// Phase 158: Farm Produce Transport & Logistics Coordination Service
// Connects farmers with freight transport for mandi/warehouse delivery.
// ─────────────────────────────────────────────

let inMemoryTransportRequests: ProduceTransportRequest[] = [
  {
    requestId: "TRP-2026-0041",
    farmerId: "farmer_gopi_cbe",
    farmerName: "Gopi S",
    pickupVillage: "Alandurai, Coimbatore",
    destinationMandi: "Coimbatore Central APMC Mandi",
    commodity: "Tomato (Grade A)",
    quantityQuintals: 45,
    preferredDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    vehicleType: "mini_truck",
    status: "Assigned",
    assignedDriverPhone: "9876543219",
    createdAt: new Date().toISOString(),
  },
];

export async function createTransportRequest(
  farmerId: string,
  farmerName: string,
  pickupVillage: string,
  destinationMandi: string,
  commodity: string,
  quantityQuintals: number,
  preferredDate: string,
  vehicleType: ProduceTransportRequest["vehicleType"]
): Promise<ProduceTransportRequest> {
  const req: ProduceTransportRequest = {
    requestId: `TRP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    farmerId,
    farmerName,
    pickupVillage,
    destinationMandi,
    commodity,
    quantityQuintals,
    preferredDate,
    vehicleType,
    status: "Requested",
    createdAt: new Date().toISOString(),
  };

  inMemoryTransportRequests.unshift(req);
  return req;
}

export async function listTransportRequests(farmerId?: string): Promise<ProduceTransportRequest[]> {
  if (farmerId) return inMemoryTransportRequests.filter((t) => t.farmerId === farmerId);
  return inMemoryTransportRequests;
}
