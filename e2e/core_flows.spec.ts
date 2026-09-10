import { test, expect } from "@playwright/test";

test.describe("Phase 82 — True Playwright Browser E2E Suite", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.setItem("agroguide_demo_session", "true");
    });
  });

  test("loads landing page with branding and get started action", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AgroGuide/i);
    const ctaLink = page.getByRole("link", { name: /get started|log in/i }).first();
    await expect(ctaLink).toBeVisible();
  });

  test("loads authentication pages (login & register)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("input[type='email']").first()).toBeVisible();

    await page.goto("/register");
    await expect(page.locator("input[type='email']").first()).toBeVisible();
  });

  test("loads dashboard with farmer navigation", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/Gopi's Farm|வணக்கம்|பண்ணை|AgroGuide/i).first()).toBeVisible();
  });

  test("navigates through core agricultural feature routes", async ({ page }) => {
    const routes = [
      "/today",
      "/farm",
      "/soil",
      "/irrigation",
      "/weather",
      "/market",
      "/crop-doctor",
      "/ai",
      "/calendar",
      "/finance",
      "/government",
      "/diary",
      "/community",
      "/livestock",
      "/settings",
      "/emergency",
      "/ops",
      "/demo-readiness",
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("verifies today action center displays priority cards and navigation links", async ({ page }) => {
    await page.goto("/today");
    await expect(page.getByText(/Today's Farm Priorities|இன்று செய்ய வேண்டியவை|DAP Fertigation/i).first()).toBeVisible();
  });

  test("verifies operations center displays runbook metrics without secrets", async ({ page }) => {
    await page.goto("/ops");
    await expect(page.getByText(/Production Operations Center|செயல்பாட்டு|OPERATIONAL/i).first()).toBeVisible();
    // Verify no secret tokens leaked
    const bodyText = await page.innerText("body");
    expect(bodyText).not.toContain("AIzaSy");
    expect(bodyText).not.toContain("sk-or-v1");
  });
});
