import sanitizeHtmlPackage from "sanitize-html";

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows safe HTML tags for rich content (ads, blog posts, etc.)
 */
export function sanitizeHtml(html: string): string {
  return sanitizeHtmlPackage(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
      "code",
      "pre",
      "span",
      "div",
      "table",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
      "iframe",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title", "class", "id"],
      img: ["src", "alt", "title", "width", "height", "class", "id"],
      iframe: [
        "src",
        "width",
        "height",
        "frameborder",
        "allowfullscreen",
        "style",
        "class",
        "id",
      ],
      "*": ["class", "id", "style", "data-*"],
    },
    allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com", "google.com"],
    allowVulnerableTags: true, // Needed for some ad scripts if they use them
  });
}

/**
 * Sanitize plain text - removes all HTML tags
 * Use for form inputs, user-generated text content
 */
export function sanitizeText(text: string): string {
  if (!text) return "";
  return text.replace(/[<>]/g, "").trim().slice(0, 5000); // Max length protection
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  if (!email) return "";
  return email.toLowerCase().trim().replace(/[<>]/g, "");
}

/**
 * Sanitize URLs
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";

  try {
    // Only allow http and https protocols
    const urlObj = new URL(url);
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return "";
    }
    return urlObj.toString();
  } catch {
    return "";
  }
}

/**
 * Sanitize slug (for URLs)
 */
export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

/**
 * Escape HTML special characters (alternative to sanitization)
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
