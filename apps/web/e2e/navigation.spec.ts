import { test, expect } from "@playwright/test";

test.describe("Public navigation shell", () => {
  test("login page links are reachable", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("body")).toBeVisible();
  });

  test("search route requires authentication", async ({ page }) => {
    await page.goto("/search?q=devops");

    await expect(page).toHaveURL(/\/login/);
  });

  test("library route requires authentication", async ({ page }) => {
    await page.goto("/library");

    await expect(page).toHaveURL(/\/login/);
  });
});
