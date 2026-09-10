import { describe, it, expect } from "vitest";
import {
  createProduceQualityRecord,
  listProduceQualityRecords,
} from "@/lib/services/qualityGradingService";

describe("Phase 72 — Produce Quality Grading Records", () => {
  it("creates quality grading record with explicit assessment source", async () => {
    const record = await createProduceQualityRecord(
      "farmer_01",
      "Paddy (CR 1009)",
      "Grade A / Premium",
      9,
      "farmer_self",
      {
        moisturePercent: 13.5,
        sizeCategory: "Medium",
        notes: "Well dried on threshing floor",
      },
      true
    );

    expect(record.grade).toBe("Grade A / Premium");
    expect(record.visualQualityScore).toBe(9);
    expect(record.moisturePercent).toBe(13.5);
    expect(record.assessmentType).toBe("farmer_self");
    expect(record.assessorName).toContain("Farmer Self");
  });
});
