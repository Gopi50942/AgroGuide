import { test, expect } from "@playwright/test";

test.describe("Phases 102–181 — Final Government Super Platform Browser E2E Suite", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.setItem("agroguide_demo_session", "true");
    });
  });

  test("1. loads state agriculture command center with district telemetry and KPI cards", async ({ page }) => {
    await page.goto("/government-console");
    await expect(
      page.getByText(/Command Center|கட்டுப்பாட்டு மையம்/i).first()
    ).toBeVisible();

    await expect(page.getByText(/Digitized Acreage/i).first()).toBeVisible();
    await expect(page.getByText(/Decision Priorities/i).first()).toBeVisible();
  });

  test("2. navigates through state console tabs (Priorities, Village Twin, SOS, Open Data, Knowledge Graph)", async ({ page }) => {
    await page.goto("/government-console");

    // Click Decision Priorities tab
    await page.getByRole("button", { name: /Decision Priorities/i }).click();
    await expect(page.getByText(/State Agriculture Decision Intelligence Priorities/i)).toBeVisible();
    await expect(page.getByText(/DAP Buffer Deficit/i)).toBeVisible();

    // Click Village Digital Twin tab
    await page.getByRole("button", { name: /Village Digital Twin/i }).click();
    await expect(page.getByText(/Village Agriculture Digital Twin Operational Model/i)).toBeVisible();
    await expect(page.getByText(/Alandurai/i).first()).toBeVisible();

    // Click Disaster SOS Queue tab
    await page.getByRole("button", { name: /Disaster SOS Queue/i }).click();
    await expect(page.getByText(/Farmer Disaster SOS & Rapid Response Queue/i)).toBeVisible();

    // Click Open Data tab
    await page.getByRole("button", { name: /Open Data API/i }).click();
    await expect(page.getByText(/State Agriculture Open Data Exchange/i)).toBeVisible();
    await expect(page.getByText(/\/api\/open-data\/v1\/crop-acreage/i)).toBeVisible();
  });

  test("3. loads Farmer Unified Agriculture Passbook page", async ({ page }) => {
    await page.goto("/passbook");
    await expect(
      page.getByText(/Farmer Unified Agriculture Passbook|பண்ணைப் புத்தகம்/i).first()
    ).toBeVisible();
    await expect(page.getByText(/Active Crop Portfolio/i)).toBeVisible();
  });

  test("4. loads Public Farmer Service Status Portal and performs status tracking", async ({ page }) => {
    await page.goto("/service-status");
    await expect(
      page.getByText(/Public Farmer Service Status Portal|சேவை நிலை/i).first()
    ).toBeVisible();

    await page.getByPlaceholder(/AG-GRV-/i).fill("AG-GRV-CBE-2026-000123");
    await page.getByRole("button", { name: /Track Status/i }).click();
    await expect(page.getByText(/Under Review by District Officer/i)).toBeVisible();
  });

  test("5. loads State Agriculture Control Room (NOC)", async ({ page }) => {
    await page.goto("/state-control-room");
    await expect(
      page.getByText(/State Agriculture Control Room|NOC/i).first()
    ).toBeVisible();
    await expect(page.getByText(/Next.js Core Application Runtime/i)).toBeVisible();
  });
});
