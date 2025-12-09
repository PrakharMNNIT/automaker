import { test, expect } from "@playwright/test";

test.describe("New Chat Session Auto Focus", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    // Create a new project first
    await page.getByTestId("new-project-card").click();
    await expect(page.getByTestId("new-project-dialog")).toBeVisible();

    // Enter project details
    await page.getByTestId("project-name-input").fill("test-session-project");
    await page.getByTestId("project-path-input").fill("/Users/test/session-projects");

    // Click create
    await page.getByTestId("confirm-create-project").click();

    // Should navigate to board view
    await expect(page.getByTestId("board-view")).toBeVisible();

    // Navigate to Agent view
    await page.getByTestId("nav-agent").click();
    await expect(page.getByTestId("agent-view")).toBeVisible();
  });

  test("clicking new session button creates a session with random name", async ({ page }) => {
    // Click the "New" session button
    const newSessionButton = page.getByTestId("new-session-button");
    await expect(newSessionButton).toBeVisible();
    await newSessionButton.click();

    // Wait for the session to be created - check for session item in the list
    const sessionList = page.getByTestId("session-list");
    await expect(sessionList).toBeVisible();

    // The session should appear in the list
    await expect(sessionList.locator('[data-testid^="session-item-"]').first()).toBeVisible({ timeout: 5000 });

    // The session name should follow the pattern of random names (contains letters and numbers)
    const sessionName = sessionList.locator('[data-testid^="session-item-"]').first().locator("h3");
    await expect(sessionName).toBeVisible();
    const nameText = await sessionName.textContent();
    expect(nameText).toBeTruthy();
    // Verify the name follows our pattern: "Adjective Noun Number"
    expect(nameText).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+ \d+$/);
  });

  test("verify session was created and selected", async ({ page }) => {
    // Click the "New" session button
    const newSessionButton = page.getByTestId("new-session-button");
    await newSessionButton.click();

    // Wait for session to be created
    const sessionList = page.getByTestId("session-list");
    await expect(sessionList.locator('[data-testid^="session-item-"]').first()).toBeVisible({ timeout: 5000 });

    // Verify the session is selected (has the primary border class)
    const sessionItem = sessionList.locator('[data-testid^="session-item-"]').first();
    await expect(sessionItem).toHaveClass(/border-primary/);

    // Verify the message list is visible (session is active)
    await expect(page.getByTestId("message-list")).toBeVisible();
  });

  test("verify chat input is focused after creating new session", async ({ page }) => {
    // Click the "New" session button
    const newSessionButton = page.getByTestId("new-session-button");
    await newSessionButton.click();

    // Wait for session to be created
    const sessionList = page.getByTestId("session-list");
    await expect(sessionList.locator('[data-testid^="session-item-"]').first()).toBeVisible({ timeout: 5000 });

    // Wait for the input to be focused (there's a 200ms delay in the code)
    await page.waitForTimeout(300);

    // Verify the chat input is focused
    const chatInput = page.getByTestId("agent-input");
    await expect(chatInput).toBeVisible();
    await expect(chatInput).toBeFocused();
  });

  test("complete flow: click new session, verify session created, verify input focused", async ({ page }) => {
    // Step 1: Click new session
    const newSessionButton = page.getByTestId("new-session-button");
    await expect(newSessionButton).toBeVisible();
    await newSessionButton.click();

    // Step 2: Verify session was created
    const sessionList = page.getByTestId("session-list");
    await expect(sessionList.locator('[data-testid^="session-item-"]').first()).toBeVisible({ timeout: 5000 });

    // Verify the session has a randomly generated name
    const sessionName = sessionList.locator('[data-testid^="session-item-"]').first().locator("h3");
    const nameText = await sessionName.textContent();
    expect(nameText).toBeTruthy();
    expect(nameText).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+ \d+$/);

    // Step 3: Verify chat input focused
    await page.waitForTimeout(300);
    const chatInput = page.getByTestId("agent-input");
    await expect(chatInput).toBeFocused();
  });
});
