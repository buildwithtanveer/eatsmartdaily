import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { requireDashboardAccess } from "@/lib/auth";
import { Metadata } from "next";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin Dashboard | Eat Smart Daily",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireDashboardAccess();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = Number((session.user as any).id);
  
  // Fetch latest user data to ensure profile image is up to date
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, image: true, role: true }
  });

  const user = {
    name: dbUser?.name || session.user?.name,
    image: dbUser?.image || session.user?.image,
    role: (dbUser?.role || (session.user as any).role) as string
  };

  return (
    <div className="min-h-screen bg-gray-100 flex" suppressHydrationWarning>
      {/* Sidebar */}
      <AdminSidebar role={user.role as Role} />

      {/* Main Content Area */}
      <div className="flex-1 ml-72 flex flex-col min-h-screen" suppressHydrationWarning>
        <AdminHeader user={user} />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
