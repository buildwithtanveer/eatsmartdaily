"use client";

import { createTag } from "@/app/actions/tags";
import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 font-medium transition-colors"
    >
      {pending ? (
        "Adding..."
      ) : (
        <>
          <Plus size={18} />
          Add Tag
        </>
      )}
    </button>
  );
}

export default function AddTagForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Add New Tag</h2>
      <form
        ref={formRef}
        action={async (formData) => {
          await createTag(formData);
          formRef.current?.reset();
        }}
        className="flex gap-4 items-center"
      >
        <div className="flex-1 max-w-md">
          <input
            name="name"
            className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
            placeholder="Enter tag name..."
            required
            autoComplete="off"
          />
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
