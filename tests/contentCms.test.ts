import { describe, it, expect } from "vitest";
import {
  listPublishedContent,
  DEMO_CONTENT_CATALOG,
} from "@/lib/services/contentCmsService";

describe("Phase 53 — Agriculture Content / Admin CMS", () => {
  it("lists published content catalog items with valid versioning", async () => {
    const items = await listPublishedContent();
    expect(items.length).toBeGreaterThan(0);
    items.forEach((item) => {
      expect(item.status).toBe("published");
      expect(item.version).toBeDefined();
      expect(item.titleEn).toBeDefined();
      expect(item.titleTa).toBeDefined();
    });
  });

  it("filters content by catalog type", async () => {
    const schemes = await listPublishedContent("scheme_definition");
    expect(schemes.length).toBeGreaterThan(0);
    schemes.forEach((s) => expect(s.type).toBe("scheme_definition"));
  });
});
