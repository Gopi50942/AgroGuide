import { describe, it, expect } from "vitest";
import { en, ta } from "@/lib/i18n/translations";

describe("i18n Key Parity Verification", () => {
  it("maintains 100% key parity between English and Tamil dictionaries", () => {
    const enKeys = Object.keys(en);
    const taKeys = Object.keys(ta);

    const missingInTa = enKeys.filter((k) => !(k in ta));
    const missingInEn = taKeys.filter((k) => !(k in en));

    expect(missingInTa).toEqual([]);
    expect(missingInEn).toEqual([]);
    expect(enKeys.length).toBe(taKeys.length);
    expect(enKeys.length).toBeGreaterThanOrEqual(530);
  });
});
