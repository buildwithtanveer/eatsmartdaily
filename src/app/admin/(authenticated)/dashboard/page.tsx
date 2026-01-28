import { requireDashboardAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  StatsCards,
  RecentPosts,
  CommentsList,
  AdSenseWidget,
} from "@/components/admin/dashboard/DashboardWidgets";
import TrafficChart from "@/components/admin/dashboard/TrafficChart";
import UserActivityChart from "@/components/admin/dashboard/UserActivityChart";

export default async function Dashboard() {
  const session = await requireDashboardAccess();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;
  const role = user?.role;
  const userId = parseInt(user?.id);

  // Define filters based on role
  const postFilter = role === "AUTHOR" ? { authorId: userId } : {};
  const commentFilter = role === "AUTHOR" ? { post: { authorId: userId } } : {};
  
  // For authors, we might want to hide subscriber counts or only show if we had author-specific subscriptions (which we likely don't)
  // So for Authors, we'll just show 0 or hide it.
  
  const [postCount, commentCount, subscriberCount, recentPosts, recentComments] = await Promise.all([
    prisma.post.count({ where: postFilter }),
    prisma.comment.count({ where: commentFilter }),
    role === "AUTHOR" ? Promise.resolve(0) : prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.post.findMany({ 
      where: postFilter,
      orderBy: { createdAt: "desc" }, 
      take: 5 
    }),
    prisma.comment.findMany({ 
      where: commentFilter,
      orderBy: { createdAt: "desc" }, 
      take: 5,
      include: { post: { select: { title: true } } } // Include post title for context
    }),
  ]);

  const stats = [
    { label: role === "AUTHOR" ? "My Posts" : "Total Posts", value: postCount.toString(), color: "text-gray-800" },
    { label: "Subscribers", value: role === "AUTHOR" ? "-" : subscriberCount.toString(), color: "text-[#568c2c]" },
    { label: role === "AUTHOR" ? "Comments on My Posts" : "Total Comments", value: commentCount.toString(), color: "text-orange-500" },
    { label: "Active Users", value: "N/A", color: "text-gray-400" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm">Welcome back! Here&apos;s what&apos;s happening with your blog today.</p>
      </div>

      {/* 1. Stats Row */}
      <StatsCards stats={stats} />

      {/* 2. Traffic Overview Chart */}
      {role !== "AUTHOR" && (
        <div className="w-full">
          <TrafficChart />
        </div>
      )}

      {/* 3. Recent Posts & Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-full">
          <RecentPosts posts={recentPosts} />
        </div>
        <div className="lg:col-span-1 h-full">
          <CommentsList comments={recentComments} />
        </div>
      </div>

      {/* 4. AdSense & User Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {role !== "AUTHOR" && (
          <div className="lg:col-span-2 h-full">
            <AdSenseWidget />
          </div>
        )}
        <div className={role !== "AUTHOR" ? "lg:col-span-1 h-full" : "lg:col-span-3 h-full"}>
          <UserActivityChart />
        </div>
      </div>
    </div>
  );
}
