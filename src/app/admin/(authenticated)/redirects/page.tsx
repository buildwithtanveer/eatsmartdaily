import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RedirectManager from "@/components/admin/redirects/RedirectManager";

export default async function RedirectsPage() {
  await requirePermission(["ADMIN", "EDITOR"]);

  const redirects = await prisma.redirect.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Redirect Manager</h1>
          <p className="text-gray-500 text-sm">Manage 301 and 302 redirects for broken links or migrations.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
          Total: {redirects.length}
        </div>
      </div>

      <RedirectManager initialRedirects={redirects} />
    </div>
  );
}
