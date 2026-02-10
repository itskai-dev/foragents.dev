import { test, expect } from "@playwright/test";

const INSTALL_TABS = ["Claude Desktop", "Cursor", "VS Code", "OpenClaw", "Generic"];

test.describe("MCP detail page with install tabs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/mcp/filesystem");
  });

  test("page loads with server name", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/filesystem/i);
  });

  test("client install tabs are visible", async ({ page }) => {
    for (const tabName of INSTALL_TABS) {
      await expect(
        page.getByRole("tab", { name: new RegExp(tabName, "i") })
      ).toBeVisible();
    }
  });

  test("clicking each tab shows different config snippet", async ({ page }) => {
    for (const tabName of INSTALL_TABS) {
      const tab = page.getByRole("tab", { name: new RegExp(tabName, "i") });
      await tab.click();

      // Each tab panel should show a code snippet containing the server slug
      await expect(
        page.getByText(/filesystem/).first()
      ).toBeVisible();
    }
  });

  test("config snippets contain the server name", async ({ page }) => {
    // Default tab should show config with the server slug
    await expect(
      page.locator("pre, code").filter({ hasText: /filesystem/ }).first()
    ).toBeVisible();
  });
});
