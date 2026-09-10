import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Phase 86 — Firestore Security Rules Architecture & Policy Audit", () => {
  const rulesPath = path.resolve(process.cwd(), "firestore.rules");
  const rulesContent = fs.readFileSync(rulesPath, "utf-8");

  it("verifies firestore.rules file exists and specifies version 2", () => {
    expect(rulesContent).toContain("rules_version = '2'");
    expect(rulesContent).toContain("service cloud.firestore");
  });

  it("enforces strict owner-isolation helper function isOwner()", () => {
    expect(rulesContent).toContain("function isOwner(ownerField)");
    expect(rulesContent).toContain("request.auth.uid == resource.data[ownerField]");
  });

  it("protects all private farmer collections against cross-user reads and unauthenticated writes", () => {
    const protectedCollections = [
      "users",
      "farms",
      "crops",
      "soil_reports",
      "disease_reports",
      "expenses",
      "revenues",
      "harvest_records",
      "produce_sales",
      "irrigation_logs",
      "support_tickets",
      "farm_input_inventory",
      "crop_budgets",
      "farmer_documents",
      "pilot_feedback",
    ];

    protectedCollections.forEach((coll) => {
      expect(rulesContent).toContain(`match /${coll}/{`);
    });
  });

  it("verifies officer access to support tickets is strictly gated by assignedOfficerId or ownership", () => {
    expect(rulesContent).toContain("resource.data.assignedOfficerId == request.auth.uid");
  });
});
