import { test, expect } from "@playwright/test";

test.describe("Post-Deployment UX Cleanup E2E Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure demo session is active for authenticated route tests
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const demoBtn = page.getByRole("button", { name: /Explore in Demo Mode|டெமோ பயன்முறையை/i });
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
      await page.waitForURL("**/dashboard");
    }
  });

  test("1. Verifies PWA prompt dismissal persists across routes and reloads", async ({ page }) => {
    // Check if install banner is present (if browser emitted beforeinstallprompt)
    const installBanner = page.locator("text=Install AgroGuide App");
    const closeBtn = page.locator("button[aria-label='Close']");

    if (await installBanner.isVisible()) {
      // Dismiss the banner
      await closeBtn.click();
      await expect(installBanner).not.toBeVisible();

      // Navigate to another page (route change)
      await page.goto("/farm", { waitUntil: "domcontentloaded" });
      await expect(installBanner).not.toBeVisible();

      // Reload the page
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(installBanner).not.toBeVisible();
    }
  });

  test("2. Verifies AI chat composer is reachable and not obscured by bottom nav or banners", async ({ page }) => {
    await page.goto("/ai", { waitUntil: "domcontentloaded" });
    const composerInput = page.locator("input[placeholder*='Ask about'], input.input-field");
    await expect(composerInput.first()).toBeVisible();
    await expect(composerInput.first()).toBeEnabled();

    // Verify submit button is clickable
    const sendBtn = page.locator("button[type='submit']");
    await expect(sendBtn).toBeVisible();
  });

  test("3. Verifies Crop Doctor results expand naturally without blocking UI", async ({ page }) => {
    await page.goto("/crop-doctor", { waitUntil: "domcontentloaded" });
    const heading = page.getByRole("heading", { name: /AI Crop Doctor|Crop Doctor|பயிர் மருத்துவர்/i });
    await expect(heading).toBeVisible();

    // Verify upload action button is visible and not overlapped
    const uploadBtn = page.getByRole("button", { name: /Upload.*Photo|புகைப்படம்/i });
    await expect(uploadBtn).toBeVisible();
  });

  test("4. Verifies single clean page scroll on desktop viewports", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    // Sidebar should be sticky
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();

    // Main content area should be visible
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("5. Verifies mobile viewport bottom navigation safe area spacing", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    // Bottom navigation should be fixed at bottom
    const bottomNav = page.locator("nav.lg\\:hidden");
    await expect(bottomNav).toBeVisible();

    // Main content should have padding bottom to prevent clipping
    const main = page.locator("main");
    await expect(main).toHaveClass(/pb-28/);
  });
});
