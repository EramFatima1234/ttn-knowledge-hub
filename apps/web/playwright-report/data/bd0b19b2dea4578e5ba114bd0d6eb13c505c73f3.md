# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Public navigation shell >> search route requires authentication
- Location: e2e/navigation.spec.ts:10:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/search?q=devops
Call log:
  - navigating to "http://127.0.0.1:3000/search?q=devops", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Public navigation shell", () => {
  4  |   test("login page links are reachable", async ({ page }) => {
  5  |     await page.goto("/login");
  6  | 
  7  |     await expect(page.locator("body")).toBeVisible();
  8  |   });
  9  | 
  10 |   test("search route requires authentication", async ({ page }) => {
> 11 |     await page.goto("/search?q=devops");
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/search?q=devops
  12 | 
  13 |     await expect(page).toHaveURL(/\/login/);
  14 |   });
  15 | 
  16 |   test("learning paths route requires authentication", async ({ page }) => {
  17 |     await page.goto("/learning-paths");
  18 | 
  19 |     await expect(page).toHaveURL(/\/login/);
  20 |   });
  21 | });
  22 | 
```