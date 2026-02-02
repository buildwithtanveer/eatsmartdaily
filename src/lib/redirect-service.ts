import { prisma } from "@/lib/prisma";

export type RedirectResult = {
  destination: string;
  permanent: boolean;
} | null;

/**
 * Looks up a redirect for the given path.
 * Normalizes the path by ensuring it starts with / and removing trailing slashes.
 */
export async function getRedirect(path: string): Promise<RedirectResult> {
  // Normalize path: ensure leading slash, remove trailing slash (unless it's root)
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath.length > 1 && normalizedPath.endsWith("/")) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  // Try exact match first
  const redirect = await prisma.redirect.findUnique({
    where: {
      source: normalizedPath,
    },
  });

  if (redirect && redirect.isActive) {
    return {
      destination: redirect.destination,
      permanent: redirect.type === "PERMANENT",
    };
  }

  return null;
}
