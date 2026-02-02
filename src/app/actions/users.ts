/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logActivity } from "@/lib/activity";

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role),
});

const UpdateProfileSchema = z.object({
  name: z.string().min(2),
  bio: z.string().max(500).optional().or(z.literal("")),
  jobTitle: z.string().max(100).optional().or(z.literal("")),
  socialFacebook: z.string().url().optional().or(z.literal("")),
  socialTwitter: z.string().url().optional().or(z.literal("")),
  socialInstagram: z.string().url().optional().or(z.literal("")),
  socialLinkedin: z.string().url().optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
});

export async function updateProfile(_prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { message: "Unauthorized" };
  const userId = Number((session.user as any).id);

  const validatedFields = UpdateProfileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
    jobTitle: formData.get("jobTitle"),
    socialFacebook: formData.get("socialFacebook"),
    socialTwitter: formData.get("socialTwitter"),
    socialInstagram: formData.get("socialInstagram"),
    socialLinkedin: formData.get("socialLinkedin"),
    image: formData.get("image"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: validatedFields.data,
    });

    revalidatePath("/admin/profile");
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Update profile error:", error);
    return { message: "Failed to update profile" };
  }
}

export async function updateUserRole(userId: number, newRole: Role) {
  await requireAdmin();

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
    revalidatePath("/admin/users");
    return { success: true, message: "Role updated successfully" };
  } catch {
    return { success: false, message: "Failed to update role" };
  }
}

export async function createUser(_prevState: any, formData: FormData) {
  await requireAdmin();

  const validatedFields = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  const { name, email, password, role } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { message: "User with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User created successfully" };
  } catch (error) {
    console.error("Create user error:", error);
    return { message: "Failed to create user" };
  }
}

export async function deleteUser(userId: number) {
  const session = await requireAdmin();
  const currentUserId = Number((session.user as any).id);

  if (userId === currentUserId) {
    return { success: false, message: "You cannot delete your own account" };
  }

  try {
    // Check if user has posts
    const postCount = await prisma.post.count({ where: { authorId: userId } });
    if (postCount > 0) {
      return { 
        success: false, 
        message: `Cannot delete user. They have ${postCount} posts. Please reassign or delete their posts first.` 
      };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    await logActivity(currentUserId, "DELETE_USER", "User", { userId });

    revalidatePath("/admin/users");
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, message: "Failed to delete user" };
  }
}
