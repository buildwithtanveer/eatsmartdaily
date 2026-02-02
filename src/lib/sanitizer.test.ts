import { describe, expect, it } from "vitest";
import { sanitizeEmail, sanitizeHtml, sanitizeSlug, sanitizeText, sanitizeUrl } from "@/lib/sanitizer";

describe("sanitizer", () => {
  it("removes script tags from HTML", () => {
    const input = `<p>Hello</p><script>alert(1)</script>`;
    const output = sanitizeHtml(input);
    expect(output).toContain("<p>Hello</p>");
    expect(output).not.toContain("<script");
    expect(output).not.toContain("alert(1)");
  });

  it("sanitizes plain text by stripping angle brackets", () => {
    const input = " <b>test</b> ";
    const output = sanitizeText(input);
    expect(output).toBe("btest/b");
  });

  it("normalizes email addresses", () => {
    expect(sanitizeEmail("  USER@Example.COM ")).toBe("user@example.com");
    expect(sanitizeEmail("<a@b.com>")).toBe("a@b.com");
  });

  it("allows only http/https URLs", () => {
    expect(sanitizeUrl("https://example.com/a")).toBe("https://example.com/a");
    expect(sanitizeUrl("javascript:alert(1)")).toBe("");
    expect(sanitizeUrl("data:text/html;base64,AAAA")).toBe("");
  });

  it("sanitizes slugs safely", () => {
    expect(sanitizeSlug(" Hello World! ")).toBe("helloworld");
    expect(sanitizeSlug("a---b")).toBe("a-b");
  });
});

