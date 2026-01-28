import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Activity, User, PlusCircle, Edit, Trash2, LogIn } from "lucide-react";

export default async function ActivityLogPage() {
  await requireAdmin();

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  const getActionIcon = (action: string) => {
    if (action.includes("CREATE")) return <PlusCircle size={16} className="text-green-600" />;
    if (action.includes("UPDATE")) return <Edit size={16} className="text-blue-600" />;
    if (action.includes("DELETE")) return <Trash2 size={16} className="text-red-600" />;
    if (action.includes("LOGIN")) return <LogIn size={16} className="text-purple-600" />;
    return <Activity size={16} className="text-gray-600" />;
  };

  const getActionStyle = (action: string) => {
    if (action.includes("CREATE")) return "bg-green-50 text-green-700 border-green-200";
    if (action.includes("UPDATE")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (action.includes("DELETE")) return "bg-red-50 text-red-700 border-red-200";
    if (action.includes("LOGIN")) return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Activity Log</h1>
          <p className="text-gray-500 text-sm">Track system events and user actions (Last 100).</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
          Total: {logs.length}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="p-4 w-48 text-xs uppercase tracking-wider">Date</th>
                <th className="p-4 w-64 text-xs uppercase tracking-wider">User</th>
                <th className="p-4 w-40 text-xs uppercase tracking-wider">Action</th>
                <th className="p-4 w-40 text-xs uppercase tracking-wider">Resource</th>
                <th className="p-4 text-xs uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                        <Activity className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="font-medium">No activity logs found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                          {log.user?.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={log.user.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={14} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 text-sm">{log.user?.name || "System"}</span>
                          <span className="text-xs text-gray-400">{log.user?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getActionStyle(log.action)}`}>
                        {getActionIcon(log.action)}
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {log.resource}
                    </td>
                    <td className="p-4 text-gray-500 max-w-md truncate" title={log.details || ""}>
                      {log.details || "-"}
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
