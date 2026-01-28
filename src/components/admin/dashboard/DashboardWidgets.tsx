import { 
  Edit, 
  FileText, 
  MessageSquare, 
  Users, 
  TrendingUp,
  ArrowRight,
  DollarSign,
  MousePointerClick,
  Percent,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";

interface DashboardComment {
  id: number;
  name: string;
  content: string;
  createdAt: Date | string;
  post?: {
    title: string;
  };
}

export function StatsCards({ stats }: { stats: { label: string; value: string; color: string }[] }) {
  const getIcon = (label: string) => {
    if (label.includes("Post")) return <FileText className="w-5 h-5 text-blue-600" />;
    if (label.includes("Subscriber")) return <Users className="w-5 h-5 text-green-600" />;
    if (label.includes("Comment")) return <MessageSquare className="w-5 h-5 text-orange-600" />;
    return <TrendingUp className="w-5 h-5 text-purple-600" />;
  };

  const getBgColor = (label: string) => {
    if (label.includes("Post")) return "bg-blue-50 border-blue-100 group-hover:bg-blue-100";
    if (label.includes("Subscriber")) return "bg-green-50 border-green-100 group-hover:bg-green-100";
    if (label.includes("Comment")) return "bg-orange-50 border-orange-100 group-hover:bg-orange-100";
    return "bg-purple-50 border-purple-100 group-hover:bg-purple-100";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between group hover:shadow-md transition-all duration-200">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
          </div>
          <div className={`p-3 rounded-xl border transition-colors ${getBgColor(stat.label)}`}>
            {getIcon(stat.label)}
          </div>
        </div>
      ))}
    </div>
  );
}

interface Post {
  id: number;
  title: string;
  status: string;
  createdAt: string | Date;
}

export function RecentPosts({ posts }: { posts: Post[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
        <h3 className="font-bold text-gray-900 text-lg">Recent Posts</h3>
        <Link href="/admin/posts" className="text-sm text-gray-500 hover:text-black font-medium flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50">
          View All <ArrowRight size={16} />
        </Link>
      </div>
      <div className="flex-1 overflow-auto">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center h-full gap-3">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="font-medium">No posts yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {posts.map((post, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-medium text-gray-900 text-sm truncate mb-1">{post.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-400">{new Date(post.createdAt).toLocaleDateString("en-US")}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      post.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {post.status || "DRAFT"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link 
                    href={`/admin/posts/${post.id}`} 
                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-lg transition-all"
                    title="Edit Post"
                  >
                    <Edit size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentsList({ comments }: { comments: DashboardComment[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
        <h3 className="font-bold text-gray-900 text-lg">Recent Comments</h3>
        <Link href="/admin/comments" className="text-sm text-gray-500 hover:text-black font-medium flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50">
          View All <ArrowRight size={16} />
        </Link>
      </div>
      <div className="flex-1 overflow-auto">
        {comments.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center h-full gap-3">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
            <p className="font-medium">No comments yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {comments.map((comment, i) => (
              <div key={i} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors group">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700 font-bold text-xs shrink-0 shadow-sm border border-orange-100">
                  {comment.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start mb-1">
                     <p className="text-sm font-semibold text-gray-900 truncate">{comment.name}</p>
                     <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                       {new Date(comment.createdAt).toLocaleDateString("en-US")}
                     </span>
                   </div>
                   <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{comment.content}</p>
                   {comment.post && (
                     <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 p-1.5 rounded-md border border-gray-100 w-fit max-w-full">
                       <FileText size={12} className="shrink-0" />
                       <span className="truncate max-w-[180px]">{comment.post.title}</span>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdSenseWidget() {
  const posts = [
    { title: "10 Easy and Healthy Dinner Recipes", date: "April 10, 2023" },
    { title: "Low Carb Breakfast Ideas", date: "April 10, 2023" },
    { title: "Best Smoothie Recipes", date: "April 10, 2023" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
        <h3 className="font-bold text-gray-900 text-lg">AdSense Performance</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-3 text-center gap-4 mb-8">
          <div className="bg-green-50/50 p-5 rounded-xl border border-green-100 transition-transform hover:-translate-y-1 duration-200">
            <div className="flex items-center justify-center gap-2 mb-2 text-green-700">
              <div className="p-1.5 bg-green-100 rounded-md">
                <DollarSign size={16} />
              </div>
            </div>
            <p className="text-xs uppercase font-bold tracking-wide text-green-800 mb-1">Revenue</p>
            <p className="text-2xl font-black text-gray-900">$1,245</p>
          </div>
          <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 transition-transform hover:-translate-y-1 duration-200">
            <div className="flex items-center justify-center gap-2 mb-2 text-blue-700">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <MousePointerClick size={16} />
              </div>
            </div>
            <p className="text-xs uppercase font-bold tracking-wide text-blue-800 mb-1">Clicks</p>
            <p className="text-2xl font-black text-gray-900">980</p>
          </div>
          <div className="bg-purple-50/50 p-5 rounded-xl border border-purple-100 transition-transform hover:-translate-y-1 duration-200">
            <div className="flex items-center justify-center gap-2 mb-2 text-purple-700">
              <div className="p-1.5 bg-purple-100 rounded-md">
                <Percent size={16} />
              </div>
            </div>
            <p className="text-xs uppercase font-bold tracking-wide text-purple-800 mb-1">CTR</p>
            <p className="text-2xl font-black text-gray-900">2.3%</p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">Top Performing Pages</h4>
          <div className="space-y-3">
            {posts.map((post, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group border border-transparent hover:border-gray-200 cursor-pointer">
                 <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-green-600 font-bold shrink-0 shadow-sm">
                      <DollarSign size={14} />
                    </div>
                    <div className="min-w-0">
                       <p className="font-semibold text-gray-900 text-sm truncate">{post.title}</p>
                       <p className="text-xs text-gray-500 mt-0.5">Published • {post.date}</p>
                    </div>
                 </div>
                 <div className="flex gap-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-md hover:text-black transition-all"><Edit size={14} /></button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}