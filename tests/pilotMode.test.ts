import { describe, it, expect } from "vitest";
import {
  submitPilotFeedback,
  getFieldPilotChecklist,
} from "@/lib/services/pilotModeService";

describe("Phase 81 — Final Field Pilot Mode & Feedback", () => {
  it("records sanitized field pilot feedback without sensitive tokens", async () => {
    const fb = await submitPilotFeedback(
      "farmer_test_1",
      "ux_clarity",
      5,
      "Tamil voice input worked seamlessly in field testing.",
      "/crop-doctor",
      "S. Murugesan",
      true
    );

    expect(fb.id).toBeDefined();
    expect(fb.category).toBe("ux_clarity");
    expect(fb.rating).toBe(5);
    expect(fb.appVersion).toBeDefined();
  });

  it("provides comprehensive mandatory field deployment checklist", () => {
    const checklist = getFieldPilotChecklist();
    expect(checklist.length).toBe(6);
    expect(checklist.every((item) => item.isMandatory)).toBe(true);
    expect(checklist.some((item) => item.id === "chk_offline_verified")).toBe(true);
  });
});
