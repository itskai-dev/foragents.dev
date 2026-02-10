import { test, expect } from "@playwright/test";

test.describe("Core page navigation", () => {
  test("homepage loads and shows skills directory", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/forAgents\.dev/);
    // Should have skill cards or a skills section
    await expect(
      page.getByRole("heading", { level: 1 }).first()
    ).toBeVisible();
    // Look for skill-related content
    await expect(page.getByRole("link", { name: /skills/i }).first()).toBeVisible();
  });

  test("/agents loads and shows agent cards", async ({ page }) => {
    await page.goto("/agents");
    await expect(page).toHaveTitle(/agents/i);
    // Should show at least one agent link/card
    await expect(page.getByRole("link", { name: /kai|scout|link/i }).first()).toBeVisible();
  });

  test("/mcp loads and shows MCP servers", async ({ page }) => {
    await page.goto("/mcp");
    await expect(page).toHaveTitle(/mcp/i);
    // Should show server cards
    await expect(page.getByRole("link", { name: /filesystem|memory|postgres/i }).first()).toBeVisible();
  });

  test("/search loads with search input", async ({ page }) => {
    await page.goto("/search");
    await expect(page).toHaveTitle(/search/i);
    await expect(
      page.getByRole("textbox").or(page.getByPlaceholder(/search/i)).first()
    ).toBeVisible();
  });

  test("/auth/signin loads with sign-in form", async ({ page }) => {
    await page.goto("/auth/signin");
    // Should show a sign-in heading or form
    await expect(
      page.getByRole("heading", { name: /sign in/i }).or(page.getByText(/sign in/i).first())
    ).toBeVisible();
  });

  test("/compatibility loads matrix", async ({ page }) => {
    await page.goto("/compatibility");
    await expect(page).toHaveTitle(/compatibility/i);
    // Should show a table or grid for the compatibility matrix
    await expect(
      page.getByRole("table").or(page.getByText(/compatibility/i).first())
    ).toBeVisible();
  });
});
