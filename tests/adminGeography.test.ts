import { describe, it, expect } from "vitest";
import {
  getAdministrativeHierarchy,
  getDistricts,
  getBlocks,
  getVillages,
} from "@/lib/services/adminGeographyService";

describe("Phase 103 — Administrative Geography Hierarchy", () => {
  it("loads Tamil Nadu administrative regions with state, district, block, and village hierarchy", () => {
    const all = getAdministrativeHierarchy();
    expect(all.length).toBeGreaterThan(5);

    const districts = getDistricts("TN");
    expect(districts.some((d) => d.code === "CBE")).toBe(true);
    expect(districts.some((d) => d.nameEn === "Thanjavur")).toBe(true);

    const blocks = getBlocks("CBE");
    expect(blocks.some((b) => b.nameEn === "Pollachi")).toBe(true);
    expect(blocks.some((b) => b.nameEn === "Thondamuthur")).toBe(true);

    const villages = getVillages("THM");
    expect(villages.some((v) => v.nameEn === "Alandurai")).toBe(true);
  });

  it("marks internal codes cleanly without fabricating official codes", () => {
    const blocks = getBlocks("CBE");
    const internalBlock = blocks.find((b) => b.code.startsWith("AG-ADM-"));
    expect(internalBlock).toBeDefined();
    expect(internalBlock?.isInternalCode).toBe(true);
  });
});
