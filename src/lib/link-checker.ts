
import { validatePublicHttpUrl } from "@/lib/url-safety";

export async function checkUrl(url: string): Promise<number | string> {
  // Common bot blockers or slow sites
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  const safety = await validatePublicHttpUrl(url);
  if (!safety.ok) {
    return "Blocked";
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15s

    // Try HEAD first
    const response = await fetch(safety.url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": userAgent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      },
    });
    clearTimeout(timeoutId);

    // If method not allowed (405) or other client errors that might be bot protection (403), try GET
    if (response.status === 405 || response.status === 403 || response.status === 401) {
       throw new Error("Try GET");
    }

    return response.status;
  } catch (error: unknown) {
    // If it's a timeout, return specific error
    if (error instanceof Error && error.name === 'AbortError') {
        return "Timeout";
    }
    
    // Fallback to GET for any error (network, 405, 403, etc)
    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 15000);
      
      const responseGet = await fetch(safety.url, {
        method: "GET",
        signal: controller2.signal,
        headers: {
            "User-Agent": userAgent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        },
      });
      clearTimeout(timeoutId2);
      return responseGet.status;
    } catch (err2) {
       if (err2 instanceof Error && err2.name === 'AbortError') {
          return "Timeout";
       }
       // Only return "Error" if both attempts failed completely (DNS, connection refused)
       return "Error";
    }
  }
}

export function extractLinks(html: string): string[] {
  const links: string[] = [];
  // Improved regex to handle various quote styles and spaces
  const regex = /href\s*=\s*["'](https?:\/\/[^"'\s>]+)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push(match[1]);
  }
  return [...new Set(links)]; // Unique links
}
