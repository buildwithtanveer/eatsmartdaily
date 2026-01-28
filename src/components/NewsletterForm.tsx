"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/app/actions/newsletter";

export default function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(subscribeNewsletter, null);

  return (
    <div className="w-full">
      {state?.success ? (
        <div className="bg-green-100 text-green-800 p-4 rounded text-center">
          <p className="font-bold">Subscribed!</p>
          <p className="text-sm">Thank you for joining our newsletter.</p>
        </div>
      ) : (
        <form action={formAction} className="flex gap-2">
          <div className="flex-1">
            <input
              type="email"
              name="email"
              placeholder="Your Email Address"
              required
              className="w-full border p-2 rounded text-sm focus:outline-none focus:border-green-600"
            />
            {state?.errors?.email && (
              <p className="text-red-500 text-xs mt-1 absolute">{state.errors.email[0]}</p>
            )}
            {state?.message && !state?.success && (
               <p className="text-red-500 text-xs mt-1 absolute">{state.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-orange-400 text-white px-6 py-2 rounded font-bold hover:bg-orange-500 disabled:opacity-50"
          >
            {isPending ? "..." : "GO"}
          </button>
        </form>
      )}
    </div>
  );
}
