"use client";

import { deleteSubscriber } from "@/app/actions/newsletter";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export default function NewsletterActions({ subscriberId }: { subscriberId: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to remove this subscriber?")) {
      startTransition(async () => {
        await deleteSubscriber(subscriberId);
      });
    }
  };

  return (
    <div className="flex justify-end">
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Remove Subscriber"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
