import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RedirectForm from "@/components/admin/redirects/RedirectForm";
import RedirectList from "@/components/admin/redirects/RedirectList";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import AdminTableFooter from "@/components/admin/AdminTableFooter";

export default async function RedirectsPage(props: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  await requirePermission(["ADMIN", "EDITOR"]);

  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.limit) || 20));
  const search = searchParams.search || "";

  const where = search ? {
    OR: [
      { source: { contains: search } },
      { destination: { contains: search } },
    ]
  } : {};

  const [redirects, totalRedirects] = await Promise.all([
    prisma.redirect.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.redirect.count({ where }),
  ]);

  const totalPages = Math.ceil(totalRedirects / limit);

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Redirect Manager</h1>
          <p className="text-gray-500 text-sm">Manage 301 and 302 redirects for broken links or migrations.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
          Total: {totalRedirects}
        </div>
      </div>

      <RedirectForm />
      
      <AdminTableToolbar searchPlaceholder="Search redirects..." />

      <RedirectList redirects={redirects} />
      
      <AdminTableFooter 
        currentPage={page} 
        totalPages={totalPages} 
        totalItems={totalRedirects} 
        limit={limit} 
      />
    </div>
  );
}
