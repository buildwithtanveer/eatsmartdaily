import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateUserForm from "@/components/admin/users/CreateUserForm";
import UserTable from "@/components/admin/users/UserTable";

export default async function UsersPage(props: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  await requireAdmin();

  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.limit) || 20));
  const search = searchParams.search || "";

  const where: any = search ? {
    OR: [
      { name: { contains: search } },
      { email: { contains: search } },
    ]
  } : {};

  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users</h1>
          <p className="text-gray-500 text-sm">Manage user access and roles.</p>
        </div>
        <CreateUserForm />
      </div>

      <UserTable 
        users={users} 
        pagination={{
          currentPage: page,
          totalPages,
          totalItems: totalUsers,
          limit
        }}
      />
    </div>
  );
}
