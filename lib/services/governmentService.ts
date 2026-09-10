import { GOVERNMENT_SERVICES } from "@/data/governmentServices";
import type { FarmerProfile, SchemeMatch, Language } from "@/types";

// ─────────────────────────────────────────────
// Government Schemes & Pre-Screening Engine
// Produces informational relevance indicators.
// Explicit non-authoritative policy: NEVER claims official approval.
// ─────────────────────────────────────────────

export interface SchemeScreeningCriteria {
  state: string;
  landAreaAcres: number;
  farmerCategory: "general" | "sc_st" | "women" | "small_marginal";
  cropCategory: string;
  irrigationType: string;
  hasSoilReport: boolean;
  hasKccLoan: boolean;
}

export interface SchemeScreeningResult {
  schemeId: string;
  schemeName: string;
  description: string;
  category: string;
  governmentLevel: "central" | "state";
  verdict: "likely_relevant" | "may_be_relevant" | "unlikely";
  verdictLabelEn: string;
  verdictLabelTa: string;
  matchedCriteriaEn: string[];
  matchedCriteriaTa: string[];
  requiredDocumentsEn: string[];
  requiredDocumentsTa: string[];
  officialUrl: string;
}

export function matchCategory(matchPercent: number): "likely" | "possible" {
  return matchPercent >= 70 ? "likely" : "possible";
}

export function matchGovernmentSchemes(profile: FarmerProfile): SchemeMatch[] {
  const matches: SchemeMatch[] = [];

  for (const service of GOVERNMENT_SERVICES) {
    if (!service.active) continue;
    if (service.governmentLevel === "state" && service.state && service.state !== profile.state) {
      continue;
    }

    let score = 40;
    const reasons: string[] = [];

    if (service.governmentLevel === "central") {
      score += 15;
      reasons.push("Available nationwide");
    }
    if (service.state === profile.state) {
      score += 15;
      reasons.push(`Active in ${profile.state}`);
    }
    if (service.category === "irrigation" && profile.irrigationType) {
      score += 20;
      reasons.push(`Matches your irrigation type (${profile.irrigationType})`);
    }
    if (service.category === "subsidy" && profile.landAreaAcres) {
      score += 10;
      reasons.push("Land-based subsidy schemes often apply to your holding size");
    }
    if (service.category === "insurance" && profile.currentCrops?.length) {
      score += 15;
      reasons.push(`Relevant to your current crop (${profile.currentCrops[0]})`);
    }
    if (service.category === "mechanization" && profile.equipmentOwned?.length) {
      score += 10;
      reasons.push("You already own related equipment");
    }
    if (service.category === "soil") {
      score += 10;
      reasons.push("Useful for ongoing soil health monitoring");
    }

    matches.push({
      ...service,
      matchPercent: Math.min(97, score),
      matchReasons: reasons.length ? reasons : ["General relevance to your farming profile"],
    });
  }

  return matches.sort((a, b) => b.matchPercent - a.matchPercent);
}

/**
 * Pre-Screening Wizard Evaluator
 */
