import { test, expect } from "@playwright/test";

test.describe("Project Analysis", () => {
  test("can navigate to analysis view when project is open", async ({ page }) => {
    await page.goto("/");

    // Create a project first
    await page.getByTestId("new-project-card").click();
    await expect(page.getByTestId("new-project-dialog")).toBeVisible();
    await page.getByTestId("project-name-input").fill("Analysis Test Project");
    await page.getByTestId("project-path-input").fill("/test/analysis/project");
    await page.getByTestId("confirm-create-project").click();

    // Wait for board view to load
    await expect(page.getByTestId("board-view")).toBeVisible();

    // Click on Analysis in sidebar
    await page.getByTestId("nav-analysis").click();

    // Verify analysis view is displayed
    await expect(page.getByTestId("analysis-view")).toBeVisible();
  });

  test("analysis view shows 'No Analysis Yet' message initially", async ({ page }) => {
    await page.goto("/");

    // Create a project first
    await page.getByTestId("new-project-card").click();
    await expect(page.getByTestId("new-project-dialog")).toBeVisible();
    await page.getByTestId("project-name-input").fill("Analysis Test Project2");
    await page.getByTestId("project-path-input").fill("/test/analysis/project2");
    await page.getByTestId("confirm-create-project").click();
    await expect(page.getByTestId("board-view")).toBeVisible();

    // Navigate to analysis view
    await page.getByTestId("nav-analysis").click();
    await expect(page.getByTestId("analysis-view")).toBeVisible();

    // Verify no analysis message
    await expect(page.getByText("No Analysis Yet")).toBeVisible();
    await expect(page.getByText('Click "Analyze Project"')).toBeVisible();
  });

  test("shows 'Analyze Project' button", async ({ page }) => {
    await page.goto("/");

    // Create a project first
    await page.getByTestId("new-project-card").click();
    await expect(page.getByTestId("new-project-dialog")).toBeVisible();
    await page.getByTestId("project-name-input").fill("Analysis Test Project3");
    await page.getByTestId("project-path-input").fill("/test/analysis/project3");
    await page.getByTestId("confirm-create-project").click();
    await expect(page.getByTestId("board-view")).toBeVisible();

    // Navigate to analysis view
    await page.getByTestId("nav-analysis").click();
    await expect(page.getByTestId("analysis-view")).toBeVisible();

    // Verify analyze button is visible
    await expect(page.getByTestId("analyze-project-button")).toBeVisible();
  });

  test("can run project analysis", async ({ page }) => {
    await page.goto("/");

    // Create a project first
    await page.getByTestId("new-project-card").click();
    await expect(page.getByTestId("new-project-dialog")).toBeVisible();
    await page.getByTestId("project-name-input").fill("Analysis Test Project4");
    await page.getByTestId("project-path-input").fill("/test/analysis/project4");
    await page.getByTestId("confirm-create-project").click();
    await expect(page.getByTestId("board-view")).toBeVisible();

    // Navigate to analysis view
    await page.getByTestId("nav-analysis").click();
    await expect(page.getByTestId("analysis-view")).toBeVisible();

    // Click analyze button
    await page.getByTestId("analyze-project-button").click();

    // Wait for analysis to complete and stats to appear
    await expect(page.getByTestId("analysis-stats")).toBeVisible();

    // Verify statistics are displayed
    await expect(page.getByTestId("total-files")).toBeVisible();
    await expect(page.getByTestId("total-directories")).toBeVisible();
  });

  test("analysis shows file tree after running", async ({ page }) => {
    await page.goto("/");

    // Create a project first
    await page.getByTestId("new-project-card").click();
    await expect(page.getByTestId("new-project-dialog")).toBeVisible();
    await page.getByTestId("project-name-input").fill("Analysis Test Project5");
    await page.getByTestId("project-path-input").fill("/test/analysis/project5");
    await page.getByTestId("confirm-create-project").click();
    await expect(page.getByTestId("board-view")).toBeVisible();

    // Navigate to analysis view
    await page.getByTestId("nav-analysis").click();
    await expect(page.getByTestId("analysis-view")).toBeVisible();

    // Click analyze button
    await page.getByTestId("analyze-project-button").click();

    // Wait for analysis to complete
    await expect(page.getByTestId("analysis-file-tree")).toBeVisible();

    // Verify file tree is displayed
    await expect(page.getByTestId("analysis-file-tree")).toBeVisible();
  });

  test("analysis shows files by extension breakdown", async ({ page }) => {
    await page.goto("/");

    // Create a project first
    await page.getByTestId("new-project-card").click();
    await expect(page.getByTestId("new-project-dialog")).toBeVisible();
    await page.getByTestId("project-name-input").fill("Analysis Test Project6");
    await page.getByTestId("project-path-input").fill("/test/analysis/project6");
    await page.getByTestId("confirm-create-project").click();
    await expect(page.getByTestId("board-view")).toBeVisible();

    // Navigate to analysis view
    await page.getByTestId("nav-analysis").click();
    await expect(page.getByTestId("analysis-view")).toBeVisible();

    // Click analyze button
    await page.getByTestId("analyze-project-button").click();

    // Wait for analysis to complete
    await expect(page.getByTestId("files-by-extension")).toBeVisible();

    // Verify files by extension card is displayed
    await expect(page.getByTestId("files-by-extension")).toBeVisible();
  });

  test("file tree displays correct structure with directories and files", async ({ page }) => {
    await page.goto("/");

    // Create a project first
    await page.getByTestId("new-project-card").click();
    await expect(page.getByTestId("new-project-dialog")).toBeVisible();
    await page.getByTestId("project-name-input").fill("Analysis Test Project7");
    await page.getByTestId("project-path-input").fill("/test/analysis/project7");
    await page.getByTestId("confirm-create-project").click();
    await expect(page.getByTestId("board-view")).toBeVisible();

    // Navigate to analysis view
    await page.getByTestId("nav-analysis").click();
    await expect(page.getByTestId("analysis-view")).toBeVisible();

    // Click analyze button
    await page.getByTestId("analyze-project-button").click();

    // Wait for file tree to be populated
    await expect(page.getByTestId("analysis-file-tree")).toBeVisible();

    // Verify src directory is in the tree (mock data provides this)
    await expect(page.getByTestId("analysis-node-src")).toBeVisible();

    // Verify some files are in the tree
    await expect(page.getByTestId("analysis-node-package.json")).toBeVisible();
  });
});
