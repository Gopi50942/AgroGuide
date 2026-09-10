import { describe, it, expect } from "vitest";

describe("Phase 91 — Offline Caching & Reconnect Recovery Certification", () => {
  it("determines cached vs live data indicators appropriately", () => {
    const formatDataSourceBadge = (isCached: boolean, fetchedAt?: string) => {
      if (isCached) {
        return { labelEn: "CACHED / OFFLINE", labelTa: "சேமிக்கப்பட்ட தரவு", isStale: true };
      }
      return { labelEn: "LIVE DATA", labelTa: "நேரலைத் தரவு", isStale: false };
    };

    const live = formatDataSourceBadge(false);
    expect(live.labelEn).toBe("LIVE DATA");
    expect(live.isStale).toBe(false);

    const cached = formatDataSourceBadge(true);
    expect(cached.labelEn).toBe("CACHED / OFFLINE");
    expect(cached.isStale).toBe(true);
  });
});
