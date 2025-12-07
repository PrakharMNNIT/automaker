import { test, expect } from "@playwright/test";

test.describe("Settings - API Key Management", () => {
  test("can navigate to settings page", async ({ page }) => {
    await page.goto("/");

    // Click settings button in sidebar
    await page.getByTestId("settings-button").click();

    // Should show settings view
    await expect(page.getByTestId("settings-view")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByText("API Keys", { exact: true })).toBeVisible();
  });

  test("shows Anthropic and Google API key inputs", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("settings-button").click();

    // Check input fields exist
    await expect(page.getByTestId("anthropic-api-key-input")).toBeVisible();
    await expect(page.getByTestId("google-api-key-input")).toBeVisible();
  });

  test("can enter and save Anthropic API key", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("settings-button").click();

    // Enter API key
    await page.getByTestId("anthropic-api-key-input").fill("sk-ant-test-key-123");

    // Save
    await page.getByTestId("save-settings").click();

    // Should show saved confirmation
    await expect(page.getByText("Saved!")).toBeVisible();

    // Reload page and verify key persists
    await page.reload();
    await page.getByTestId("settings-button").click();

    // Toggle visibility to see the key
    await page.getByTestId("toggle-anthropic-visibility").click();
    await expect(page.getByTestId("anthropic-api-key-input")).toHaveValue("sk-ant-test-key-123");
  });

  test("can enter and save Google API key", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("settings-button").click();

    // Enter API key
    await page.getByTestId("google-api-key-input").fill("AIzaSyTest123");

    // Save
    await page.getByTestId("save-settings").click();

    // Reload page and verify key persists
    await page.reload();
    await page.getByTestId("settings-button").click();

    // Toggle visibility
    await page.getByTestId("toggle-google-visibility").click();
    await expect(page.getByTestId("google-api-key-input")).toHaveValue("AIzaSyTest123");
  });

  test("API key inputs are password type by default", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("settings-button").click();

    // Check input types are password
    await expect(page.getByTestId("anthropic-api-key-input")).toHaveAttribute("type", "password");
    await expect(page.getByTestId("google-api-key-input")).toHaveAttribute("type", "password");
  });

  test("can toggle API key visibility", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("settings-button").click();

    // Initially password type
    await expect(page.getByTestId("anthropic-api-key-input")).toHaveAttribute("type", "password");

    // Toggle visibility
    await page.getByTestId("toggle-anthropic-visibility").click();

    // Now should be text type
    await expect(page.getByTestId("anthropic-api-key-input")).toHaveAttribute("type", "text");

    // Toggle back
    await page.getByTestId("toggle-anthropic-visibility").click();
    await expect(page.getByTestId("anthropic-api-key-input")).toHaveAttribute("type", "password");
  });

  test("can navigate back to home from settings", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("settings-button").click();

    // Click back to home
    await page.getByTestId("back-to-home").click();

    // Should be back on welcome view
    await expect(page.getByTestId("welcome-view")).toBeVisible();
  });

  test("shows security notice about local storage", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("settings-button").click();

    // Should show security notice
    await expect(page.getByText("Security Notice")).toBeVisible();
    await expect(page.getByText(/stored in your browser's local storage/i)).toBeVisible();
  });
});
