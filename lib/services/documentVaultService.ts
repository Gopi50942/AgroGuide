import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import { collection, doc, getDocs, setDoc, query, where } from "firebase/firestore";
import { assertNoAadhaarPayload } from "@/lib/services/governmentConnectorService";
import type { FarmerDocumentMetadata, VaultDocumentType } from "@/types";

// ─────────────────────────────────────────────
// Phase 77: Farmer Document Metadata Vault
// Securely indexes references for Soil Health Cards, Insurance Policies, Land Records, etc.
// STRICT POLICY: Prohibits collection, storage, or indexing of Aadhaar numbers.
// ─────────────────────────────────────────────

export async function saveDocumentMetadata(
  ownerId: string,
  docType: VaultDocumentType,
  title: string,
  issuingAuthority: string,
  options?: {
    referenceNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    fileUrl?: string;
    notes?: string;
  },
  isDemoMode: boolean = false
): Promise<FarmerDocumentMetadata> {
  // Validate that no national identity numbers are passed
  assertNoAadhaarPayload({
    title,
    ref: options?.referenceNumber,
    notes: options?.notes,
  });

  const docId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const metadata: FarmerDocumentMetadata = {
    id: docId,
    ownerId,
    docType,
    title,
    issuingAuthority,
    referenceNumber: options?.referenceNumber,
    issueDate: options?.issueDate,
    expiryDate: options?.expiryDate,
    fileUrl: options?.fileUrl,
    notes: options?.notes,
    createdAt: new Date().toISOString(),
  };

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_documents_${ownerId}`;
      const existing: FarmerDocumentMetadata[] = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(metadata);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
    return metadata;
  }

  const db = getFirebaseDb();
  if (db) {
    await setDoc(doc(db, "farmer_documents", docId), metadata);
  }

  return metadata;
}

export async function listFarmerDocuments(
  ownerId: string,
  isDemoMode: boolean = false
): Promise<FarmerDocumentMetadata[]> {
  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_documents_${ownerId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      return [
        {
          id: "doc_demo_01",
          ownerId,
          docType: "soil_health_card",
          title: "Soil Test Card 2026",
          issuingAuthority: "TNAU Soil Testing Laboratory Coimbatore",
          referenceNumber: "STC-TNAU-2026-881",
          issueDate: "2026-05-15",
          createdAt: "2026-05-15T00:00:00Z",
        },
      ];
    } catch {
      return [];
    }
  }

  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(collection(db, "farmer_documents"), where("ownerId", "==", ownerId));
    const snap = await getDocs(q);
    const res: FarmerDocumentMetadata[] = [];
    snap.forEach((d) => res.push(d.data() as FarmerDocumentMetadata));
    return res;
  } catch {
    return [];
  }
}
