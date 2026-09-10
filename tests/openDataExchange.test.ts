import { describe, it, expect } from "vitest";
import { getOpenDataMeta, OPEN_DATA_DISCLAIMER } from "@/lib/services/openDataExchangeService";

describe("Phase 151 — State Agriculture Open Data Exchange", () => {
  it("enforces 5-farm privacy cohort masking and attaches standard open data metadata", () => {
    const meta = getOpenDataMeta("crop-acreage", "Crop Acreage Open Feed");
    expect(meta.endpoint).toBe("/api/open-data/v1/crop-acreage");
    expect(meta.minimumCohortThreshold).toBe(5);
    expect(meta.disclaimer).toBe(OPEN_DATA_DISCLAIMER);
  });
});
