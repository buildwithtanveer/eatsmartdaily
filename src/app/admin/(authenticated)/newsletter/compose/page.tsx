import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import NewsletterComposer from "@/components/admin/newsletter/NewsletterComposer";
import { getRecentPublishedPosts } from "@/app/actions/newsletter";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Compose Newsletter | Eat Smart Daily",
};

export default async function ComposeNewsletterPage() {
  await requireAdmin();
  const posts = await getRecentPublishedPosts(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/newsletter"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Compose Newsletter</h1>
      </div>

      <NewsletterComposer posts={posts} />
    </div>
  );
}
