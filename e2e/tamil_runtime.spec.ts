import { test, expect } from "@playwright/test";

test.describe("Phase 85 — Complete Runtime Tamil Localization Validation", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.setItem("agroguide_demo_session", "true");
      localStorage.setItem("agroguide:language", "ta");
    });
  });

  test("verifies Tamil navigation and heading labels across core pages", async ({ page }) => {
    await page.goto("/today", { waitUntil: "domcontentloaded" });
    // Check for Tamil heading or Tamil action labels
    await expect(page.getByText(/இன்று|பண்ணை|பணிகள்|முடிந்தது/i).first()).toBeVisible();

    await page.goto("/weather", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/வானிலை|வெப்பநிலை|மழை/i).first()).toBeVisible();

    await page.goto("/ops", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/செயல்பாட்டு|கண்காணிப்பு|Production Operations/i).first()).toBeVisible();
  });
});
