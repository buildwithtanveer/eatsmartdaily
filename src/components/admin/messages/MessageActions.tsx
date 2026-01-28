"use client";

import { deleteContactMessage, markMessageAsRead } from "@/app/actions/contact";
import { useTransition } from "react";
import { Trash2, MailOpen } from "lucide-react";

export default function MessageActions({ messageId, isRead }: { messageId: number; isRead: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleMarkRead = () => {
    startTransition(async () => {
      await markMessageAsRead(messageId);
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this message?")) {
      startTransition(async () => {
        await deleteContactMessage(messageId);
      });
    }
  };

  return (
    <div className="flex gap-2 justify-end">
      {!isRead && (
        <button
          onClick={handleMarkRead}
          disabled={isPending}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Mark as Read"
        >
          <MailOpen size={16} />
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
