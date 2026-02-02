import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewsletterActions from "@/components/admin/newsletter/NewsletterActions";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import AdminTableFooter from "@/components/admin/AdminTableFooter";
import { Mail, Users, PenTool } from "lucide-react";
import Link from "next/link";

export default async function NewsletterPage(props: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  await requirePermission(["ADMIN", "EDITOR"]);

  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.limit) || 20));
  const search = searchParams.search || "";

  const where = search ? {
    email: { contains: search }
  } : {};

  const [subscribers, totalSubscribers] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.newsletterSubscriber.count({ where }),
  ]);

  const totalPages = Math.ceil(totalSubscribers / limit);

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Newsletter Subscribers</h1>
          <p className="text-gray-500 text-sm">Manage your email list subscribers.</p>
        </div>
        <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600 flex items-center">
            Total: {totalSubscribers}
            </div>
            <Link 
                href="/admin/newsletter/compose"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium hover:bg-emerald-700 flex items-center gap-2"
            >
                <PenTool size={16} />
                Compose Newsletter
            </Link>
        </div>
      </div>

      <AdminTableToolbar searchPlaceholder="Search subscribers..." />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[40%]">Email</th>
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[20%]">Status</th>
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[20%]">Joined Date</th>
                <th className="p-4 text-right font-bold text-gray-500 text-xs uppercase tracking-wider w-[20%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="font-medium text-gray-900 text-lg">No subscribers found</p>
                      <p className="text-sm text-gray-500">Try adjusting your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <Mail size={14} />
                        </div>
                        <span className="font-medium text-gray-900">{sub.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          sub.isActive
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {sub.isActive ? "ACTIVE" : "UNSUBSCRIBED"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                      {new Date(sub.createdAt).toLocaleDateString("en-US")}
                    </td>
                    <td className="p-4 text-right">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <NewsletterActions subscriberId={sub.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminTableFooter 
          currentPage={page} 
          totalPages={totalPages} 
          totalItems={totalSubscribers} 
          limit={limit} 
        />
      </div>
    </div>
  );
}
