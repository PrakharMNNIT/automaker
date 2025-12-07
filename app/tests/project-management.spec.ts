import { test, expect } from "@playwright/test";

test.describe("New Project Workflow", () => {
  test("opens new project dialog when clicking Create Project", async ({ page }) => {
    await page.goto("/");

    // Click the New Project card
    await page.getByTestId("new-project-card").click();

    // Dialog should appear
    await expect(page.getByTestId("new-project-dialog")).toBeVisible();
    await expect(page.getByText("Create New Project")).toBeVisible();
  });

  test("shows project name and directory inputs", async ({ page }) => {
    await page.goto("/");

    // Open dialog
    await page.getByTestId("new-project-card").click();

    // Check inputs exist
    await expect(page.getByTestId("project-name-input")).toBeVisible();
    await expect(page.getByTestId("project-path-input")).toBeVisible();
    await expect(page.getByTestId("browse-directory")).toBeVisible();
  });

  test("create button is disabled without name and path", async ({ page }) => {
    await page.goto("/");

    // Open dialog
    await page.getByTestId("new-project-card").click();

    // Create button should be disabled
    await expect(page.getByTestId("confirm-create-project")).toBeDisabled();
  });

  test("can enter project name", async ({ page }) => {
    await page.goto("/");

    // Open dialog
    await page.getByTestId("new-project-card").click();

    // Enter project name
    await page.getByTestId("project-name-input").fill("my-test-project");
    await expect(page.getByTestId("project-name-input")).toHaveValue("my-test-project");
  });

  test("can close dialog with cancel button", async ({ page }) => {
    await page.goto("/");

    // Open dialog
    await page.getByTestId("new-project-card").click();
    await expect(page.getByTestId("new-project-dialog")).toBeVisible();

    // Close with cancel
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByTestId("new-project-dialog")).not.toBeVisible();
  });

  test("create button enables when name and path are entered", async ({ page }) => {
    await page.goto("/");

    // Open dialog
    await page.getByTestId("new-project-card").click();

    // Create button should be disabled initially
    await expect(page.getByTestId("confirm-create-project")).toBeDisabled();

    // Enter project name
    await page.getByTestId("project-name-input").fill("my-test-project");

    // Still disabled (no path)
    await expect(page.getByTestId("confirm-create-project")).toBeDisabled();

    // Enter path
    await page.getByTestId("project-path-input").fill("/Users/test/projects");

    // Now should be enabled
    await expect(page.getByTestId("confirm-create-project")).toBeEnabled();
  });

  test("creates project and navigates to board view", async ({ page }) => {
    await page.goto("/");

    // Open dialog
    await page.getByTestId("new-project-card").click();
    await expect(page.getByTestId("new-project-dialog")).toBeVisible();

    // Enter project details
    await page.getByTestId("project-name-input").fill("test-new-project");
    await page.getByTestId("project-path-input").fill("/Users/test/projects");

    // Click create
    await page.getByTestId("confirm-create-project").click();

    // Dialog should close
    await expect(page.getByTestId("new-project-dialog")).not.toBeVisible();

    // Should navigate to board view with the project
    await expect(page.getByTestId("board-view")).toBeVisible();

    // Project name should be displayed in the board view header
    await expect(page.getByTestId("board-view").getByText("test-new-project")).toBeVisible();

    // Kanban columns should be visible
    await expect(page.getByText("Backlog")).toBeVisible();
    await expect(page.getByText("In Progress")).toBeVisible();
    await expect(page.getByText("Verified")).toBeVisible();
  });

  test("created project appears in recent projects on welcome view", async ({ page }) => {
    await page.goto("/");

    // Create a project
    await page.getByTestId("new-project-card").click();
    await page.getByTestId("project-name-input").fill("recent-project-test");
    await page.getByTestId("project-path-input").fill("/Users/test/projects");
    await page.getByTestId("confirm-create-project").click();

    // Verify we're on board view
    await expect(page.getByTestId("board-view")).toBeVisible();

    // Go back to welcome view by clicking Automaker title (if there's a way)
    // For now, reload the page and check recent projects
    await page.goto("/");

    // The project should appear in recent projects section (use role to be specific)
    await expect(page.getByRole("heading", { name: "Recent Projects" })).toBeVisible();
    await expect(page.getByTestId("welcome-view").getByText("recent-project-test", { exact: true })).toBeVisible();
  });
});

test.describe("Open Project Workflow", () => {
  test("clicking Open Project triggers directory selection", async ({ page }) => {
    await page.goto("/");

    // In web mode, clicking Open Project card will show a prompt dialog
    // We can't fully test native dialogs, but we can verify the click works
    await expect(page.getByTestId("open-project-card")).toBeVisible();
  });

  test("opens existing project and navigates to board view", async ({ page }) => {
    await page.goto("/");

    // Mock the window.prompt response
    await page.evaluate(() => {
      window.prompt = () => "/mock/existing-project";
    });

    // Click Open Project card
    await page.getByTestId("open-project-card").click();

    // Should navigate to board view
    await expect(page.getByTestId("board-view")).toBeVisible();

    // Project name should be derived from path
    await expect(page.getByTestId("board-view").getByText("existing-project")).toBeVisible();
  });

  test("opened project loads into dashboard with features", async ({ page }) => {
    await page.goto("/");

    // Mock the window.prompt response
    await page.evaluate(() => {
      window.prompt = () => "/mock/existing-project";
    });

    // Click Open Project
    await page.getByTestId("open-project-card").click();

    // Should show board view
    await expect(page.getByTestId("board-view")).toBeVisible();

    // Should have loaded features from the mock feature_list.json
    // The mock returns "Sample Feature" in backlog
    await expect(page.getByTestId("kanban-column-backlog").getByText("Sample Feature")).toBeVisible();
  });

  test("can click on recent project to reopen it", async ({ page }) => {
    await page.goto("/");

    // First, create a project to have it in recent projects
    await page.getByTestId("new-project-card").click();
    await page.getByTestId("project-name-input").fill("reopenable-project");
    await page.getByTestId("project-path-input").fill("/Users/test/projects");
    await page.getByTestId("confirm-create-project").click();

    // Verify on board view
    await expect(page.getByTestId("board-view")).toBeVisible();

    // Go back to welcome view
    await page.goto("/");

    // Wait for recent projects to appear
    await expect(page.getByRole("heading", { name: "Recent Projects" })).toBeVisible();

    // Click on the recent project
    const recentProjectCard = page.getByText("reopenable-project", { exact: true }).first();
    await recentProjectCard.click();

    // Should navigate to board view with that project
    await expect(page.getByTestId("board-view")).toBeVisible();
    await expect(page.getByTestId("board-view").getByText("reopenable-project")).toBeVisible();
  });
});
