import type { SubsidyEvidence, SubsidyEvidenceCategory, GovernmentUserRole } from "@/types";

// ─────────────────────────────────────────────
// Phase 107: Subsidy Application Evidence Workspace Service
// Manages required documentation, invoices, photo verification without faking fund disbursement.
// ─────────────────────────────────────────────

let inMemorySubsidyEvidence: SubsidyEvidence[] = [
  {
    id: "sub_ev_demo_1",
    farmerId: "farmer_gopi_cbe",
    farmId: "farm_cbe_main",
    farmName: "Alandurai Organic Farm",
    schemeId: "scheme_pmksy_drip",
    schemeName: "PMKSY Micro Irrigation Drip Scheme",
    applicationReference: "TN-MI-2026-98124",
    category: "drip_irrigation",
    requiredDocsChecklist: [
      { docType: "land_record", labelEn: "Patta / Land Document", labelTa: "பட்டா / நில ஆவணம்", uploaded: true, fileRef: "doc_patta_001.pdf" },
      { docType: "water_source", labelEn: "Water Source Certificate", labelTa: "நீர் ஆதாரச் சான்று", uploaded: true, fileRef: "doc_water_002.pdf" },
      { docType: "quotation_invoice", labelEn: "Authorized Dealer Quotation", labelTa: "விலைப் பட்டியல்", uploaded: true, fileRef: "inv_drip_991.pdf" },
      { docType: "field_photo", labelEn: "Pre-Installation Field Photo", labelTa: "பண்ணைப் புகைப்படம்", uploaded: true, fileRef: "img_field_pre.jpg" },
    ],
    invoiceNumber: "INV-NETAFIM-2026-871",
    installationDate: "2026-05-15",
    inspectionStatus: "Verified",
    officerNotes: "Physical installation inspected by Extension Officer Muthukumar. Pressure gauges and emitter lines calibrated.",
    verifiedByOfficerId: "officer_muthu_cbe",
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export async function createSubsidyEvidenceWorkspace(
  farmerId: string,
  farmId: string,
  farmName: string,
  schemeId: string,
  schemeName: string,
  applicationReference: string,
  category: SubsidyEvidenceCategory,
  invoiceNumber?: string
): Promise<SubsidyEvidence> {
  const defaultChecklist = [
    { docType: "land_record", labelEn: "Patta / Land Document", labelTa: "பட்டா / நில ஆவணம்", uploaded: false },
    { docType: "water_source", labelEn: "Water Source Certificate", labelTa: "நீர் ஆதாரச் சான்று", uploaded: false },
    { docType: "quotation_invoice", labelEn: "Authorized Dealer Quotation / Invoice", labelTa: "விலைப் பட்டியல் / ரசீது", uploaded: !!invoiceNumber },
    { docType: "field_photo", labelEn: "Field Installation Photo", labelTa: "நிறுவப்பட்ட பண்ணைப் புகைப்படம்", uploaded: false },
  ];

  const evidence: SubsidyEvidence = {
    id: `sub_ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    farmerId,
    farmId,
    farmName,
    schemeId,
    schemeName,
    applicationReference,
    category,
    requiredDocsChecklist: defaultChecklist,
    invoiceNumber,
    inspectionStatus: "Pending",
    updatedAt: new Date().toISOString(),
  };

  inMemorySubsidyEvidence.unshift(evidence);
  return evidence;
}

export async function listFarmerSubsidyEvidence(farmerId: string): Promise<SubsidyEvidence[]> {
  return inMemorySubsidyEvidence.filter((e) => e.farmerId === farmerId);
}

export async function listAllSubsidyEvidence(): Promise<SubsidyEvidence[]> {
  return inMemorySubsidyEvidence;
}

export async function reviewSubsidyEvidence(
  evidenceId: string,
  inspectionStatus: "Verified" | "Needs Clarification" | "Rejected Evidence",
  officerId: string,
  role: GovernmentUserRole,
  officerNotes?: string
): Promise<SubsidyEvidence | null> {
  if (!["extension_officer", "block_officer", "district_officer", "system_admin"].includes(role)) {
    throw new Error("Unauthorized: Only authorized officers can record evidence inspection reviews.");
  }

  const item = inMemorySubsidyEvidence.find((e) => e.id === evidenceId);
  if (!item) return null;

  item.inspectionStatus = inspectionStatus;
  item.verifiedByOfficerId = officerId;
  item.officerNotes = officerNotes;
  item.updatedAt = new Date().toISOString();

  return item;
}
