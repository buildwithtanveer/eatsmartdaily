import Image from "next/image";
import LazyAdWrapper from "@/components/LazyAdWrapper";
import { getAds } from "@/lib/data";
import { sanitizeHtml, sanitizeText, sanitizeUrl } from "@/lib/sanitizer";

type AdLocation = "HEADER" | "SIDEBAR" | "IN_ARTICLE" | "FOOTER" | "BELOW_TITLE" | "END_CONTENT";

export default async function AdDisplay({
  location,
}: {
  location: AdLocation;
}) {
  const ads = await getAds(location as any);

  if (ads.length === 0) return null;

  // Pick the first ad to ensure purity/stability
  const ad = ads[0];

  const isBanner = location === "HEADER" || location === "FOOTER" || location === "BELOW_TITLE" || location === "END_CONTENT";
  const aspectRatioClass = isBanner
    ? "h-32 md:h-40"
    : "aspect-square max-h-[300px]";

  const minHeight = isBanner ? "128px" : "300px";

  // Sanitize content based on type
  let sanitizedContent = "";
  if (ad.type === "CODE") {
    sanitizedContent = sanitizeHtml(ad.content);
  } else if (ad.type === "TEXT") {
    sanitizedContent = sanitizeText(ad.content);
  }

  return (
    <div className="w-full my-6 flex justify-center">
      <LazyAdWrapper minHeight={minHeight}>
        {ad.type === "IMAGE" &&
          (ad.content.startsWith("/") || ad.content.startsWith("http")) && (
            <div className={`relative w-full ${aspectRatioClass}`}>
              <Image
                src={sanitizeUrl(ad.content) || ad.content}
                alt={sanitizeText(ad.name)}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 728px"
              />
            </div>
          )}
        {ad.type === "CODE" && (
          <div
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            role="region"
            aria-label="Advertisement"
          />
        )}
        {ad.type === "TEXT" && (
          <div
            className="p-4 border bg-gray-50 text-center w-full"
            role="region"
            aria-label="Advertisement"
          >
            <span className="text-xs text-gray-400 block mb-2">
              ADVERTISEMENT
            </span>
            <p>{sanitizedContent}</p>
          </div>
        )}
      </LazyAdWrapper>
    </div>
  );
}
