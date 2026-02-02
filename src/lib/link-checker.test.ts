import { describe, expect, it } from "vitest";
import { extractLinks } from "@/lib/link-checker";

describe("extractLinks", () => {
  it("extracts unique http/https href links", () => {
    const html =
      `<a href="https://example.com/a">A</a>` +
      `<a href='https://example.com/a'>A2</a>` +
      `<a href="http://example.com/b">B</a>` +
      `<a href="/internal">Internal</a>`;

    const links = extractLinks(html);
    expect(links).toEqual(["https://example.com/a", "http://example.com/b"]);
  });
});