export function evaluateSchemeScreening(
  criteria: SchemeScreeningCriteria
): SchemeScreeningResult[] {
  const results: SchemeScreeningResult[] = [];

  for (const service of GOVERNMENT_SERVICES) {
    if (!service.active) continue;
    if (service.governmentLevel === "state" && service.state && service.state !== criteria.state) {
      continue;
    }

    const matchedEn: string[] = [];
    const matchedTa: string[] = [];
    let matchPoints = 0;

    // Geographic check
    if (service.governmentLevel === "central") {
      matchedEn.push("Central scheme available nationwide");
      matchedTa.push("நாடு முழுவதும் பொருந்தும் மத்திய அரசு திட்டம்");
      matchPoints += 2;
    } else if (service.state === criteria.state) {
      matchedEn.push(`Active in your state (${criteria.state})`);
      matchedTa.push(`உங்கள் மாநிலத்தில் (${criteria.state}) செயல்பாட்டில் உள்ளது`);
      matchPoints += 3;
    }

    // Land holding criteria
    if (criteria.landAreaAcres <= 5) {
      matchedEn.push(`Landholding size (${criteria.landAreaAcres} ac) fits small/marginal priority`);
      matchedTa.push(`நிலப்பரப்பு (${criteria.landAreaAcres} ஏக்கர்) சிறு/குறு விவசாயி வரம்பிற்குள் உள்ளது`);
      matchPoints += 2;
    }

    if (service.category === "subsidy" && criteria.landAreaAcres <= 5) {
      matchedEn.push("Direct benefit subsidies prioritize small/marginal landholders");
      matchedTa.push("நேரடி மானிய திட்டங்கள் சிறு/குறு விவசாயிகளுக்கு முன்னுரிமை அளிக்கின்றன");
      matchPoints += 2;
    }

    // Category-specific rules
    if (service.category === "irrigation" && criteria.irrigationType.toLowerCase().includes("drip")) {
      matchedEn.push("Micro-irrigation subsidy matches drip/sprinkler adoption");
      matchedTa.push("நுண் பாசன மானியம் உங்கள் சொட்டுநீர் அமைப்பிற்கு பொருந்தும்");
      matchPoints += 3;
    }

    if (service.category === "soil" && criteria.hasSoilReport) {
      matchedEn.push("You have soil health test data ready for fertilizer optimization");
      matchedTa.push("உங்களிடம் மண் பரிசோதனை தரவு தயாராக உள்ளது");
      matchPoints += 2;
    }

    if (service.category === "loan" && !criteria.hasKccLoan) {
      matchedEn.push("Eligible to apply for subsidized Kisan Credit Card (KCC) credit limit");
      matchedTa.push("வட்டி மானியத்துடன் கூடிய கிசான் கடன் அட்டைக்கு விண்ணப்பிக்கலாம்");
      matchPoints += 3;
    }

    if (criteria.farmerCategory === "women" || criteria.farmerCategory === "sc_st") {
      matchedEn.push("Special subsidy slabs applicable for your farmer category");
      matchedTa.push("உங்கள் விவசாயி பிரிவிற்கு கூடுதல் மானிய வாய்ப்புகள் பொருந்தும்");
      matchPoints += 2;
    }

    let verdict: "likely_relevant" | "may_be_relevant" | "unlikely" = "may_be_relevant";
    let verdictLabelEn = "May be relevant";
    let verdictLabelTa = "பொருந்த வாய்ப்புள்ளது";

    if (matchPoints >= 5) {
      verdict = "likely_relevant";
      verdictLabelEn = "Likely relevant";
      verdictLabelTa = "மிகவும் பொருந்தக்கூடியது";
    } else if (matchPoints < 3) {
      verdict = "unlikely";
      verdictLabelEn = "Unlikely based on entered info";
      verdictLabelTa = "தகவலின்படி பொருந்த வாய்ப்பு குறைவு";
    }

    // Standard document checklist based on scheme category
    const docsEn: string[] = [
      "Aadhaar Card (UIDAI)",
      "Bank Account Passbook (Aadhaar linked)",
      "Land Ownership Documents (Patta / Chitta)",
    ];
    const docsTa: string[] = [
      "ஆதார் அட்டை",
      "வங்கி கணக்கு புத்தக நகல் (ஆதார் இணைக்கப்பட்டது)",
      "நில உரிமை ஆவணங்கள் (பட்டா / சிட்டா)",
    ];

    if (service.category === "insurance" || service.category === "subsidy") {
      docsEn.push("Adangal / Village Administrative Officer (VAO) Sowing Certificate");
      docsTa.push("அடங்கல் / வி.ஏ.ஓ பயிர் சாகுபடி சான்றிதழ்");
    }
    if (service.category === "soil") {
      docsEn.push("Soil Health Card / Soil Sample Slip");
      docsTa.push("மண் வள அட்டை / மாதிரி சீட்டு");
    }

    results.push({
      schemeId: service.id,
      schemeName: service.name,
      description: service.description,
      category: service.category,
      governmentLevel: service.governmentLevel,
      verdict,
      verdictLabelEn,
      verdictLabelTa,
      matchedCriteriaEn: matchedEn,
      matchedCriteriaTa: matchedTa,
      requiredDocumentsEn: docsEn,
      requiredDocumentsTa: docsTa,
      officialUrl: service.officialUrl,
    });
  }

  return results.sort((a, b) => {
    const rank = { likely_relevant: 3, may_be_relevant: 2, unlikely: 1 };
    return rank[b.verdict] - rank[a.verdict];
  });
}
