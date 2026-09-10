import { LOAN_PRODUCTS } from "@/data/loanProducts";
import type { FarmerProfile, LoanRecommendation } from "@/types";

// ─────────────────────────────────────────────
// Rule-based, fully explainable loan recommendation engine.
//
// This is a relevance ranking based on the farmer's own profile data
// (land area, irrigation type, existing crops) matched against each
// product's stated target farmer/purpose — NOT an eligibility
// determination, and NEVER a guarantee. Every recommendation carries
// its reasons so the farmer (or an auditor) can see exactly why it
// was suggested — no hidden scoring logic.
// ─────────────────────────────────────────────

export function recommendLoans(profile: Pick<FarmerProfile, "landAreaAcres" | "irrigationType" | "currentCrops" | "farmingType">): LoanRecommendation[] {
  const results: LoanRecommendation[] = [];

  for (const product of LOAN_PRODUCTS) {
    const reasons: string[] = [];
    let score = 0;

    // Every farmer actively cultivating land can reasonably consider KCC and crop loans —
    // they're the broadest, most foundational products.
    if (product.category === "kisan_credit_card" || product.category === "crop_loan") {
      score += 40;
      reasons.push("Suitable for most actively cultivating farmers, regardless of farm size");
    }

    if (product.category === "irrigation_finance") {
      if (profile.irrigationType && profile.irrigationType.toLowerCase() !== "rainfed") {
        score += 25;
        reasons.push(`You've recorded ${profile.irrigationType} irrigation — this product covers irrigation infrastructure investment`);
      } else {
        score += 10;
        reasons.push("May help you move from rain-fed to a more reliable irrigation method");
      }
    }

    if (product.category === "livestock_dairy_finance" && profile.farmingType?.toLowerCase().includes("livestock")) {
      score += 30;
      reasons.push("Your recorded farming type includes livestock activity");
    }

    if (product.category === "term_loan" && (profile.landAreaAcres ?? 0) >= 2) {
      score += 15;
      reasons.push("Larger landholdings often justify multi-season capital investment");
    }

    if (product.category === "warehouse_finance" && profile.currentCrops && profile.currentCrops.length > 0) {
      score += 10;
      reasons.push("Storing your harvest before selling can be relevant once you have produce to store");
    }

    if (product.category === "fpo_finance") {
      // Individual farmer profiles rarely qualify directly — always shown as low relevance context, not hidden.
      score += 5;
      reasons.push("Relevant if you're part of, or considering joining, a Farmer Producer Organization");
    }

    if (score === 0) continue;

    const relevance: LoanRecommendation["relevance"] = score >= 35 ? "high" : score >= 15 ? "medium" : "low";
    results.push({ product, relevance, reasons });
  }

  const order = { high: 0, medium: 1, low: 2 };
  return results.sort((a, b) => order[a.relevance] - order[b.relevance]);
}
