import type { AgriDealerComplianceEntry } from "@/types";

// ─────────────────────────────────────────────
// Phase 159: Agri Input Dealer Compliance Registry Service
// Departmental registry for fertilizer, seed, and pesticide retailer licenses.
// ─────────────────────────────────────────────

let inMemoryDealerRegistry: AgriDealerComplianceEntry[] = [
  {
    dealerId: "DLR-REG-CBE-001",
    businessName: "Kongunadu Kisan Agro Inputs",
    licenseNumber: "TN-CBE-RET-FERT-8812",
    category: "fertilizer",
    district: "Coimbatore",
    block: "Thondamuthur",
    licenseExpiry: "2027-03-31",
    complianceStatus: "Active",
    verifiedSource: "Department of Agriculture, Tamil Nadu",
  },
  {
    dealerId: "DLR-REG-CBE-002",
    businessName: "Marutham Pesticides & Seeds",
    licenseNumber: "TN-CBE-RET-PEST-4421",
    category: "pesticide",
    district: "Coimbatore",
    block: "Pollachi",
    licenseExpiry: "2026-10-31",
    complianceStatus: "Active",
    verifiedSource: "Directorate of Agriculture, Tamil Nadu",
  },
  {
    dealerId: "DLR-REG-TNJ-001",
    businessName: "Cauvery Delta Certified Seed Depot",
    licenseNumber: "TN-TNJ-RET-SEED-1190",
    category: "seed",
    district: "Thanjavur",
    block: "Kumbakonam",
    licenseExpiry: "2027-05-15",
    complianceStatus: "Active",
    verifiedSource: "Directorate of Seed Certification",
  },
];

export async function listDealers(districtFilter?: string, categoryFilter?: AgriDealerComplianceEntry["category"]): Promise<AgriDealerComplianceEntry[]> {
  return inMemoryDealerRegistry.filter((d) => {
    if (districtFilter && districtFilter !== "ALL" && d.district.toLowerCase() !== districtFilter.toLowerCase()) {
      return false;
    }
    if (categoryFilter && d.category !== categoryFilter) {
      return false;
    }
    return true;
  });
}
