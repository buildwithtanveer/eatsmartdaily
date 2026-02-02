import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdManager from "@/components/admin/ads/AdManager";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import AdminTableFooter from "@/components/admin/AdminTableFooter";

export default async function AdsPage(props: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  await requirePermission(["ADMIN", "EDITOR"]);

  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.limit) || 20));
  const search = searchParams.search || "";

  const where = search ? {
    name: { contains: search }
  } : {};

  const [ads, totalAds] = await Promise.all([
    prisma.ad.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ad.count({ where }),
  ]);

  const totalPages = Math.ceil(totalAds / limit);

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ads Management</h1>
          <p className="text-gray-500 text-sm">Manage advertising placements and scripts.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
          Total: {totalAds}
        </div>
      </div>

      <AdminTableToolbar searchPlaceholder="Search ads..." />
      
      <AdManager ads={ads} />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <AdminTableFooter 
          currentPage={page} 
          totalPages={totalPages} 
          totalItems={totalAds} 
          limit={limit} 
        />
      </div>
    </div>
  );
}
