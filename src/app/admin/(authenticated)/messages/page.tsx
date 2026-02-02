import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MessageActions from "@/components/admin/messages/MessageActions";
import { Mail, MessageSquare } from "lucide-react";
import MessageTable from "@/components/admin/messages/MessageTable";

export default async function MessagesPage(props: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  await requirePermission(["ADMIN", "EDITOR"]);

  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.limit) || 20));
  const search = searchParams.search || "";

  const where: any = search ? {
    OR: [
      { name: { contains: search } },
      { email: { contains: search } },
      { subject: { contains: search } },
      { message: { contains: search } },
    ]
  } : {};

  const [messages, totalMessages] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  const totalPages = Math.ceil(totalMessages / limit);

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Messages</h1>
          <p className="text-gray-500 text-sm">View and manage contact form submissions.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
          Total: {totalMessages}
        </div>
      </div>

      <MessageTable 
        initialMessages={messages as any} 
        pagination={{
          currentPage: page,
          totalPages,
          totalItems: totalMessages,
          limit
        }}
      />
    </div>
  );
}
