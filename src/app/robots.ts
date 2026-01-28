import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/search", "/*?s="],
      },
    ],
    sitemap: "https://eatsmartdaily.com/sitemap.xml",
  };
}
