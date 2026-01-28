/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role),
});

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
    revalidatePath("/admin/users");
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, message: "Failed to delete user" };
  }
}
