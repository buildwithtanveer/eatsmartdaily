"use client";

import { deleteTag, updateTag } from "@/app/actions/tags";
import { useTransition, useState } from "react";
import { Trash2, Edit2, Check, X } from "lucide-react";

interface Tag {
  id: number;
  name: string;
  slug: string;
}

export default function TagRow({ tag }: { tag: Tag }) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(tag.name);

  const handleUpdate = () => {
    if (editName.trim() === tag.name) {
      setIsEditing(false);
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", editName);
      const result = await updateTag(tag.id, formData);
      if (result.success) {
        setIsEditing(false);
      } else {
        alert("Failed to update tag");
      }
    });
  };

  return (
    <tr className="border-b hover:bg-gray-50 transition-colors">
      <td className="p-4">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUpdate();
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditName(tag.name);
              }
            }}
          />
        ) : (
          <span className="font-medium text-gray-900">{tag.name}</span>
        )}
      </td>
      <td className="p-4 text-gray-500">{tag.slug}</td>
      <td className="p-4 text-right">
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleUpdate}
                disabled={isPending}
                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(tag.name);
                }}
                disabled={isPending}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this tag?")) {
                    startTransition(async () => {
                      await deleteTag(tag.id);
                    });
                  }
                }}
                disabled={isPending}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Delete"
              >
                {isPending ? "..." : <Trash2 className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
