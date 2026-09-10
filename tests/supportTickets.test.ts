import { describe, it, expect } from "vitest";
import {
  createSupportTicket,
  listFarmerSupportTickets,
} from "@/lib/services/supportTicketService";

describe("Phase 69 — Farmer Support Ticket System", () => {
  it("creates farmer support ticket with open status and category tag", async () => {
    const ticket = await createSupportTicket(
      "farmer_99",
      "G. Raman",
      "Erode",
      "crop_advisory",
      "Yellowing leaves in turmeric",
      "Rhizome rot suspected after continuous rains.",
      "high",
      true
    );

    expect(ticket.id).toBeDefined();
    expect(ticket.status).toBe("open");
    expect(ticket.category).toBe("crop_advisory");
    expect(ticket.priority).toBe("high");
  });

  it("lists farmer support tickets safely in demo mode", async () => {
    const tickets = await listFarmerSupportTickets("farmer_99", true);
    expect(tickets.length).toBeGreaterThan(0);
  });
});
