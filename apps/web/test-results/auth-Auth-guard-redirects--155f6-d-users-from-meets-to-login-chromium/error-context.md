# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Auth guard >> redirects unauthenticated users from meets to login
- Location: e2e/auth.spec.ts:19:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/meets
Call log:
  - navigating to "http://127.0.0.1:3000/meets", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Login", () => {
  4  |   test("shows KnowledgeHub sign-in page", async ({ page }) => {
  5  |     await page.goto("/login");
  6  | 
  7  |     await expect(page).toHaveURL(/\/login/);
  8  |     await expect(page.getByRole("heading", { name: /welcome to knowledgehub/i })).toBeVisible();
  9  |   });
  10 | });
  11 | 
  12 | test.describe("Auth guard", () => {
  13 |   test("redirects unauthenticated users from home to login", async ({ page }) => {
  14 |     await page.goto("/");
  15 | 
  16 |     await expect(page).toHaveURL(/\/login/);
  17 |   });
  18 | 
  19 |   test("redirects unauthenticated users from meets to login", async ({ page }) => {
> 20 |     await page.goto("/meets");
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/meets
  21 | 
  22 |     await expect(page).toHaveURL(/\/login/);
  23 |   });
  24 | });
  25 | 
```