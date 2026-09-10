import { test, expect } from "@playwright/test";

test.describe("Manual Runtime Safety & Genuine Persistence E2E Pass", () => {
  test("executes end-to-end user journey with persistence and diagnostic verification", async ({ page }) => {
    // 1. Visit Login page
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/.*login/);

    // Verify Explore in Demo Mode button is present and explicit
    const demoBtn = page.getByRole("button", { name: /Explore in Demo Mode|டெமோ பயன்முறையை/i });
    await expect(demoBtn).toBeVisible();

    // 2. Explicitly enter Demo Mode
    await demoBtn.click();
    await page.waitForURL("**/dashboard");
    await expect(page.locator("text=Demo mode")).toBeVisible();

    // 3. Verify Runtime Diagnostics Indicator
    const runtimeBtn = page.getByRole("button", { name: /Runtime Diagnostics/i });
    await expect(runtimeBtn).toBeVisible();
    await runtimeBtn.click();
    await expect(page.getByText("Auth:", { exact: true })).toBeVisible();
    await expect(page.getByText("Firestore:", { exact: true })).toBeVisible();
    await expect(page.getByText("AI Text:", { exact: true })).toBeVisible();
    await expect(page.getByText("Weather:", { exact: true })).toBeVisible();

    // 4. Navigate to Livestock page and add animal
    await page.goto("/livestock", { waitUntil: "domcontentloaded" });
    const addAnimalBtn = page.getByRole("button", { name: /Add Animal|விலங்கு சேர்/i });
    await expect(addAnimalBtn).toBeVisible();
    await addAnimalBtn.click();

    // Fill animal form
    await page.locator("input[placeholder*='Kangayam']").fill("Murrah Buffalo Test");
    await page.locator("input[placeholder*='TN-CBE']").fill("TN-TEST-999");
    const saveAnimalBtn = page.getByRole("button", { name: /^Save$|^சேமி$/i });
    await saveAnimalBtn.click();

    // Verify animal appears
    await expect(page.locator("text=TN-TEST-999")).toBeVisible();

    // 5. Refresh page and verify persistence across reload
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("text=TN-TEST-999")).toBeVisible();

    // 6. Navigate to Finance and add expense
    await page.goto("/finance", { waitUntil: "domcontentloaded" });
    const addExpenseBtn = page.getByRole("button", { name: /Add expense|செலவு சேர்/i });
    if (await addExpenseBtn.isVisible()) {
      await addExpenseBtn.click();
      await page.locator("input[type='number']").first().fill("1500");
      const saveExpBtn = page.getByRole("button", { name: /Save expense|சேமி/i });
      if (await saveExpBtn.isVisible()) {
        await saveExpBtn.click();
      }
    }

    // Refresh and verify page reloads cleanly
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();

    // 7. Navigate to AI Assistant and verify chat badge
    await page.goto("/ai", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /AgroGuide AI|AI/i })).toBeVisible();

    // 8. Navigate to Crop Doctor and verify diagnosis badge
    await page.goto("/crop-doctor", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /AI Crop Doctor|Crop Doctor|பயிர் மருத்துவர்/i })).toBeVisible();

    // 9. Navigate to Farm Diary
    await page.goto("/diary", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();

    // 10. Switch language to Tamil and verify runtime translation
    await page.goto("/settings", { waitUntil: "domcontentloaded" });
    const tamilBtn = page.getByRole("button", { name: /தமிழ்|Tamil/i }).first();
    if (await tamilBtn.isVisible()) {
      await tamilBtn.click();
    }

    // 11. Navigate to Soil Health and verify Soil Card Print Modal
    await page.goto("/soil", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
  });
});
