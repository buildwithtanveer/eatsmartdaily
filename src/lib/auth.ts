import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    redirect("/admin/login");
  }

  return session;
}

export async function requireDashboardAccess() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role: string })?.role as Role | undefined;

  if (!session || !role || role === "USER") {
    redirect("/admin/login");
  }

  return session;
}

export async function requirePermission(allowedRoles: Role[]) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role: string })?.role as Role | undefined;

  if (!session || !role || !allowedRoles.includes(role)) {
    redirect("/admin/dashboard"); // Redirect to dashboard if unauthorized but logged in
  }

  return session;
}

export async function hasPermission(requiredRoles: Role[]) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role: string })?.role as Role | undefined;

  if (!session || !role || !requiredRoles.includes(role)) {
    return false;
  }
  return true;
}
