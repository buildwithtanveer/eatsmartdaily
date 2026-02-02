import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProfileForm from "@/components/admin/profile/ProfileForm";
import { notFound } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and public profile settings.</p>
      </div>
      
      <ProfileForm user={user} />
    </div>
  );
}
