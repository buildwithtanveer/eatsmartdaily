import { notFound, redirect, permanentRedirect } from "next/navigation";
import { getRedirect } from "@/lib/redirect-service";

interface PageProps {
  params: Promise<{
    catchAll: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CatchAllPage(props: PageProps) {
  const params = await props.params;
  
  // Reconstruct the path from the catch-all segments
  // e.g. ["category", "food"] -> "/category/food"
  const path = "/" + params.catchAll.join("/");

  const redirectRule = await getRedirect(path);

  if (redirectRule) {
    if (redirectRule.permanent) {
      permanentRedirect(redirectRule.destination);
    } else {
      redirect(redirectRule.destination);
    }
  }

  // If no redirect found, trigger the 404 page
  notFound();
}
