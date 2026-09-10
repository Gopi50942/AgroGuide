import type { GovernmentAdvisory, AdvisoryBroadcastStatus, GovernmentUserRole } from "@/types";

// ─────────────────────────────────────────────
// Phase 112: Government Agricultural Advisory Broadcast Service
// Multi-channel advisory drafting, review, role-gated approval, and publication.
// ─────────────────────────────────────────────

let inMemoryAdvisories: GovernmentAdvisory[] = [
  {
    id: "adv_demo_1",
    titleEn: "Immediate Advisory: Fall Armyworm Monitoring in Maize Fields",
    titleTa: "முக்கிய எச்சரிக்கை: மக்காச்சோளப் பயிரில் படைப்புழு கண்காணிப்பு",
    contentEn: "Extension officers report early signs of fall armyworm in Thondamuthur block. Install pheromone traps at 5 per acre.",
    contentTa: "தொண்டாமுத்தூர் வட்டாரத்தில் படைப்புழு தாக்குதல் அறிகுறி தென்படுகிறது. ஏக்கருக்கு 5 மோகினி பொறிகளை அமைக்கவும்.",
    category: "pest",
    targetDistrict: "Coimbatore",
    targetBlock: "Thondamuthur",
    targetCrop: "Maize",
    status: "Published",
    channels: ["in_app", "sms"],
    createdByOfficerId: "officer_muthu_cbe",
    approvedByOfficerId: "officer_district_cbe",
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export async function createAdvisoryDraft(
  titleEn: string,
  titleTa: string,
  contentEn: string,
  contentTa: string,
  category: GovernmentAdvisory["category"],
  targetDistrict: string,
  createdByOfficerId: string,
  targetBlock?: string,
  targetCrop?: string,
  channels: ("in_app" | "sms" | "whatsapp")[] = ["in_app"]
): Promise<GovernmentAdvisory> {
  const adv: GovernmentAdvisory = {
    id: `adv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    titleEn,
    titleTa,
    contentEn,
    contentTa,
    category,
    targetDistrict,
    targetBlock,
    targetCrop,
    status: "Draft",
    channels,
    createdByOfficerId,
    createdAt: new Date().toISOString(),
  };

  inMemoryAdvisories.unshift(adv);
  return adv;
}

export async function approveAndPublishAdvisory(
  advisoryId: string,
  approvingOfficerId: string,
  role: GovernmentUserRole
): Promise<GovernmentAdvisory | null> {
  // Only Block/District/State officers can approve broadcast publications
  if (!["block_officer", "district_officer", "state_admin", "system_admin"].includes(role)) {
    throw new Error("Unauthorized: Insufficient role permissions to approve and publish advisories.");
  }

  const adv = inMemoryAdvisories.find((a) => a.id === advisoryId);
  if (!adv) return null;

  adv.status = "Published";
  adv.approvedByOfficerId = approvingOfficerId;
  adv.publishedAt = new Date().toISOString();

  return adv;
}

export async function listActiveAdvisories(district?: string): Promise<GovernmentAdvisory[]> {
  return inMemoryAdvisories.filter((a) => {
    if (a.status !== "Published") return false;
    if (!district || district === "ALL") return true;
    return a.targetDistrict.toLowerCase() === district.toLowerCase();
  });
}

export async function listAllAdvisories(): Promise<GovernmentAdvisory[]> {
  return inMemoryAdvisories;
}
