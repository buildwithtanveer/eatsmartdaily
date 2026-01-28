import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdManager from "@/components/admin/ads/AdManager";

export default async function AdsPage() {
  await requirePermission(["ADMIN", "EDITOR"]);

  const ads = await prisma.ad.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ads Management</h1>
          <p className="text-gray-500 text-sm">Manage advertising placements and scripts.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
          Total: {ads.length}
        </div>
      </div>
      
      <AdManager initialAds={ads} />
    </div>
  );
}
