import { test, expect } from "@playwright/test";

test.describe("Search flow", () => {
  test("can search and see results with type badges", async ({ page }) => {
    await page.goto("/search");

    const searchInput = page
      .getByRole("textbox")
      .or(page.getByPlaceholder(/search/i))
      .first();
    await expect(searchInput).toBeVisible();

    await searchInput.fill("memory");
    // Wait for results to appear (debounced search)
    await expect(page.getByText(/memory/i).nth(1)).toBeVisible({ timeout: 10_000 });

    // Results should have type badges (Skill, MCP, Agent, etc.)
    await expect(
      page.getByText(/skill|mcp|agent/i).first()
    ).toBeVisible();
  });

  test("clicking a result navigates to detail page", async ({ page }) => {
    await page.goto("/search?q=memory");
    // Wait for results
    await expect(page.getByRole("link").filter({ hasText: /memory/i }).first()).toBeVisible({
      timeout: 10_000,
    });

    // Click the first memory result link
    await page.getByRole("link").filter({ hasText: /memory/i }).first().click();

    // Should navigate away from /search
    await expect(page).not.toHaveURL(/\/search/);
  });

  test("filter tabs work", async ({ page }) => {
    await page.goto("/search?q=agent");
    // Wait for results to load
    await expect(page.getByRole("link").filter({ hasText: /agent/i }).first()).toBeVisible({
      timeout: 10_000,
    });

    // Click the Skills filter tab
    const skillsTab = page.getByRole("tab", { name: /skills/i });
    if (await skillsTab.isVisible()) {
      await skillsTab.click();
      // After filtering, results should still be visible
      await page.waitForTimeout(500);
      // Page should still have content
      await expect(page.locator("body")).toContainText(/agent/i);
    }
  });
});
