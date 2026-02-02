import { describe, expect, it } from "vitest";
import { getMaxUploadBytes, validateImageUpload } from "@/lib/upload";

describe("upload helpers", () => {
  it("returns a default max upload size when env is not set", () => {
    const value = getMaxUploadBytes();
    expect(value).not.toBeNull();
    expect(typeof value).toBe("number");
  });

  it("rejects disallowed mime types", () => {
    const result = validateImageUpload({ mimeType: "text/plain", sizeBytes: 10, maxBytes: 1024 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
    }
  });

  it("rejects files that exceed max bytes", () => {
    const result = validateImageUpload({ mimeType: "image/png", sizeBytes: 2048, maxBytes: 1024 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(413);
    }
  });

  it("accepts valid image uploads", () => {
    const result = validateImageUpload({ mimeType: "image/webp", sizeBytes: 100, maxBytes: 1024 });
    expect(result.ok).toBe(true);
  });
});

