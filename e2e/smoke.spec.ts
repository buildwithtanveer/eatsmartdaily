import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test.skip(!process.env.DATABASE_URL, "DATABASE_URL is required to start the app");

  test("robots.txt returns 200", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain("User-Agent");
  });

  test("og image route returns 200", async ({ request }) => {
    const res = await request.get("/og?title=Test");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image");
  });

  test("/api/posts does not leak password fields", async ({ request }) => {
    const res = await request.get("/api/posts");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).not.toContain("\"password\"");
  });
});
