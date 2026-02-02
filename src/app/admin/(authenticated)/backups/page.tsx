import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BackupCreateForm from "@/components/admin/backups/BackupCreateForm";
import BackupList from "@/components/admin/backups/BackupList";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import AdminTableFooter from "@/components/admin/AdminTableFooter";

export default async function BackupManagementPage(props: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  await requirePermission(["ADMIN"]);

  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.limit) || 20));
  const search = searchParams.search || "";

  const where = search ? {
    OR: [
      { filename: { contains: search } },
      { description: { contains: search } },
    ]
  } : {};

  const [backups, totalBackups] = await Promise.all([
    prisma.backup.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        editor: {
          select: { id: true, name: true, email: true }
        }
      }
    }),
    prisma.backup.count({ where }),
  ]);

  const totalPages = Math.ceil(totalBackups / limit);

  // Convert BigInt size to string for serialization
  const serializedBackups = backups.map(backup => ({
    ...backup,
    size: backup.size.toString(),
  }));

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Backup History</h1>
          <p className="text-gray-500 text-sm">Create and manage system backups.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
          Total: {totalBackups}
        </div>
      </div>

      <BackupCreateForm />
      
      <AdminTableToolbar searchPlaceholder="Search backups..." />

      <BackupList backups={serializedBackups} />
      
      <AdminTableFooter 
        currentPage={page} 
        totalPages={totalPages} 
        totalItems={totalBackups} 
        limit={limit} 
      />
    </div>
  );
}
