export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export function isAllowedImageMimeType(mimeType: string): mimeType is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function getMaxUploadBytes() {
  const maxBytes = Number(process.env.UPLOAD_MAX_BYTES || 5 * 1024 * 1024);
  return Number.isFinite(maxBytes) && maxBytes > 0 ? maxBytes : null;
}

export function validateImageUpload(input: { mimeType: string; sizeBytes: number; maxBytes: number }) {
  if (!isAllowedImageMimeType(input.mimeType)) {
    return { ok: false as const, status: 400, error: "Invalid file type. Only images are allowed." };
  }

  if (input.sizeBytes > input.maxBytes) {
    return { ok: false as const, status: 413, error: "File too large" };
  }

  return { ok: true as const };
}
