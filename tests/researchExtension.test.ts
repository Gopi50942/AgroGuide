import { describe, it, expect } from "vitest";
import { listResearchPublications } from "@/lib/services/researchExtensionService";

describe("Phase 149 — University Research Extension Connector", () => {
  it("provides curated research bulletins with verified source attribution", async () => {
    const pubs = await listResearchPublications("Onion");
    expect(pubs.length).toBeGreaterThanOrEqual(1);
    expect(pubs[0].source).toBe("TNAU");
    expect(pubs[0].officialUrl).toContain("tnau.ac.in");
  });
});
