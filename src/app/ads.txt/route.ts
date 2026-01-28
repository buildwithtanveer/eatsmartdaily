import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.siteSettings.findFirst({
    select: { adsTxt: true },
  });

  if (!settings?.adsTxt) {
    return new NextResponse("# No ads.txt content provided", {
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new NextResponse(settings.adsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}
