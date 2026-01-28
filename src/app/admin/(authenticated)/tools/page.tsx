import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BrokenLinkScanner from "@/components/admin/tools/BrokenLinkScanner";
import BackupManager from "@/components/admin/tools/BackupManager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ToolsPage() {
  await requirePermission(["ADMIN", "EDITOR"]);
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role;

  // Only fetch published posts for link checking
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, content: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Tools</h1>
        <p className="text-gray-500 mt-2">Maintenance and utility tools for your site.</p>
      </div>

      <div className="space-y-8">
        <section>
          <BrokenLinkScanner posts={posts} />
        </section>

        {role === "ADMIN" && (
          <section>
             <BackupManager />
          </section>
        )}
      </div>
    </div>
  );
}
