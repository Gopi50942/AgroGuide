import { describe, it, expect } from "vitest";
import { formatDataFreshness } from "@/hooks/useNetworkStatus";

describe("Data Freshness Formatter", () => {
  it("formats minutes ago correctly for English and Tamil", () => {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const enFresh = formatDataFreshness(tenMinAgo, "en");
    expect(enFresh.label).toContain("10m ago");
    expect(enFresh.isStale).toBe(false);

    const taFresh = formatDataFreshness(tenMinAgo, "ta");
    expect(taFresh.label).toContain("10 நிமிடங்களுக்கு முன்");
  });

  it("identifies stale cache (> 12 hours)", () => {
    const eighteenHoursAgo = new Date(Date.now() - 18 * 3600 * 1000).toISOString();
    const result = formatDataFreshness(eighteenHoursAgo, "en");
    expect(result.isStale).toBe(true);
  });
});
