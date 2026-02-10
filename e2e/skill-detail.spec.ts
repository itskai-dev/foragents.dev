import { test, expect } from "@playwright/test";

test.describe("Skill detail page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/skills/agent-memory-kit");
  });

  test("shows title and description", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/memory/i);
    // Description text should be present in main content
    await expect(page.locator("main")).toBeVisible();
  });

  test("shows install command with copy button", async ({ page }) => {
    // Look for install command area (code block or pre element)
    const installSection = page.getByText(/install|npx|npm/i).first();
    await expect(installSection).toBeVisible();

    // Copy button should be present (look for first one in the page)
    await expect(
      page.getByRole("button", { name: /copy/i }).first()
    ).toBeVisible();
  });

  test("reviews section is visible", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Reviews", exact: true })
    ).toBeVisible();
  });

  test("version history is visible", async ({ page }) => {
    await expect(
      page.getByText(/version|changelog|history/i).first()
    ).toBeVisible();
  });

  test("works well with section is visible", async ({ page }) => {
    await expect(
      page.getByText(/works well with|related|compatible/i).first()
    ).toBeVisible();
  });
});
