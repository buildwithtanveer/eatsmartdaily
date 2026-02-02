import { describe, expect, it } from "vitest";
import { validatePublicHttpUrl } from "@/lib/url-safety";

describe("validatePublicHttpUrl", () => {
  it("blocks private IPv4 ranges and metadata IP", async () => {
    expect((await validatePublicHttpUrl("http://127.0.0.1")).ok).toBe(false);
    expect((await validatePublicHttpUrl("http://10.0.0.1")).ok).toBe(false);
    expect((await validatePublicHttpUrl("http://169.254.169.254")).ok).toBe(false);
  });

  it("blocks localhost hostname", async () => {
    expect((await validatePublicHttpUrl("http://localhost")).ok).toBe(false);
  });

  it("blocks non-standard ports", async () => {
    expect((await validatePublicHttpUrl("http://8.8.8.8:8080")).ok).toBe(false);
  });

  it("allows a public IPv4 host on standard ports", async () => {
    const result = await validatePublicHttpUrl("https://8.8.8.8");
    expect(result.ok).toBe(true);
  });
});

