import { describe, it, expect } from "vitest";
import {
  RESEARCH_ADVISORY_FEED,
  getFilteredAdvisories,
} from "@/lib/services/advisoryFeedService";

describe("Phase 50 — Agricultural Research & Extension Feed", () => {
  it("contains verified advisories with official citations and links", () => {
    expect(RESEARCH_ADVISORY_FEED.length).toBeGreaterThan(2);
    RESEARCH_ADVISORY_FEED.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.source).toBeDefined();
      expect(item.officialLink.startsWith("https://")).toBe(true);
      expect(item.summaryEn).toBeDefined();
      expect(item.summaryTa).toBeDefined();
    });
  });

  it("filters advisories by target crop and category correctly", () => {
    const paddyAdvisories = getFilteredAdvisories("Paddy", "All Districts", "all");
    expect(paddyAdvisories.length).toBeGreaterThan(0);
    paddyAdvisories.forEach((a) => {
      expect(a.targetCrops.some((c) => c.toLowerCase().includes("paddy") || c.toLowerCase().includes("rice"))).toBe(true);
    });
  });
});
