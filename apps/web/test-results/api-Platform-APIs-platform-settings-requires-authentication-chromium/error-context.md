# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api.spec.ts >> Platform APIs >> platform settings requires authentication
- Location: e2e/api.spec.ts:24:7

# Error details

```
Error: apiRequestContext.get: connect ECONNREFUSED 127.0.0.1:3001
Call log:
  - → GET http://127.0.0.1:3001/api/v1/platform/settings
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { apiBaseUrl } from "../playwright.config";
  3  | 
  4  | test.describe("API health", () => {
  5  |   test("returns ok status", async ({ request }) => {
  6  |     const response = await request.get(`${apiBaseUrl}/health`);
  7  |     test.skip(response.status() === 0 || response.status() >= 500, "API is not running");
  8  | 
  9  |     expect(response.ok()).toBeTruthy();
  10 | 
  11 |     const body = await response.json();
  12 |     expect(body.data.status).toBe("ok");
  13 |     expect(body.data.service).toBe("knowledgehub-api");
  14 |   });
  15 | });
  16 | 
  17 | test.describe("Platform APIs", () => {
  18 |   test("homepage layout requires authentication", async ({ request }) => {
  19 |     const response = await request.get(`${apiBaseUrl}/homepage/layout`);
  20 | 
  21 |     expect([401, 403]).toContain(response.status());
  22 |   });
  23 | 
  24 |   test("platform settings requires authentication", async ({ request }) => {
> 25 |     const response = await request.get(`${apiBaseUrl}/platform/settings`);
     |                                    ^ Error: apiRequestContext.get: connect ECONNREFUSED 127.0.0.1:3001
  26 | 
  27 |     expect([401, 403]).toContain(response.status());
  28 |   });
  29 | });
  30 | 
```