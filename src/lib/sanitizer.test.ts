import { describe, expect, it } from "vitest";
import {
  sanitizeEmail,
  sanitizeHtml,
  sanitizeSlug,
  sanitizeText,
  sanitizeUrl,
  escapeHtml
} from "@/lib/sanitizer";

describe("sanitizer", () => {
  it("removes script tags from HTML", () => {
    const input = `<p>Hello</p><script>alert(1)</script>`;
    const output = sanitizeHtml(input);
    expect(output).toContain("<p>Hello</p>");
    expect(output).not.toContain("<script");
    expect(output).not.toContain("alert(1)");
  });

  it("removes dangerous HTML attributes", () => {
    const input = '<img src="x" onerror="alert(1)" onload="steal_cookies()">';
    const output = sanitizeHtml(input);
    expect(output).toBe('<img src="x" />'); // onerror and onload should be stripped, self-closing tag preserved
  });

  it("allows safe HTML tags and attributes", () => {
    const input = '<p class="intro">Hello <a href="/page" target="_blank" rel="noopener">world</a></p>';
    const output = sanitizeHtml(input);
    expect(output).toBe(input); // Safe attributes should remain
  });

  it("sanitizes plain text by stripping angle brackets", () => {
    const input = " <b>test</b> ";
    const output = sanitizeText(input);
    expect(output).toBe("btest/b");
  });

  it("limits plain text length", () => {
    const longText = "a".repeat(6000); // More than 5000 limit
    const output = sanitizeText(longText);
    expect(output.length).toBeLessThanOrEqual(5000);
  });

  it("normalizes email addresses", () => {
    expect(sanitizeEmail("  USER@Example.COM ")).toBe("user@example.com");
    expect(sanitizeEmail("<a@b.com>")).toBe("a@b.com");
  });

  it("handles invalid email formats", () => {
    expect(sanitizeEmail("")).toBe("");
    expect(sanitizeEmail("not-an-email")).toBe("not-an-email");
  });

  it("allows only http/https URLs", () => {
    expect(sanitizeUrl("https://example.com/a")).toBe("https://example.com/a");
    expect(sanitizeUrl("http://example.com")).toBe("http://example.com/"); // URL constructor adds trailing slash
    expect(sanitizeUrl("javascript:alert(1)")).toBe("");
    expect(sanitizeUrl("data:text/html;base64,AAAA")).toBe("");
    expect(sanitizeUrl("ftp://files.example.com")).toBe(""); // Non-http/https
  });

  it("sanitizes slugs safely", () => {
    expect(sanitizeSlug(" Hello World! ")).toBe("helloworld");
    expect(sanitizeSlug("a---b")).toBe("a-b");
    expect(sanitizeSlug("test_slug")).toBe("testslug"); // Underscores removed
    // The sanitizeSlug function removes all non-alphanumeric characters, so accented chars become empty
    expect(sanitizeSlug("áéíóú")).toBe(""); // Accented chars are removed
  });

  it("limits slug length", () => {
    const longSlug = "a".repeat(150);
    const output = sanitizeSlug(longSlug);
    expect(output.length).toBeLessThanOrEqual(100);
  });

  it("escapes HTML special characters", () => {
    expect(escapeHtml('& < > " \'')).toBe("&amp; &lt; &gt; &quot; &#039;");
    expect(escapeHtml('<script>alert("xss")</script>')).toBe("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
  });

  it("handles empty and null inputs", () => {
    expect(sanitizeText("")).toBe("");
    expect(sanitizeEmail("")).toBe("");
    expect(sanitizeUrl("")).toBe("");
    expect(sanitizeSlug("")).toBe("");
    expect(escapeHtml("")).toBe("");
  });
});

