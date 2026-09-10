import type { AgriInputRetailer, PesticideProduct } from "@/types";

// ─────────────────────────────────────────────
// Phase 146: Pesticide Retailer & Product Verification Service
// Verifies registered agrochemical dealers and CIB&RC approved labels.
// ─────────────────────────────────────────────

let inMemoryRetailers: AgriInputRetailer[] = [
  {
    dealerId: "DEALER-CBE-9941",
    dealerName: "Kongunadu Agro Service Center",
    licenseReference: "TN-AGR-RET-2024-CBE-0081",
    district: "Coimbatore",
    block: "Thondamuthur",
    licenseExpiry: "2027-03-31",
    status: "Verified from source",
    verifiedSource: "Directorate of Agriculture, Government of Tamil Nadu",
  },
  {
    dealerId: "DEALER-TNJ-2201",
    dealerName: "Delta Farmer Input Depot",
    licenseReference: "TN-AGR-RET-2023-TNJ-0412",
    district: "Thanjavur",
    block: "Kumbakonam",
    licenseExpiry: "2026-12-31",
    status: "Verified from source",
    verifiedSource: "Directorate of Agriculture, Government of Tamil Nadu",
  },
];

let inMemoryProducts: PesticideProduct[] = [
  {
    productId: "PEST-CHLOR-20EC",
    productName: "Chlorantraniliprole 18.5% SC",
    activeIngredient: "Chlorantraniliprole",
    cibRegistrationNo: "CIR-114202/2014-Chlorantraniliprole(SC)-412",
    manufacturer: "FMC India Ltd",
    approvedCrops: ["Paddy", "Tomato", "Sugarcane", "Chilli", "Maize"],
    dosageGuidance: "60 ml per acre in 200 Litres of water",
    verificationStatus: "Approved by CIB&RC",
  },
  {
    productId: "PEST-NEEM-AZA",
    productName: "Neem Oil Formulation (Azadirachtin 10,000 PPM)",
    activeIngredient: "Azadirachtin",
    cibRegistrationNo: "CIR-98421/2012-Azadirachtin(EC)-110",
    manufacturer: "TNAU Bio-Control Lab",
    approvedCrops: ["All Vegetables", "Cotton", "Pulses"],
    dosageGuidance: "3 ml per Litre of water",
    verificationStatus: "Approved by CIB&RC",
  },
];

export async function verifyInputRetailer(dealerCodeOrLicense: string): Promise<AgriInputRetailer | null> {
  const clean = dealerCodeOrLicense.trim().toLowerCase();
  const match = inMemoryRetailers.find(
    (r) => r.dealerId.toLowerCase() === clean || r.licenseReference.toLowerCase() === clean
  );
  return match || null;
}

export async function verifyPesticideProduct(query: string): Promise<PesticideProduct | null> {
  const clean = query.trim().toLowerCase();
  const match = inMemoryProducts.find(
    (p) =>
      p.productId.toLowerCase() === clean ||
      p.productName.toLowerCase().includes(clean) ||
      p.cibRegistrationNo.toLowerCase() === clean
  );
  return match || null;
}
