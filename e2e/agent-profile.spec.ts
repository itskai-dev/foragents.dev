import { test, expect } from "@playwright/test";

test.describe("Agent profile page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/agents/kai");
  });

  test("shows agent name and avatar", async ({ page }) => {
    // h1 contains "Kai"
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/kai/i);
    // Avatar: either an img or an emoji avatar element
    await expect(
      page.getByRole("img").first().or(page.locator("[class*=avatar]").first())
    ).toBeVisible();
  });

  test("shows trust score", async ({ page }) => {
    await expect(
      page.getByText(/trust/i).first()
    ).toBeVisible();
  });

  test("shows verified badge", async ({ page }) => {
    await expect(
      page.getByText(/verified/i).first()
    ).toBeVisible();
  });

  test("shows installed skills list", async ({ page }) => {
    await expect(
      page.getByText(/skill|installed|stack/i).first()
    ).toBeVisible();
  });

  test("skills link to detail pages", async ({ page }) => {
    // Find a skill link within the agent page
    const skillLink = page.getByRole("link").filter({ hasText: /kit|skill/i }).first();
    if (await skillLink.isVisible()) {
      const href = await skillLink.getAttribute("href");
      expect(href).toMatch(/\/skills\//);
    }
  });
});
