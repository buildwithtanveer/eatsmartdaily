import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateUserForm from "@/components/admin/users/CreateUserForm";
import UserTable from "@/components/admin/users/UserTable";

export default async function UsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users</h1>
          <p className="text-gray-500 text-sm">Manage user access and roles.</p>
        </div>
        <CreateUserForm />
      </div>

      <UserTable users={users} />
    </div>
  );
}
