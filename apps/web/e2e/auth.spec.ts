import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test("shows KnowledgeHub sign-in page", async ({ page }) => {
    await page.goto("/login");

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /welcome to knowledgehub/i })).toBeVisible();
  });
});

test.describe("Auth guard", () => {
  test("redirects unauthenticated users from home to login", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects unauthenticated users from meets to login", async ({ page }) => {
    await page.goto("/meets");

    await expect(page).toHaveURL(/\/login/);
  });
});
