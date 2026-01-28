"use client";

import { deleteUser } from "@/app/actions/users";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteUserButton({ userId }: { userId: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      startTransition(async () => {
        const result = await deleteUser(userId);
        if (!result.success) {
          alert("Failed to delete user");
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="Delete User"
    >
      <Trash2 size={16} />
    </button>
  );
}
