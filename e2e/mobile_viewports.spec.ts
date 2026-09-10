import { test, expect, type Page } from "@playwright/test";

async function assertNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  // Allow 2px leeway for fractional subpixel antialiasing
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
}

const VIEWPORTS = [
  { name: "iPhone SE (1st gen)", width: 320, height: 568 },
  { name: "Small Android", width: 360, height: 800 },
  { name: "iPhone 12/13 Mini", width: 375, height: 812 },
  { name: "iPhone 14/15", width: 390, height: 844 },
  { name: "Pixel 7", width: 412, height: 915 },
  { name: "iPhone 15 Pro Max", width: 430, height: 932 },
  { name: "iPad Portrait", width: 768, height: 1024 },
];

const PAGES_TO_TEST = [
  "/",
  "/dashboard",
  "/today",
  "/farm",
  "/weather",
  "/market",
  "/crop-doctor",
  "/finance",
  "/government",
  "/ops",
];

test.describe("Phase 83 — Mobile Device UX & Viewport Certification", () => {
  for (const vp of VIEWPORTS) {
    test(`verifies zero horizontal overflow at ${vp.width}x${vp.height} (${vp.name})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const path of PAGES_TO_TEST) {
        await page.goto(path, { waitUntil: "domcontentloaded" });
        await assertNoHorizontalOverflow(page);
      }
    });
  }
});
