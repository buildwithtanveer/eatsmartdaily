import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MessageActions from "@/components/admin/messages/MessageActions";
import { Mail, MessageSquare } from "lucide-react";

export default async function MessagesPage() {
  await requirePermission(["ADMIN", "EDITOR"]);

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Messages</h1>
          <p className="text-gray-500 text-sm">View and manage contact form submissions.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
          Total: {messages.length}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[20%]">From</th>
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[40%]">Subject & Message</th>
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[15%]">Date</th>
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[10%]">Status</th>
                <th className="p-4 text-right font-bold text-gray-500 text-xs uppercase tracking-wider w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="font-medium text-gray-900 text-lg">No messages found</p>
                      <p className="text-sm text-gray-500">New contact form submissions will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg.id} className={`hover:bg-gray-50/80 transition-colors group ${!msg.read ? "bg-blue-50/20" : ""}`}>
                    <td className="p-4 align-top">
                      <div className="font-semibold text-gray-900">{msg.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Mail size={12} /> {msg.email}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className={`font-medium mb-1 ${!msg.read ? "text-gray-900" : "text-gray-700"}`}>
                        {msg.subject || "(No Subject)"}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{msg.message}</p>
                    </td>
                    <td className="p-4 align-top text-sm text-gray-500 font-medium whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString("en-US")}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      {!msg.read ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          NEW
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          READ
                        </span>
                      )}
                    </td>
                    <td className="p-4 align-top text-right">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MessageActions messageId={msg.id} isRead={msg.read} />
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
