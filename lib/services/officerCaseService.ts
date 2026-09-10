import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import { collection, doc, getDocs, updateDoc, query, where } from "firebase/firestore";
import { logAuditEvent } from "@/lib/services/auditLogService";
import type { SupportTicket, SupportTicketStatus } from "@/types";

// ─────────────────────────────────────────────
// Phase 70: Officer Case Management & Ticket Workflow Service
// ─────────────────────────────────────────────

export async function addOfficerAdvisoryNote(
  ticketId: string,
  officerId: string,
  officerName: string,
  note: string,
  newStatus?: SupportTicketStatus,
  isDemoMode: boolean = false
): Promise<boolean> {
  const timestamp = new Date().toISOString();

  if (isDemoMode || !isFirebaseConfigured) {
    return true;
  }

  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const updateData: any = {
      updatedAt: timestamp,
    };
    if (newStatus) updateData.status = newStatus;

    await updateDoc(doc(db, "support_tickets", ticketId), updateData);

    await logAuditEvent(
      officerId,
      "OFFICER_ACCESS_GRANT",
      "officer_access",
      ticketId,
      { action: "ADDED_ADVISORY_NOTE", status: newStatus || "unchanged" }
    );

    return true;
  } catch {
    return false;
  }
}
