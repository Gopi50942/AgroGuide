import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import { collection, doc, getDocs, setDoc, updateDoc, query, where } from "firebase/firestore";
import type { SupportTicket, SupportTicketCategory, SupportTicketStatus } from "@/types";

// ─────────────────────────────────────────────
// Phase 69: Farmer Support Ticket System
// ─────────────────────────────────────────────

const demoTicketsStore: Record<string, string> = {};

function getDemoTickets(key: string): string | null {
  if (typeof localStorage !== "undefined") {
    try {
      return localStorage.getItem(key);
    } catch {}
  }
  return demoTicketsStore[key] || null;
}

function setDemoTickets(key: string, val: string): void {
  demoTicketsStore[key] = val;
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(key, val);
    } catch {}
  }
}

export async function createSupportTicket(
  ownerId: string,
  farmerName: string,
  farmerDistrict: string,
  category: SupportTicketCategory,
  title: string,
  description: string,
  priority: "low" | "medium" | "high" | "urgent" = "medium",
  isDemoMode: boolean = false
): Promise<SupportTicket> {
  const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const ticket: SupportTicket = {
    id: ticketId,
    ownerId,
    farmerName,
    farmerDistrict,
    category,
    title,
    description,
    status: "open",
    priority,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_support_tickets_${ownerId}`;
      const existing: SupportTicket[] = JSON.parse(getDemoTickets(key) || "[]");
      existing.unshift(ticket);
      setDemoTickets(key, JSON.stringify(existing));
    } catch {}
    return ticket;
  }

  const db = getFirebaseDb();
  if (db) {
    await setDoc(doc(db, "support_tickets", ticketId), ticket);
  }

  return ticket;
}

export async function listFarmerSupportTickets(
  ownerId: string,
  isDemoMode: boolean = false
): Promise<SupportTicket[]> {
  if (isDemoMode || !isFirebaseConfigured) {
    try {
      const key = `agroguide_demo_support_tickets_${ownerId}`;
      const stored = getDemoTickets(key);
      if (stored) return JSON.parse(stored);
      return [
        {
          id: "ticket_demo_01",
          ownerId,
          farmerName: "K. Raman",
          farmerDistrict: "Coimbatore",
          category: "government_scheme",
          title: "PM-KISAN installment status verification",
          description: "Applied for 17th installment; need verification of land record linking.",
          status: "open",
          priority: "medium",
          createdAt: "2026-06-20T10:00:00Z",
          updatedAt: "2026-06-20T10:00:00Z",
        },
      ];
    } catch {
      return [];
    }
  }

  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(collection(db, "support_tickets"), where("ownerId", "==", ownerId));
    const snap = await getDocs(q);
    const res: SupportTicket[] = [];
    snap.forEach((d) => res.push(d.data() as SupportTicket));
    return res;
  } catch {
    return [];
  }
}
