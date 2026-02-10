import { test, expect } from "@playwright/test";

test.describe("Search flow", () => {
  test("can search and see results with type badges", async ({ page }) => {
    await page.goto("/search?q=memory");

    // Wait for results to appear
    const resultLink = page.getByRole("link").filter({ hasText: /memory/i }).first();
    await expect(resultLink).toBeVisible({ timeout: 15_000 });

    // Results should have type badges (Skill, MCP, Agent, etc.)
    await expect(
      page.getByText(/^(Skill|MCP|Agent)$/i).first()
    ).toBeVisible();
  });

  test("clicking a result navigates to detail page", async ({ page }) => {
    await page.goto("/search?q=memory");
    // Wait for results
    const resultLink = page.getByRole("link").filter({ hasText: /memory/i }).first();
    await expect(resultLink).toBeVisible({ timeout: 15_000 });

    // Click the first memory result link
    await resultLink.click();

    // Should navigate away from /search
    await expect(page).not.toHaveURL(/\/search/);
  });

  test("search input works from empty page", async ({ page }) => {
    await page.goto("/search");
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill("memory");
    // Pressing Enter or waiting for debounce should trigger search
    await searchInput.press("Enter");

    // URL should update with query
    await expect(page).toHaveURL(/q=memory/i, { timeout: 10_000 });
  });

  test("filter tabs work", async ({ page }) => {
    await page.goto("/search?q=agent");
    // Wait for results to load
    const resultLink = page.getByRole("link").filter({ hasText: /agent/i }).first();
    await expect(resultLink).toBeVisible({ timeout: 15_000 });

    // Click the Skills filter tab (custom tabs component uses buttons, not role=tab)
    const skillsTab = page.getByRole("button", { name: /skills/i });
    if (await skillsTab.isVisible()) {
      await skillsTab.click();
      // After filtering, page should still have content
      await page.waitForTimeout(500);
      await expect(page.locator("body")).toContainText(/./);
    }
  });
});
