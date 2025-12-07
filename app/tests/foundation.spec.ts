import { test, expect } from "@playwright/test";

test.describe("Application Foundation", () => {
  test("loads the application with sidebar and welcome view", async ({ page }) => {
    await page.goto("/");

    // Verify main container exists
    await expect(page.getByTestId("app-container")).toBeVisible();

    // Verify sidebar is visible
    await expect(page.getByTestId("sidebar")).toBeVisible();

    // Verify welcome view is shown by default
    await expect(page.getByTestId("welcome-view")).toBeVisible();
  });

  test("displays Automaker title in sidebar", async ({ page }) => {
    await page.goto("/");

    // Verify the title is visible in the sidebar (be specific to avoid matching welcome heading)
    await expect(page.getByTestId("sidebar").getByRole("heading", { name: "Automaker" })).toBeVisible();
  });

  test("shows New Project and Open Project buttons", async ({ page }) => {
    await page.goto("/");

    // Verify project action buttons in welcome view
    await expect(page.getByTestId("new-project-card")).toBeVisible();
    await expect(page.getByTestId("open-project-card")).toBeVisible();
  });

  test("sidebar can be collapsed and expanded", async ({ page }) => {
    await page.goto("/");

    const sidebar = page.getByTestId("sidebar");
    const toggleButton = page.getByTestId("toggle-sidebar");

    // Initially sidebar should be expanded (width 256px / w-64)
    await expect(sidebar).toHaveClass(/w-64/);

    // Click to collapse
    await toggleButton.click();
    await expect(sidebar).toHaveClass(/w-16/);

    // Click to expand again
    await toggleButton.click();
    await expect(sidebar).toHaveClass(/w-64/);
  });

  test("shows Web Mode indicator when running in browser", async ({ page }) => {
    await page.goto("/");

    // When running in browser (not Electron), should show mock indicator
    await expect(page.getByText("Web Mode (Mock IPC)")).toBeVisible();
  });
});

test.describe("Theme Toggle", () => {
  test("toggles between dark and light mode", async ({ page }) => {
    await page.goto("/");

    const themeButton = page.getByTestId("toggle-theme");
    const html = page.locator("html");

    // Initially should be in dark mode
    await expect(html).toHaveClass(/dark/);

    // Click to switch to light mode
    await themeButton.click();
    await expect(html).not.toHaveClass(/dark/);

    // Click to switch back to dark mode
    await themeButton.click();
    await expect(html).toHaveClass(/dark/);
  });
});
