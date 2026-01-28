import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { requireDashboardAccess } from "@/lib/auth";
import { Metadata } from "next";
import { Role } from "@prisma/client";

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
  const userRole = (session.user as any).role as Role;
  const user = {
    ...session.user,
    role: userRole as string
  };

  return (
    <div className="min-h-screen bg-gray-100 flex" suppressHydrationWarning>
      {/* Sidebar */}
      <AdminSidebar role={userRole} />

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
