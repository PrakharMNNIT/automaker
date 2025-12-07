import { test, expect } from "@playwright/test";

test.describe("Agent Tools", () => {
  test("can navigate to agent tools view when project is open", async ({ page }) => {
    await page.goto("/");

    // Create a project first
    await page.getByTestId("new-project-card").click();
    await page.getByTestId("project-name-input").fill("Test Project");
    await page.getByTestId("project-path-input").fill("/test/path");
    await page.getByTestId("confirm-create-project").click();

    // Wait for board view to load
    await expect(page.getByTestId("board-view")).toBeVisible();

    // Navigate to agent tools
    await page.getByTestId("nav-tools").click();

    // Verify agent tools view is displayed
    await expect(page.getByTestId("agent-tools-view")).toBeVisible();
  });

  test("agent tools view shows all three tool cards", async ({ page }) => {
    await page.goto("/");

    // Create a project first
    await page.getByTestId("new-project-card").click();
    await page.getByTestId("project-name-input").fill("Test Project");
    await page.getByTestId("project-path-input").fill("/test/path");
    await page.getByTestId("confirm-create-project").click();

    // Navigate to agent tools
    await page.getByTestId("nav-tools").click();

    // Verify all three tool cards are visible
    await expect(page.getByTestId("read-file-tool")).toBeVisible();
    await expect(page.getByTestId("write-file-tool")).toBeVisible();
    await expect(page.getByTestId("terminal-tool")).toBeVisible();
  });

  test.describe("Read File Tool", () => {
    test("agent can request to read file and receive content", async ({ page }) => {
      await page.goto("/");

      // Create a project first
      await page.getByTestId("new-project-card").click();
      await page.getByTestId("project-name-input").fill("Test Project");
      await page.getByTestId("project-path-input").fill("/test/path");
      await page.getByTestId("confirm-create-project").click();

      // Navigate to agent tools
      await page.getByTestId("nav-tools").click();

      // Enter a file path
      await page.getByTestId("read-file-path-input").fill("/test/path/feature_list.json");

      // Click execute
      await page.getByTestId("read-file-button").click();

      // Wait for result
      await expect(page.getByTestId("read-file-result")).toBeVisible();

      // Verify success message
      await expect(page.getByTestId("read-file-result")).toContainText("Success");
    });

    test("read file tool shows input field for file path", async ({ page }) => {
      await page.goto("/");

      // Create a project first
      await page.getByTestId("new-project-card").click();
      await page.getByTestId("project-name-input").fill("Test Project");
      await page.getByTestId("project-path-input").fill("/test/path");
      await page.getByTestId("confirm-create-project").click();

      // Navigate to agent tools
      await page.getByTestId("nav-tools").click();

      // Verify input field exists
      await expect(page.getByTestId("read-file-path-input")).toBeVisible();
      await expect(page.getByTestId("read-file-button")).toBeVisible();
    });
  });

  test.describe("Write File Tool", () => {
    test("agent can request to write file and file is written", async ({ page }) => {
      await page.goto("/");

      // Create a project first
      await page.getByTestId("new-project-card").click();
      await page.getByTestId("project-name-input").fill("Test Project");
      await page.getByTestId("project-path-input").fill("/test/path");
      await page.getByTestId("confirm-create-project").click();

      // Navigate to agent tools
      await page.getByTestId("nav-tools").click();

      // Enter file path and content
      await page.getByTestId("write-file-path-input").fill("/test/path/new-file.txt");
      await page.getByTestId("write-file-content-input").fill("Hello from agent!");

      // Click execute
      await page.getByTestId("write-file-button").click();

      // Wait for result
      await expect(page.getByTestId("write-file-result")).toBeVisible();

      // Verify success message
      await expect(page.getByTestId("write-file-result")).toContainText("Success");
      await expect(page.getByTestId("write-file-result")).toContainText("File written successfully");
    });

    test("write file tool shows path and content inputs", async ({ page }) => {
      await page.goto("/");

      // Create a project first
      await page.getByTestId("new-project-card").click();
      await page.getByTestId("project-name-input").fill("Test Project");
      await page.getByTestId("project-path-input").fill("/test/path");
      await page.getByTestId("confirm-create-project").click();

      // Navigate to agent tools
      await page.getByTestId("nav-tools").click();

      // Verify input fields exist
      await expect(page.getByTestId("write-file-path-input")).toBeVisible();
      await expect(page.getByTestId("write-file-content-input")).toBeVisible();
      await expect(page.getByTestId("write-file-button")).toBeVisible();
    });
  });

  test.describe("Terminal Tool", () => {
    test("agent can request to run terminal command and receive stdout", async ({ page }) => {
      await page.goto("/");

      // Create a project first
      await page.getByTestId("new-project-card").click();
      await page.getByTestId("project-name-input").fill("Test Project");
      await page.getByTestId("project-path-input").fill("/test/path");
      await page.getByTestId("confirm-create-project").click();

      // Navigate to agent tools
      await page.getByTestId("nav-tools").click();

      // Enter command (default is 'ls')
      await page.getByTestId("terminal-command-input").fill("ls");

      // Click execute
      await page.getByTestId("run-terminal-button").click();

      // Wait for result
      await expect(page.getByTestId("terminal-result")).toBeVisible();

      // Verify success and output
      await expect(page.getByTestId("terminal-result")).toContainText("Success");
      await expect(page.getByTestId("terminal-result")).toContainText("$ ls");
    });

    test("terminal tool shows command input field", async ({ page }) => {
      await page.goto("/");

      // Create a project first
      await page.getByTestId("new-project-card").click();
      await page.getByTestId("project-name-input").fill("Test Project");
      await page.getByTestId("project-path-input").fill("/test/path");
      await page.getByTestId("confirm-create-project").click();

      // Navigate to agent tools
      await page.getByTestId("nav-tools").click();

      // Verify input field exists
      await expect(page.getByTestId("terminal-command-input")).toBeVisible();
      await expect(page.getByTestId("run-terminal-button")).toBeVisible();
    });

    test("terminal tool can run pwd command", async ({ page }) => {
      await page.goto("/");

      // Create a project first
      await page.getByTestId("new-project-card").click();
      await page.getByTestId("project-name-input").fill("Test Project");
      await page.getByTestId("project-path-input").fill("/test/path");
      await page.getByTestId("confirm-create-project").click();

      // Navigate to agent tools
      await page.getByTestId("nav-tools").click();

      // Enter pwd command
      await page.getByTestId("terminal-command-input").fill("pwd");

      // Click execute
      await page.getByTestId("run-terminal-button").click();

      // Wait for result
      await expect(page.getByTestId("terminal-result")).toBeVisible();

      // Verify success
      await expect(page.getByTestId("terminal-result")).toContainText("Success");
    });
  });

  test("tool log section is visible", async ({ page }) => {
    await page.goto("/");

    // Create a project first
    await page.getByTestId("new-project-card").click();
    await page.getByTestId("project-name-input").fill("Test Project");
    await page.getByTestId("project-path-input").fill("/test/path");
    await page.getByTestId("confirm-create-project").click();

    // Navigate to agent tools
    await page.getByTestId("nav-tools").click();

    // Verify tool log section is visible
    await expect(page.getByTestId("tool-log")).toBeVisible();
  });
});
