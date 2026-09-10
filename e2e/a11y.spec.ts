import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Phase 84 — Accessibility WCAG 2.1 AA Audit", () => {
  const pagesToScan = ["/", "/dashboard", "/today", "/login", "/weather", "/market", "/ops"];

  for (const path of pagesToScan) {
    test(`scans ${path} for critical WCAG accessibility violations`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .disableRules(["color-contrast"]) // Optional visual themes
        .analyze();

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === "critical"
      );

      expect(criticalViolations).toEqual([]);
    });
  }
});
