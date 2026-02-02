import { requireDashboardAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatsCards } from "@/components/admin/dashboard/DashboardWidgets";
import TrafficChart from "@/components/admin/dashboard/TrafficChart";
import UserActivityChart from "@/components/admin/dashboard/UserActivityChart";
import Link from "next/link";
import { ArrowRight, Eye, Calendar, User } from "lucide-react";

export const metadata = {
  title: "Analytics | Eat Smart Daily Admin",
};

export default async function AnalyticsPage() {
  const session = await requireDashboardAccess();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;
  const role = user?.role;
  const userId = parseInt(user?.id);

  // Define filters based on role
  const postFilter = role === "AUTHOR" ? { authorId: userId } : {};

  // Fetch data
  const [
    totalPosts,
    totalViewsResult,
    topPosts
  ] = await Promise.all([
    prisma.post.count({ where: postFilter }),
    prisma.post.aggregate({
      where: postFilter,
      _sum: { views: true },
    }),
    prisma.post.findMany({
      where: postFilter,
      orderBy: { views: "desc" },
      take: 10,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
  ]);

  const totalViews = totalViewsResult._sum.views || 0;
  const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

  const stats = [
    { 
      label: "Total Views", 
      value: totalViews.toLocaleString(), 
      color: "text-blue-600" 
    },
    { 
      label: "Avg. Views / Post", 
      value: avgViews.toLocaleString(), 
      color: "text-purple-600" 
    },
    { 
      label: "Total Posts", 
      value: totalPosts.toString(), 
      color: "text-gray-800" 
    },
    {
      label: "Engagement Rate", // Placeholder for now
      value: "Coming Soon",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Overview of your content performance and audience growth.
        </p>
      </div>

      {/* 1. Stats Row */}
      <StatsCards stats={stats} />

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[400px]">
          <TrafficChart />
        </div>
        <div className="lg:col-span-1 h-[400px]">
          <UserActivityChart />
        </div>
      </div>

      {/* 3. Top Posts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="font-bold text-gray-900 text-lg">Top Performing Content</h3>
          <Link 
            href="/admin/posts" 
            className="text-sm text-gray-500 hover:text-black font-medium flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            View All Posts <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Article Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Published</th>
                <th className="px-6 py-4 text-right">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topPosts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No data available yet.
                  </td>
                </tr>
              ) : (
                topPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          {post.author?.name && (
                            <span className="flex items-center gap-1">
                              <User size={12} /> {post.author.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.category ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {post.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Uncategorized</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500 tabular-nums">
                      {post.publishedAt ? (
                        <div className="flex items-center justify-end gap-1.5">
                           <Calendar size={14} className="text-gray-400" />
                           {new Date(post.publishedAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium">Draft</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-bold text-gray-900 tabular-nums">
                        <Eye size={16} className="text-gray-400" />
                        {post.views.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
