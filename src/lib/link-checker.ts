
export async function checkUrl(url: string): Promise<number | string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EatSmartDaily/1.0; +http://eatsmartdaily.com)",
      },
    });
    clearTimeout(timeoutId);

    // If method not allowed, try GET
    if (response.status === 405) {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 8000);
      const responseGet = await fetch(url, {
        method: "GET",
        signal: controller2.signal,
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; EatSmartDaily/1.0; +http://eatsmartdaily.com)",
        },
      });
      clearTimeout(timeoutId2);
      return responseGet.status;
    }

    return response.status;
  } catch (error: unknown) {
    // If it's a timeout, return specific error
    if (error instanceof Error && error.name === 'AbortError') {
        return "Timeout";
    }
    return "Error";
  }
}

export function extractLinks(html: string): string[] {
  const links: string[] = [];
  const regex = /href=["'](https?:\/\/[^"']+)["']/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push(match[1]);
  }
  return [...new Set(links)]; // Unique links
}
