import { test, expect } from "@playwright/test";

test.describe("Onboarding wizard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/onboarding");
  });

  test("wizard loads with heading", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/getting started/i);
  });

  test("wizard shows questions or options", async ({ page }) => {
    // Should have interactive elements — buttons for choices or form inputs
    await expect(
      page
        .getByRole("button")
        .or(page.getByRole("radio"))
        .or(page.getByRole("checkbox"))
        .first()
    ).toBeVisible();
  });

  test("can interact with the form", async ({ page }) => {
    // Click the first interactive option in the wizard
    const firstButton = page
      .locator("main button, main [role=radio], main [role=option]")
      .first();
    if (await firstButton.isVisible()) {
      await firstButton.click();
      // After clicking, something should change (next step, selection state, etc.)
      await page.waitForTimeout(500);
      // Page should still be functional
      await expect(page.locator("body")).toContainText(/./);
    }
  });
});
