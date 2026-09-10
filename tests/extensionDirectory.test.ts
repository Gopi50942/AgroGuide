import { describe, it, expect } from "vitest";
import { EXTENSION_DIRECTORIES } from "@/lib/data/extensionDirectory";

describe("Phase 26 — KVK & Extension Directory", () => {
  it("contains verified extension records with valid source citations", () => {
    expect(EXTENSION_DIRECTORIES.length).toBeGreaterThan(5);

    EXTENSION_DIRECTORIES.forEach((entry) => {
      expect(entry.id).toBeDefined();
      expect(entry.nameEn).toBeDefined();
      expect(entry.nameTa).toBeDefined();
      expect(entry.district).toBeDefined();
      expect(entry.verifiedSource).toBeDefined();
      expect(entry.servicesOfferedEn.length).toBeGreaterThan(0);
      expect(entry.servicesOfferedTa.length).toBeGreaterThan(0);
      // Either phone, tollFree, or officialWebsite must exist
      expect(Boolean(entry.phone || entry.tollFree || entry.officialWebsite)).toBe(true);
    });
  });

  it("includes central Kisan Call Center with 1800-180-1551", () => {
    const kcc = EXTENSION_DIRECTORIES.find((e) => e.tollFree === "1800-180-1551");
    expect(kcc).toBeDefined();
    expect(kcc?.type).toBe("kisan_call_center");
  });
});
