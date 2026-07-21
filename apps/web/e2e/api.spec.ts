import { test, expect } from "@playwright/test";
import { apiBaseUrl } from "../playwright.config";

test.describe("API health", () => {
  test("returns ok status", async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/health`);
    test.skip(response.status() === 0 || response.status() >= 500, "API is not running");

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.data.status).toBe("ok");
    expect(body.data.service).toBe("knowledgehub-api");
  });
});

test.describe("Platform APIs", () => {
  test("homepage layout requires authentication", async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/homepage/layout`);

    expect([401, 403]).toContain(response.status());
  });

  test("platform settings requires authentication", async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/platform/settings`);

    expect([401, 403]).toContain(response.status());
  });
});
